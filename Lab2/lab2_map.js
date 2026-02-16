
const map = L.map("map").setView([44.062269404067614, -92.04441972181105], 13);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
}).addTo(map);

L.marker([44.062269404067614, -92.04441972181105])
  .addTo(map)
  .bindPopup("<b>Hello!</b><br>This is the visiter center for <b>White Water State Park</b>.")
  .openPopup();

