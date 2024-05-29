let map = L.map("map").setView([40.66995747013945, -103.59179687498357], 3);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let markers = L.markerClusterGroup();

for (let i = 0; i < campgrounds.length; i++) {
  let [latitude, longitude] = campgrounds[i].geometry.coordinates;
  let title = campgrounds[i].properties.popUpMarkup;

  let marker = L.marker(new L.LatLng(longitude, latitude), { title: title });

  marker.bindPopup(title);
  markers.addLayer(marker);
}

map.addLayer(markers);
