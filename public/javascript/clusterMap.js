let map = L.map("map").setView([40.66995747013945, -103.59179687498357], 3);

L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

let markers = L.markerClusterGroup();

for (let i = 0; i < campgrounds.length; i++) {
  let [latitude, longitude] = campgrounds[i].geometry.coordinates;
  let title = campgrounds[i].title;
  let marker = L.marker([latitude, longitude], { title: title });

  marker.bindPopup(title);
  markers.addLayer(marker);
}

map.addLayer(markers);
