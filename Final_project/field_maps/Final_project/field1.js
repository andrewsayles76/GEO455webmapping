var imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map("map", {
  center: [43.603096138976234, -92.91050094266117],
  zoom: 17,
    minZoom: 17,
    maxBounds: [
    [42.0, -93.0], // southwest corner
    [46.0, -87.0]  // northeast corner
  ],
  layers: imagery
});

//fetch drawn field GeoJSON // 
fetch('fields/field1.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data).addTo(map);

    // Display acreage in legend
    const acres = data.properties?.acres || 'N/A';
    document.getElementById('acreage-value').innerHTML = `<b>${acres} acres</b>`;
  })
  .catch(err => console.log('No field boundary found'));

// Home Button //
var homeCenter = map.getCenter();

var homeZoom = map.getZoom();

L.easyButton(('<img src="Home_icon_black.png", height=70%>'), function () {
  map.setView(homeCenter, homeZoom);
}, "Home").addTo(map);

// Locate control //
console.log(L.control.locate);
L.control.locate().addTo(map);

// Fetch soil moisture and update legend //                   // !!will need to figure out how to make it so lat and long changes to new polygon //
async function getSoilMoisture() {
  const url = 'https://api.open-meteo.com/v1/forecast' +
    '?latitude=43.60437414576332' +
    '&longitude=-92.91281070055166' +
    '&hourly=soil_moisture_3_to_9cm' +
    '&timezone=America%2FChicago';

  const response = await fetch(url);
  const data = await response.json();

  const latest = data.hourly.soil_moisture_3_to_9cm[0];
  const time = data.hourly.time[0];

  document.getElementById('moisture-value').innerHTML = `
    <b>${(latest * 100).toFixed(1)}%</b><br>
    <small>As of ${time}</small>
  `;
}
getSoilMoisture();

// Store raster layers globally
var rasterLayers = {};

// Load NDVI
fetch('https://drive.google.com/uc?export=download&id=1cdIyNlt4CoEcSYih-Cjptq2QzBgy9pqq')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => parseGeoraster(arrayBuffer))
  .then(georaster => {
    rasterLayers['NDVI'] = new GeoRasterLayer({
      georaster: georaster,
      opacity: 0.8,
      pixelValuesToColorFn: function(values) {
        const v = values[0];
        if (v === georaster.noDataValue || v === null) return null;
        if (v >= 0.6)  return '#1a9641';
        if (v >= 0.4)  return '#74c476';
        if (v >= 0.2)  return '#a6d96a';
        if (v >= 0.1)  return '#ffffbf';
        if (v >= 0.0)  return '#fdae61';
        return '#d7191c';
      }
    });
    map.fitBounds(rasterLayers['NDVI'].getBounds());
  })
  .catch(err => console.log('NDVI error:', err));

// Load pH
fetch('field_maps/South_field_pH.tif')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => parseGeoraster(arrayBuffer))
  .then(georaster => {
    rasterLayers['pH'] = new GeoRasterLayer({
      georaster: georaster,
      opacity: 0.8,
      pixelValuesToColorFn: function(values) {
        const v = values[0];
        if (v === georaster.noDataValue || v === null || v === -9999) return null;
        if (v >= 7.2)  return '#2166ac'; // slightly alkaline
        if (v >= 7.0)  return '#74add1'; // neutral high
        if (v >= 6.8)  return '#abd9e9'; // neutral
        if (v >= 6.6)  return '#ffffbf'; // neutral low
        return '#fdae61';                // slightly acidic
      }
    });
  })
  .catch(err => console.log('pH error:', err));

// Wire up toggles
document.querySelectorAll('.layer-toggle').forEach(radio => {
  radio.addEventListener('change', function() {
    // Remove all raster layers
    Object.values(rasterLayers).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    // Add selected one
    const selected = rasterLayers[this.dataset.layer];
    if (selected) selected.addTo(map);
  });
});

// add rasters!!! add cloud fetching!!! Grid points for soil sample locations???
// area of concern?
//pie chart later
// add RBG drone imagery