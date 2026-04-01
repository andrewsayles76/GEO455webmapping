var streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var mymap = L.map("map", {
  center: [28.972443641658437, 84.59443216376953],
  zoom: 8,
  layers: [streets]
});

//--scale bar
L.control.scale({
  position: "bottomleft",
  metric: true,
  imperial: false
}).addTo(mymap);

//--peaks icon 
var myIcon = L.icon({
    iconUrl: "images/peaks.png",
    iconSize: [20, 20],
    iconAnchor: [10, 15],
   popupAnchor: [1, -24], 
});

//-- mountain peaks
var peaks = new L.geoJson(mtn_peaks,{
    onEachFeature: function(feature, featureLayer) {
        featureLayer.bindPopup(
            '<p>Peak Name: <b>' + feature.properties.TITLE + '</b></br>' + 
            'Peak Height: ' + feature.properties.Peak_Heigh + 'm</br>' +
            'Number of Deaths: ' + feature.properties.number_of_ + '</br>' + 
            'Number of Expeditions: ' + feature.properties.number_of1 + '</p>'
            );
    },
    pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {icon: myIcon});
    }
}).addTo(mymap);

//--most deaths
var topPeaks = mtn_peaks.features
    .sort((a,b) => b.properties.number_of_ - a.properties.number_of_)
    .slice(0,3);
var buttonsDiv = document.getElementById("topPeaksButtons");

topPeaks.forEach(function(peak){

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-danger btn-sm text-start mb-1";

    btn.innerHTML =
        "<b>" + peak.properties.TITLE + "</b><br>" +
        "Deaths: " + peak.properties.number_of_;

    btn.addEventListener("click", function(){

        var lat = peak.geometry.coordinates[1];
        var lon = peak.geometry.coordinates[0];

        mymap.setView([lat, lon], 15);

    });

    buttonsDiv.appendChild(btn);

});

//--make proportional symbols
function getRadius(area) {
    var radius = Math.sqrt(area/Math.PI);
    return radius * 2;
}

var propcircles = new L.geoJson(mtn_peaks, {
    onEachFeature: function(feature, featureLayer) {
        featureLayer.bindPopup(
            '<p>Peak Name: <b>' + feature.properties.TITLE + '</b></br>' +
            'Number of Expeditions: ' + feature.properties.number_of1 + '</p>'
        );
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            fillColor: '#920101',
            color: '#920101',
            weight: 2,
            radius: getRadius(feature.properties.number_of1),
            fillOpacity: 0.35
        }).on({
            mouseover: function(e) {
                this.openPopup();
                this.setStyle({fillOpacity: 0.8, fillColor: '#2D8F4E'});
            },
            mouseout: function(e) {
                this.closePopup();
                this.setStyle({fillOpacity: 0.35, fillColor: '#920101'});
            }
        });
    }
}).addTo(mymap);

//--make a heat map
var min = 0;
var max = 0;
var heatMapPoints = [];

mtn_peaks.features.forEach(function(feature) {
    heatMapPoints.push([
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        feature.properties.number_of_
    ]);
    
    if (feature.properties.number_of_ < min || min === 0) {
        min=feature.properties.number_of_;
    }
    
    if (feature.properties.number_of_ > max || max === 0) {
        max=feature.properties.number_of_;
    }
});

var heat = L.heatLayer(heatMapPoints, {
    radius: 25,
    minOpacity: 0.5,
    gradient:{0.5: 'blue', 0.75: 'lime', 1: 'red'},
}).addTo(mymap);

//--make the clusters (of peaks)
var clustermarkers = L.markerClusterGroup();
mtn_peaks.features.forEach(function(feature) {
    clustermarkers.addLayer(L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]));
});

mymap.addLayer(clustermarkers);

//--interactivity search
var searchControl = new L.Control.Search({
    position:'topright',
    layer: peaks,
    propertyName: 'TITLE',
    marker: false,
    markeranimate: true,
    delayType: 50,
    collapsed: false,
    textPlaceholder: 'Search by Peak Name: e.g. Everest, Lhotse',   
    moveToLocation: function(latlng, title, map) {
        mymap.setView(latlng, 15);}
});

mymap.addControl(searchControl); 

//--home button
var homeCenter = mymap.getCenter();
var homeZoom = mymap.getZoom();
L.easyButton(('<img src="images/globe_icon.png", height=60%>'), function () {
  mymap.setView(homeCenter, homeZoom);
}, "Home").addTo(mymap);


//--layer control
var baseMaps = {
    "Streets": streets,
    "Imagery": imagery
};

var selection = {
    "Peaks": peaks,
    "Proportional Circles": propcircles,
    "Heat Map": heat,
    "Clustered Peaks": clustermarkers
};

L.control.layers(baseMaps, selection).addTo(mymap);








