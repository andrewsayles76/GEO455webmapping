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
  center: [43.70511853302355, -91.53441376030487],
  zoom: 7,
  layers: imagery
});

imagery.addTo(map);
terrainLines.addTo(map);
terrainLabels.addTo(map);

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