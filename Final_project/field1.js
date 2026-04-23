var imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var terrainLabels = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});
var terrainLines = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_lines/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
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

imagery.addTo(map);
terrainLines.addTo(map);
terrainLabels.addTo(map);

// Create legend control
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h4>NDVI</h4>
    <p>...</p>
    <h4>Soil pH</h4>
    <p>...</p>
    <h4>Soil Moisture (3-9cm)</h4>
    <p id="moisture-value">Loading...</p>
    <hr style="border-color:#777; margin: 6px 0">
    <h4>Field Info</h4>
    <p>Acreage: <span id="acreage-value">Loading...</span></p>
    <hr style="border-color:#777; margin: 6px 0">
  `;
  return div;
};
legend.addTo(map);

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

// Define bounds //
var imageBounds = [
    [43.60437414576332, -92.91281070055166],  // northwest
    [43.60172095521328, -92.90878823926458]   // southeast
];

// Define each as an imageOverlay layer //
var NDVI = L.imageOverlay('field_maps/ndvi.png', imageBounds);
var pH = L.imageOverlay('field_maps/pH.png', imageBounds);              // later add more/all soil sample properties //

// Then add to layer control // 
var overlays = {
  'NDVI': NDVI,
  'pH': pH,
};

var layerControl = L.control.layers(overlays, null, { collapsed: false }).addTo(map);

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
