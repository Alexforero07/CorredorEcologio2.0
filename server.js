const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de almacenamiento para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // archivo único
  }
});
const upload = multer({ storage });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'reportesforo'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
  } else {
    console.log('✅ Conexión exitosa a MySQL');
  }
});
// Crear tabla de reportes si no existe
db.query(`
  CREATE TABLE IF NOT EXISTS reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.error('❌ Error al crear la tabla:', err.message);
  else console.log('✅ Tabla de reportes creada o ya existe');
}
);
// Middleware para manejar errores de multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  next();
});
// Middleware para manejar errores de MySQL
app.use((err, req, res, next) => {
  if (err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(400).json({ error: 'Campo no válido' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Entrada duplicada' });
  }
  if (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  next();
});
// Middleware para manejar errores de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
// Middleware para manejar errores de body-parser
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Error de sintaxis en el cuerpo de la solicitud' });
  }
  next();
});
// Middleware para manejar errores de fs
app.use((err, req, res, next) => {
    if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    if (err.code === 'EACCES') {
        return res.status(403).json({ error: 'Permiso denegado' });
    }
    if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
    next();
});


// Crear reporte con imagen
app.post('/reportes', upload.single('imagen'), (req, res) => {
  const { titulo, descripcion } = req.body;
  const imagen = req.file ? req.file.filename : null;
  db.query('INSERT INTO reportes (titulo, descripcion, imagen) VALUES (?, ?, ?)', [titulo, descripcion, imagen], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ id: result.insertId });
  });
});

// Mostrar reportes con imagen
app.get('/reportes', (req, res) => {
  db.query('SELECT * FROM reportes ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Mostrar todos los reportes
app.get('/reportes', (req, res) => {
  db.query('SELECT * FROM reportes', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Crear un nuevo reporte
app.post('/reportes', (req, res) => {
  const { titulo, descripcion } = req.body;
  db.query('INSERT INTO reportes (titulo, descripcion) VALUES (?, ?)', [titulo, descripcion], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ id: result.insertId });
  });
});

// Editar reporte
app.put('/reportes/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion } = req.body;
  db.query('UPDATE reportes SET titulo = ?, descripcion = ? WHERE id = ?', [titulo, descripcion, id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Reporte actualizado');
  });
});

// Eliminar reporte
app.delete('/reportes/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM reportes WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Reporte eliminado');
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
