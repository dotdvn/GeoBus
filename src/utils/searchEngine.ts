export interface Station {
  id: string;
  name: string;
  nameMl?: string;
  district?: string;
  lat: number;
  lng: number;
  aliases: string[];
}

/**
 * Intelligent station search engine.
 * Ranks startsWith matches first, contains matches second, sorted alphabetically, limited to 8 items.
 * Seamlessly supports mixed English and Malayalam scripts.
 */
export function searchStations(query: string, stations: Station[]): Station[] {
  if (!query) return [];
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length === 0) return [];

  const scored: { station: Station; score: number }[] = [];

  for (const station of stations) {
    let bestScore = Infinity; // Lower is better (1 = startsWith, 2 = contains)

    // Check English Name
    const nameLower = station.name.toLowerCase();
    if (nameLower.startsWith(cleanQuery)) {
      bestScore = Math.min(bestScore, 1);
    } else if (nameLower.includes(cleanQuery)) {
      bestScore = Math.min(bestScore, 2);
    }

    // Check Malayalam Name
    if (station.nameMl) {
      const mlLower = station.nameMl.toLowerCase();
      if (mlLower.startsWith(cleanQuery)) {
        bestScore = Math.min(bestScore, 1);
      } else if (mlLower.includes(cleanQuery)) {
        bestScore = Math.min(bestScore, 2);
      }
    }

    // Check Aliases (short names, alternate spellings, etc.)
    if (station.aliases && station.aliases.length > 0) {
      for (const alias of station.aliases) {
        const aliasLower = alias.toLowerCase();
        if (aliasLower.startsWith(cleanQuery)) {
          bestScore = Math.min(bestScore, 1);
        } else if (aliasLower.includes(cleanQuery)) {
          bestScore = Math.min(bestScore, 2);
        }
      }
    }

    if (bestScore < Infinity) {
      scored.push({ station, score: bestScore });
    }
  }

  // Sorting logic: Primary: match depth score (startsWith beats contains). Secondary: alphabetical.
  scored.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return a.station.name.localeCompare(b.station.name);
  });

  return scored.map(s => s.station).slice(0, 8);
}

/**
 * Haversine formula to compute great-circle distance between two points in kilometers.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Find nearby stations relative to current coordinates.
 */
export function getNearbyStations(
  lat: number,
  lng: number,
  stations: Station[],
  limit = 3
): (Station & { distance: number })[] {
  const withDistance = stations.map(station => ({
    ...station,
    distance: calculateDistance(lat, lng, station.lat, station.lng)
  }));
  
  withDistance.sort((a, b) => a.distance - b.distance);
  return withDistance.slice(0, limit);
}
