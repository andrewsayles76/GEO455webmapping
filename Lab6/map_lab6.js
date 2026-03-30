//--create map
var mymap = L.map('map').setView([51.48882027639122, -0.1028811094342392], 10);

// Add the tile layer (OpenStreetMap)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(mymap);


//--minimap layer
var miniLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  minZoom: 0,
  maxZoom: 13,
});

//--Add minimap control
var miniMap = new L.Control.MiniMap(miniLayer, {
  toggleDisplay: true,
  minimized: false,
  position: "bottomleft"
}).addTo(mymap);

//--add colors
function getColorDensity(value) {
    return value > 139 ? '#006d2c':
           value > 87  ? '#31a354':
           value > 53  ? '#74c476':
           value > 32  ? '#bae4b3':
                         '#edf8e9';
}

function styleDensity(feature){
    return {
        fillColor: getColorDensity(feature.properties.pop_den),   
        weight: 2,
        opacity: 1,
        color: 'gray',
        fillOpacity: 0.9
    };
} 


//--highlight function
function highlightFeature(e) {
    var layer=e.target;
    
    layer.setStyle({
        weight:5,
        color: '#666',
        fillOpacity:0.7
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge){
        layer.bringToFront();
    }
}

//--Reset Functions
function resetDensityHighlight(e) {
    densityLayer.resetStyle(e.target);
    e.target.closePopup();
}

//--Interaction Functions
function onEachDensityFeature(feature, layer) {
    layer.bindPopup(
    '<strong>'+feature.properties.NAME+'</strong><br>'+
    '<span style="color:green">'+feature.properties.pop_den+'people/hectare</span>'
    );
    layer.on({
        mouseover:function(e) {
            highlightFeature(e);
            e.target.openPopup();
        },
        mouseout: resetDensityHighlight
    });
}


//--build second layer
//--add colors
function getColorlang(value) {
    return value > 48 ? '#08519c' :
           value > 36 ? '#3182bd' :
           value > 26 ? '#6baed6' :
           value > 17 ? '#9ecae1' :
           value > 8  ? '#c6dbef' :
                        '#eff3ff';
}


function stylelang(feature){
    return {
        fillColor: getColorlang(feature.properties.Pop_Densit),
        weight: 2,
        opacity: 1,
        color: 'gray',
        fillOpacity: 0.9
    };
}


//--highlight function
function highlightFeature(e) {
    var layer=e.target;
    
    layer.setStyle({
        weight:5,
        color: '#666',
        fillOpacity:0.7
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge){
        layer.bringToFront();
    }
}

//--Reset Functions
function resetlangHighlight(e) {
    langlayer.resetStyle(e.target);
    e.target.closePopup();
}

//--Interaction Functions
function onEachlangFeature(feature, layer) {
    layer.bindPopup(
    '<strong>'+feature.properties.NAME+'</strong><br>'+
    '<span style="color:blue">'+feature.properties.Pop_Densit+'English Speakers/hectare</span>'
    );
    layer.on({
        mouseover:function(e) {
            highlightFeature(e);
            e.target.openPopup();
        },
        mouseout: resetlangHighlight
    });
}



//--building legends in the side panel
function buildLegendHTML(title, grades, colorFunction) {
    var html = '<div class="legend-title">'+title+'</div>';
    
    for (var i = 0; i <grades.length; i++) {
        var from = grades[i];
        var to =grades[i + 1];
        
        html +=
            '<div class="legend-box">'+
                '<span class="legend-color" style="background:'+colorFunction(from +1) +'"></span>'+
                '<span>'+from+(to ? '&ndash;'+ to : '+')+'</span>'+
            '</div>';
    }
    
    return html;
}

//--insert density legend into side panel
var densityLegendDiv = document.getElementById('density-legend');

if (densityLegendDiv) {
densityLegendDiv.innerHTML = buildLegendHTML(
'Population Density',
[0, 32, 53, 87, 139],
getColorDensity
);
}


var langLegendDiv = document.getElementById('lang-legend');

if (langLegendDiv) {
langLegendDiv.innerHTML = buildLegendHTML(
'English Speaker Density',
[8, 17, 26, 36, 48],
getColorlang
);
}


//--layer control
var densityLayer = L.geoJSON(data, {
    style: styleDensity,
    onEachFeature: onEachDensityFeature
}).addTo(mymap);

var langlayer = L.geoJSON(datalang, {
    style: stylelang,
    onEachFeature: onEachlangFeature
});

var baseMaps = {
    "Population Density": densityLayer,
    "English Speakers": langlayer
};

L.control.layers(baseMaps).addTo(mymap);

