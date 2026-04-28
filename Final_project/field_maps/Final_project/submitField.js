var imagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 20,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

var map = L.map("map", {
  center: [43.70511853302355, -91.53441376030487],
  zoom: 7,
  layers: imagery
});

// DRAW TOOL //
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    polyline: false,
    rectangle: false,
    circle: false,
    circlemarker: false,
    marker: false
  },
  edit: {
    featureGroup: drawnItems
  }
});
map.addControl(drawControl);

// convert polygons to GeoJSON //
map.on(L.Draw.Event.CREATED, function(e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  // Calculate area in square meters then convert to acres
  const areaM2 = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
  const acres = (areaM2 * 0.000247105).toFixed(2);

  // Save acreage into the GeoJSON properties
  const geojson = layer.toGeoJSON();
  geojson.properties.acres = acres;
  geojson.properties.name = prompt('Enter a name for this field:');

  // Download as .geojson
  const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${geojson.properties.name}.geojson`;
  a.click();
  URL.revokeObjectURL(a.href);

  // Show acreage in an alert
  alert(`Field area: ${acres} acres`);
});