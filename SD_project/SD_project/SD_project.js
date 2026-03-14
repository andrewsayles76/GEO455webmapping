var streets =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map("map", {
  center: [44.24714750034925, -96.9620608424883],
  zoom: 7,
  layers: streets
});



var plots = 
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {"name": "Lake Vermillion",
        "link": "https://example.com/brookings-map"},
      "geometry": {
        "coordinates": [
          -97.18772341390356, 
          43.59419044692422
        ],
        "type": "Point"
      }
    },
        {
      "type": "Feature",
      "properties": {"name": "Example Field",
        "link": "https://example.com/brookings-map"},
      "geometry": {
        "coordinates": [
          -92.90927087651676, 43.60446703028872
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {"name": "Britton",
        "link": "https://example.com/brookings-map"},
      "geometry": {
        "coordinates": [
         -97.65193132174734, 
          45.80528173708834
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {"name": "Watertown",
        "link": "https://example.com/brookings-map"},
      "geometry": {
        "coordinates": [
          -97.12115558645932,
           44.90123861599867
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {"name": "Hitchcock",
        "link": "https://example.com/brookings-map"},
      "geometry": {
        "coordinates": [
         -98.40853970809741, 
           44.630116038588675
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {"name": "Pukwana",
        "link": "https://example.com/brookings-map"},
      "geometry": {
        "coordinates": [
        -99.18827726952325,  
          43.779556817180165
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {"name": "Pipestone",
        "link": "https://example.com/brookings-map"},
      "geometry": {
        "coordinates": [
          -96.31353239283041,
           43.99807186784828
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {"name": "Minneota",
        "link": "https://example.com/brookings-map"},
      "geometry": {
        "coordinates": [
        -95.99255172897101, 
          44.56185237092562
        ],
        "type": "Point"
      }
    }
  ]
};

var imageUrl = "../example_map.png";

var imageBounds = [
    [43.60437414576332, -92.91281070055166],  // top-left (northwest)
    [43.60172095521328, -92.90878823926458]   // bottom-right (southeast)
];

L.imageOverlay(imageUrl, imageBounds).addTo(map);

L.geoJSON(plots, {

  onEachFeature: function(feature, layer) {

    layer.bindTooltip(feature.properties.name);

    layer.on("click", function(e) {
      map.flyTo(e.latlng, 18);
    });

  }

}).addTo(map);



/* Layer control and Menu Item */
var baseLayers = {
  'Streetmap': streets,  
  'Satellite Imagery': imagery,
        };

var overlays = {};

var layerControl = L.control.layers(baseLayers, overlays, {collapsed: false}).addTo(map);

/* Locate control */
console.log(L.control.locate);
L.control.locate().addTo(map);









