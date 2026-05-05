var imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map("map", {
  center: [43.603096138976234, -92.91050094266117],
  zoom: 17,
    minZoom: 17,
   maxZoom: 18,
    maxBounds: [
    [42.0, -93.0], // southwest corner
    [46.0, -87.0]  // northeast corner
  ],
  layers: imagery
});

fetch('fields/field1.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#0066ff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0
      }
    }).addTo(map);

    // Display acreage in legend
    const acres = data.properties?.acres || 'N/A';
    document.querySelectorAll('.acreage-value').forEach(el => {
      el.innerHTML = `<b>${acres} acres</b>`;
    });
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

  document.querySelectorAll('.moisture-value').forEach(el => {
  el.innerHTML = `
    <b>${(latest * 100).toFixed(1)}%</b><br>
    <small>As of ${time}</small>
   `;
  });
}
getSoilMoisture();

var rasterLayers = {};

// Load NDVI - assigned to a variable
const ndviPromise = fetch('field_maps/South_field_NDVI.tif') //when saveing from ArcGIS Pro save it outside of GDB and add .tif at the end
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => parseGeoraster(arrayBuffer))
  .then(georaster => {
    rasterLayers['NDVI'] = new GeoRasterLayer({
      georaster: georaster,
      opacity: 0.8,
      resolution: 128,
      pixelValuesToColorFn: function(values) {
        const v = values[0];
        if (v === georaster.noDataValue || v === null || v === -9999) return null;
        if (v >= 0.7)  return '#1a9641';
        if (v >= 0.5)  return '#74c476';
        if (v >= 0.3)  return '#f1ffa4';
        if (v >= 0.1)  return '#ffff2d';
        if (v >= 0.0)  return '#fdae61';
        return '#d7191c';
      }
    });
  })
  .catch(err => console.log('NDVI error:', err));

// Load pH - assigned to a variable
const phPromise = fetch('field_maps/South_field_pH.tif') //when saveing from ArcGIS Pro save it outside of GDB and add .tif at the end
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => parseGeoraster(arrayBuffer))
  .then(georaster => {
    rasterLayers['pH'] = new GeoRasterLayer({
      georaster: georaster,
      opacity: 0.8,
      resolution: 128,
      pixelValuesToColorFn: function(values) {
        const v = values[0];
        if (v === georaster.noDataValue || v === null || v === -9999) return null;
        if (v >= 7.2)  return '#2166ac';
        if (v >= 7.0)  return '#74add1';
        if (v >= 6.8)  return '#abd9e9';
        if (v >= 6.6)  return '#ffffbf';
        return '#fdae61';
      }
    });
  })
  .catch(err => console.log('pH error:', err));

// Load soil sample locations
const soilSamplePromise = fetch('field_maps/soil_sample_locations.geojson')
  .then(res => res.json())
  .then(data => {
    rasterLayers['soilSamples'] = L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 3,
          color: 'white',
          weight: 1,
          fillColor: '#8B4513',
          fillOpacity: 0.8,
          pane: 'markerPane'
        });
      }
    });
  })
  .catch(err => console.log('Soil samples error:', err));

//Load RGB - later
//const rgbPromise = fetch('field_maps/South_field_RGB.tif')
//  .then(response => response.arrayBuffer())
//  .then(arrayBuffer => parseGeoraster(arrayBuffer))
//  .then(georaster => {
//   rasterLayers['RGB'] = new GeoRasterLayer({
//      georaster: georaster,
//      opacity: 0.8,
//      resolution: 256
//    });
//  })
//  .catch(err => console.log('RGB error:', err));

Promise.all([ndviPromise, phPromise, soilSamplePromise]).then(() => {
  rasterLayers['NDVI'].addTo(map);
  rasterLayers['pH'].addTo(map);
  rasterLayers['soilSamples'].addTo(map);

  rasterLayers['pH'].getContainer().style.display = 'none';
    // Hide soil samples using Leaflet's remove instead
  map.removeLayer(rasterLayers['soilSamples']);              // how can i remove soil samples (only on when you toggle)
 

  document.getElementById('toggleNDVI-desktop').checked = true;
  document.getElementById('toggleNDVI-mobile').checked = true;

  document.querySelectorAll('.layer-toggle').forEach(radio => {
    radio.addEventListener('change', function() {
      const selected = this.dataset.layer;

      Object.keys(rasterLayers).forEach(key => {
        const layer = rasterLayers[key];
        if (key === selected) {
          // Show selected layer
          if (layer.getContainer) {
            layer.getContainer().style.display = 'block';
          } else {
            layer.addTo(map);
          }
        } else {
          // Hide other layers
          if (layer.getContainer) {
            layer.getContainer().style.display = 'none';
          } else {
            map.removeLayer(layer);
          }
        }
      });

      // Sync other sidebar
      const otherName = this.name === 'mapLayerDesktop' ? 'mapLayerMobile' : 'mapLayerDesktop';
      const otherRadio = document.querySelector(`input[name="${otherName}"][data-layer="${selected}"]`);
      if (otherRadio) otherRadio.checked = true;
    });
  });
});


// area of concern?
// in depth about tab - change description box in field1
// soil sample and acres do not load inside of mobile tab

// add DSM for elevation and wet spot detection (need cloud storage and fetch)
// add RGB (need cloud storage and fetch)

// ArcGIS Pro notes
// add GeoJSON to GDB and do JSON to Feature 
// add soil sample data and locations 
// locations created using the fishnet tool (2.5 acres x 2.5 acreas) on the JSON feature and then clipping the dots to the field extent 
// output as GeoJSON so locations can be added to webmap
// add join fishnet locations to soil sample data
// perform a kriging interpolation on soil sample data and locations
// add NDVI from pix4D and clip raster to field extent (might need to resample or figure out cloud storage)
// export rasters inside of clip (both NDVI and pH) (from ArcGIS Pro save it outside of GDB and add .tif at the end)

