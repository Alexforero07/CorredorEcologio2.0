const form = document.getElementById('form-reporte');
const lista = document.getElementById('lista-reportes');

  // Guardar nuevo reporte con imagen
  form.onsubmit = async e => {
    e.preventDefault();
    const formData = new FormData(form);
    await fetch('http://localhost:3000/reportes', {
      method: 'POST',
      body: formData
    });
    form.reset();
    cargarReportes();
  };

  // Cargar y mostrar todos los reportes
  async function cargarReportes() {
    const res = await fetch('http://localhost:3000/reportes');
    const reportes = await res.json();
    lista.innerHTML = '';
    reportes.forEach(r => {
      lista.innerHTML += `
        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
          <h3>${r.titulo}</h3>
          <p>${r.descripcion}</p>
          ${r.imagen ? `<img src="http://localhost:3000/uploads/${r.imagen}" width="200">` : ''}
          <br>
          <button onclick="editarReporte(${r.id})">Editar</button>
          <button onclick="eliminarReporte(${r.id})">Eliminar</button>
        </div>
      `;
    });
  }

  // Eliminar reporte
  async function eliminarReporte(id) {
    await fetch(`http://localhost:3000/reportes/${id}`, { method: 'DELETE' });
    cargarReportes();
  }

  // Editar reporte (solo título y descripción)
  function editarReporte(id) {
    const nuevoTitulo = prompt('Nuevo título:');
    const nuevaDescripcion = prompt('Nueva descripción:');
    if (!nuevoTitulo || !nuevaDescripcion) return alert('Título y descripción requeridos');

    fetch(`http://localhost:3000/reportes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: nuevoTitulo, descripcion: nuevaDescripcion })
    }).then(cargarReportes);
  }

  // Cargar reportes al cargar la página
  cargarReportes();

