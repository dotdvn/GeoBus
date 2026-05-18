const fs = require('fs');
const path = require('path');

const geojsonPath = path.join(__dirname, '..', 'geobus.geojson');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'stations.json');

try {
  console.log('Loading geojson from:', geojsonPath);
  const rawData = fs.readFileSync(geojsonPath, 'utf8');
  const geojson = JSON.parse(rawData);

  if (!geojson.features || !Array.isArray(geojson.features)) {
    throw new Error('Invalid GeoJSON structure: missing features array');
  }

  console.log(`Found ${geojson.features.length} features. Parsing...`);

  const stations = [];
  const seenNames = new Set();

  geojson.features.forEach((feature, index) => {
    const props = feature.properties || {};
    const geom = feature.geometry || {};

    // Get name
    let name = props.name || props.alt_name || props["name:en"];
    if (!name) return; // Skip features without a name

    // Clean up name
    name = name.trim();

    // Skip duplicates to keep search clean (if they are in the exact same coordinates)
    const lat = geom.coordinates ? geom.coordinates[1] : null;
    const lng = geom.coordinates ? geom.coordinates[0] : null;
    
    if (lat === null || lng === null) return; // Skip if no coordinates

    const nameMl = props["name:ml"] || '';
    
    // Determine district/city
    let district = props.is_in || props["addr:city"] || '';
    // Clean up district (e.g. "Trissur Distt." -> "Thrissur", "Kochi" -> "Ernakulam", etc.)
    district = district.replace(/Distt\./gi, 'District').replace(/Dist\./gi, 'District').trim();
    if (!district) {
      // Infuse default district based on coordinates or names if possible, but empty is fine.
      if (name.toLowerCase().includes('thrissur')) district = 'Thrissur';
      else if (name.toLowerCase().includes('kochi') || name.toLowerCase().includes('vyttila')) district = 'Ernakulam';
      else if (name.toLowerCase().includes('trivandrum') || name.toLowerCase().includes('thampanoor')) district = 'Thiruvananthapuram';
      else if (name.toLowerCase().includes('kozhikode') || name.toLowerCase().includes('calicut')) district = 'Kozhikode';
    }

    // Build aliases for search
    const aliasesSet = new Set();
    
    // Add original name components
    aliasesSet.add(name);
    
    // Add Malayalam name if exists
    if (nameMl) {
      aliasesSet.add(nameMl);
    }
    
    // Add alt names & short names
    const altNames = [
      props.alt_name,
      props.alt_name_1,
      props.alt_name_2,
      props["alt_name:en"],
      props.short_name,
      props.ref,
      props.local_ref
    ].filter(Boolean);

    altNames.forEach(alt => {
      aliasesSet.add(alt.trim());
    });

    const aliases = Array.from(aliasesSet);

    stations.push({
      id: props["@id"] || `station-${index}`,
      name,
      nameMl: nameMl || undefined,
      district: district || undefined,
      lat,
      lng,
      aliases
    });
  });

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(outputPath, JSON.stringify(stations, null, 2), 'utf8');
  console.log(`Successfully parsed and saved ${stations.length} stations to: ${outputPath}`);

} catch (err) {
  console.error('Error parsing GeoJSON:', err);
  process.exit(1);
}
