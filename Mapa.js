// Inicializa el mapa y lo centra en el Corredor Ecológico de Villavicencio
var mapa = L.map('miMapa').setView([4.080618, -73.626253], 15);

// Agrega la capa base (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(mapa);

// Añade un marcador en el Corredor Ecológico
L.marker([4.080618, -73.626253]).addTo(mapa)
  .bindPopup('Corredor Ecológico - Villavicencio, Meta ')
  .openPopup();