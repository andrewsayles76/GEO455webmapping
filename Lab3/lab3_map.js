const map = L.map("map").setView([44.9923211906775, -91.60682247613742], 7);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var myIcon1 = L.icon({
    iconUrl: 'images/icon_1.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var myIcon2 = L.icon({
    iconUrl: 'images/icon_2.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var myIcon3 = L.icon({
    iconUrl: 'images/icon_3.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var myIcon4 = L.icon({
    iconUrl: 'images/icon_4.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var myIcon5 = L.icon({
    iconUrl: 'images/icon_5.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var myIcon6 = L.icon({
    iconUrl: 'images/icon_6.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var myIcon7 = L.icon({
    iconUrl: 'images/icon_7.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var myIcon8 = L.icon({
    iconUrl: 'images/icon_8.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var myIcon9 = L.icon({
    iconUrl: 'images/icon_9.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var myIcon10 = L.icon({
    iconUrl: 'images/icon_10.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
});

var ww = L.marker([44.062269404067614, -92.04441972181105], {icon: myIcon1}).bindPopup("<b>White Water State Park</b>.").addTo(map);
var lb = L.marker([47.53502825379794,-94.8268575318331], {icon: myIcon2}).bindPopup("<b>Lake Bemidji State Park</b>").addTo(map);
var ag = L.marker([46.46046164790214,-94.36828598976167], {icon: myIcon3}).bindPopup("<b>Agate Lake</b>").addTo(map);
var dl = L.marker([43.42823994303177,-89.73128958304771], {icon: myIcon4}).bindPopup("<b>Devils Lake</b>").addTo(map);
var gi = L.marker([43.735392532145276,-91.22920233317778], {icon: myIcon5}).bindPopup("<b>Goose Island</b>").addTo(map);
var deerl = L.marker([47.37562629104621,-93.66277902014782], {icon: myIcon6}).bindPopup("<b>Deer Lake</b>").addTo(map);
var sl = L.marker([43.477456764290025,-93.42196226091012], {icon: myIcon7}).bindPopup("<b>Silver Lake</b>").addTo(map);
var tc = L.marker([44.32737803384843,-87.5446981100485], {icon: myIcon8}).bindPopup("<b>Two Creeks Buried Forest</b>").addTo(map);
var cpoint = L.marker([44.93054107114197,-87.17397625241831], {icon: myIcon9}).bindPopup("<b>Cave Point State Park</b>").addTo(map);
var ci = L.marker([45.08864960694626,-87.0495165370378], {icon: myIcon10}).bindPopup("<b>Cana Island Lighthouse</b>").addTo(map);
