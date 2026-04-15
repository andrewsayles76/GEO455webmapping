function getColorDensity(d) {
    return d > 10219 ? '#011009' :
            d > 5623 ? '#006837' :
           d > 3253  ? '#31a354' :
           d > 1506  ? '#78c679' :
           d > 686   ? '#c2e699' :
                       '#ffffcc';
}

var data = [
{from:[-87.81686988, 41.840124],to:[-89.3985, 43.0731], labels:["Cook County", "Dane County"],color:"#ffffcc",value:407.0},
{from:[-88.0035653, 42.32324044],to:[-89.3985, 43.0731],labels:["Lake County", "Dane County"],color:"#ffffcc",value:103.0},
{from:[-89.16086988, 42.33626224],to:[-89.3985, 43.0731],labels:["Winnebago County IL", "Dane County"],color:"#ffffcc",value:492.0},
{from:[-89.77039901, 43.96954009],to:[-89.3985, 43.0731],labels:["Adams County", "Dane County"],color:"#ffffcc",value:260.0},
{from:[-89.3337364, 43.46660808],to:[-89.3985, 43.0731],labels:["Columbia County", "Dane County"],color:"#006837",value:10219.0},
{from:[-88.70750683, 43.41629502],to:[-89.3985, 43.0731],labels:["Dodge County", "Dane County"],color:"#78c679",value:2340.0},
{from:[-88.48826325, 43.75358946],to:[-89.3985, 43.0731],labels:["Fond du Lac County", "Dane County"],color:"#ffffcc",value:269.0},
{from:[-90.7062206, 42.86748193],to:[-89.3985, 43.0731],labels:["Grant County", "Dane County"],color:"#ffffcc",value:408.0},
{from:[-89.60222179, 42.68000893],to:[-89.3985, 43.0731],labels:["Green County", "Dane County"],color:"#31a354",value:5452.0},
{from:[-89.04485972, 43.80037896],to:[-89.3985, 43.0731],labels:["Green Lake County", "Dane County"],color:"#ffffcc",value:111.0},
{from:[-90.13538397, 43.00047443],to:[-89.3985, 43.0731],labels:["Iowa County", "Dane County"],color:"#78c679",value:3253.0},
{from:[-88.77586582, 43.02081427],to:[-89.3985, 43.0731],labels:["Jefferson County", "Dane County"],color:"#31a354",value:5623.0},
{from:[-90.11379198, 43.92460445],to:[-89.3985, 43.0731],labels:["Juneau County", "Dane County"],color:"#ffffcc",value:159.0},
{from:[-90.13172222, 42.66049941],to:[-89.3985, 43.0731],labels:["Lafayette County", "Dane County"],color:"#ffffcc",value:520.0},
{from:[-89.39874914, 43.81958177],to:[-89.3985, 43.0731],labels:["Marquette County", "Dane County"],color:"#ffffcc",value:542.0},
{from:[-87.9667637, 43.00713087],to:[-89.3985, 43.0731],labels:["Milwaukee County", "Dane County"],color:"#c2e699",value:878.0},
{from:[-88.46493222, 44.41609188],to:[-89.3985, 43.0731],labels:["Outagamie County", "Dane County"],color:"#ffffcc",value:233.0},
{from:[-87.95081819, 43.38403605],to:[-89.3985, 43.0731],labels:["Ozaukee County", "Dane County"],color:"#ffffcc",value:139.0},
{from:[-90.42948341, 43.37564062],to:[-89.3985, 43.0731],labels:["Richland County", "Dane County"],color:"#ffffcc",value:463.0},
{from:[-89.07156628, 42.67122465],to:[-89.3985, 43.0731],labels:["Rock County", "Dane County"],color:"#006837",value:9427.0},
{from:[-89.94821672, 43.42666336],to:[-89.3985, 43.0731],labels:["Sauk County", "Dane County"],color:"#31a354",value:4377.0},
{from:[-88.54190364, 42.6684868],to:[-89.3985, 43.0731],labels:["Walworth County", "Dane County"],color:"#ffffcc",value:686.0},
{from:[-88.23076276, 43.36847997],to:[-89.3985, 43.0731],labels:["Washington County", "Dane County"],color:"#ffffcc",value:358.0},
{from:[-88.30450836, 43.01821448],to:[-89.3985, 43.0731],labels:["Waukesha County", "Dane County"],color:"#c2e699",value:1506.0},
{from:[-88.64465866, 44.06887684],to:[-89.3985, 43.0731],labels:["Winnebago County WI", "Dane County"],color:"#ffffcc",value:165.0},
{from:[-90.04154917, 44.4553313],to:[-89.3985, 43.0731],labels:["Wood County", "Dane County"],color:"#ffffcc",value:118.0}
];

var map = L.map('map').setView([-89, 43], 7);
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map);

//-- add GEOJSON file to folder
fetch('dane_commute.geojson')
    .then(res => res.json())
    .then(data => {
        var dane_commute = L.geoJSON(data, {
        style: {
        color: 'tan',
      },
    }).addTo(map);
    map.fitBounds(dane_commute.getBounds());
  });

var migrationLayer = L.migrationLayer({
  map: map,
  data: data,
  pulseRadius: 25,
  pulseBorderWidth: 3,
});

migrationLayer.addTo(map);

function buildLegendHTML(title, breaks, colorFn) {
  var labels = [
    '103 – 686',
    '687 – 1,506',
    '1,507 – 3,253',
    '3,254 – 5,623',
    '5,624 – 10,219',
    '10,219+'
  ];
  
  var html = '<div class="legend-title">' + title + '</div>';
  for (var i = breaks.length - 1; i >= 0; i--) {
    html += '<div class="legend-box">' +
      '<div class="legend-color" style="background:' + colorFn(breaks[i] + 1) + '"></div>' +
      '<span>' + labels[i] + ' workers</span>' +
    '</div>';
  }
  return html;
}

var legendEl = document.getElementById('legend-overlay');
legendEl.innerHTML = buildLegendHTML(
  'Commute Flow to Dane County',
  [103, 686, 1506, 3253, 5623, 10219],
  getColorDensity
);