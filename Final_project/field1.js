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

// Define bounds //
var imageBounds = [
  [43.60437414576332, -92.91281070055166],
  [43.60172095521328, -92.90878823926458]
];

var NDVI = L.imageOverlay('field_maps/ndvi.png', imageBounds);
var pH = L.imageOverlay('field_maps/pH.png', imageBounds);

// Then your toggle listener
const layers = { NDVI, pH };

document.querySelectorAll('.layer-toggle').forEach(radio => {
  radio.addEventListener('change', function() {
    Object.values(layers).forEach(layer => map.removeLayer(layer));
    map.addLayer(layers[this.dataset.layer]);
  });
});

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


// pie chart and raster layers
// Store layers here once loaded
var rasterLayers = {};

async function loadRaster(name, path, colorFn, categories) {
  const response = await fetch(path);
  const arrayBuffer = await response.arrayBuffer();
  const georaster = await parseGeoraster(arrayBuffer);

  // Add to map
  rasterLayers[name] = new GeoRasterLayer({
    georaster: georaster,
    opacity: 0.7,
    pixelValuesToColorFn: colorFn
  });

  // Build pie chart from same data
  buildPieChart(name, arrayBuffer, categories);
}

async function buildPieChart(name, arrayBuffer, categories) {
  const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();
  const data = await image.readRasters();
  const pixels = data[0];

  // Count pixels per category
  let counts = new Array(categories.length).fill(0);
  let noData = 0;

  for (let i = 0; i < pixels.length; i++) {
    const val = pixels[i];
    if (val === -9999 || val === 0) { noData++; continue; }
    for (let c = 0; c < categories.length; c++) {
      if (val >= categories[c].min && val < categories[c].max) {
        counts[c]++;
        break;
      }
    }
  }

  const total = pixels.length - noData;
  const toPercent = count => ((count / total) * 100).toFixed(1);

  var ctx = document.getElementById(`${name}Chart`).getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories.map((c, i) => `${c.label} ${toPercent(counts[i])}%`),
      datasets: [{
        data: counts.map(c => toPercent(c)),
        backgroundColor: categories.map(c => c.color)
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: 'white', font: { size: 11 } }
        }
      }
    }
  });
}

// Load all rasters
async function loadAllRasters() {
  await loadRaster(
    'NDVI',
    'field_maps/South_field_NDVI.tif',
    function(values) {
      const v = values[0];
      if (v === -9999) return null;
      if (v >= 0.6)   return '#1a9641';
      if (v >= 0.3)   return '#a6d96a';
      if (v >= 0.1)   return '#ffffbf';
      return '#d7191c';
    },
    [
      { label: 'Healthy (≥0.6)',    min: 0.6,  max: Infinity, color: '#1a9641' },
      { label: 'Moderate (0.3-0.6)', min: 0.3, max: 0.6,      color: '#a6d96a' },
      { label: 'Low (0.1-0.3)',      min: 0.1, max: 0.3,      color: '#ffffbf' },
      { label: 'Bare (<0.1)',        min: -1,  max: 0.1,      color: '#d7191c' }
    ]
  );

  await loadRaster(
    'pH',
    'field_maps/South_field_pH.tif',
    function(values) {
      const v = values[0];
      if (v === -9999) return null;
      if (v >= 7)     return '#2166ac';
      if (v >= 6)     return '#74add1';
      if (v >= 5)     return '#fdae61';
      return '#d73027';
    },
    [
      { label: 'Alkaline (≥7)',      min: 7,   max: Infinity, color: '#2166ac' },
      { label: 'Neutral (6-7)',       min: 6,   max: 7,        color: '#74add1' },
      { label: 'Slightly Acidic (5-6)', min: 5, max: 6,       color: '#fdae61' },
      { label: 'Acidic (<5)',         min: -1,  max: 5,        color: '#d73027' }
    ]
  );

  // Wire up toggles after rasters loaded
  document.querySelectorAll('.layer-toggle').forEach(radio => {
    radio.addEventListener('change', function() {
      Object.values(rasterLayers).forEach(layer => map.removeLayer(layer));
      map.addLayer(rasterLayers[this.dataset.layer]);
    });
  });
}

loadAllRasters();


// add rasters!!! add cloud fetching!!! Grid points for soil sample locations???
// area of concern?
// about tab = need more infor