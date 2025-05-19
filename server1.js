const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'clave_super_secreta';
const PORT = 4000;
console.log('Iniciando servidor...');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sistema_usuarios'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
  } else {
    console.log('Conexión a MySQL exitosa');
  }
});

// Registro de usuario con rol 'usuario' por defecto
app.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  // Verificar si email ya existe
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).send('Error en la base de datos');
    if (results.length > 0) return res.status(400).send('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 8);
    db.query('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', 
      [nombre, email, hashedPassword, 'usuario'], (err) => {
      if (err) {
        console.error('Error al registrar usuario:', err);
        return res.status(400).send('Error al registrar: ' + err.message);
      }
      res.send('Usuario registrado con éxito');
    });
  });
});

// Login y generación de token JWT con rol
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Credenciales incorrectas');
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Contraseña incorrecta');
    
    const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Middleware para verificar JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).send('Token requerido');
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).send('Token inválido');
    req.user = decoded;
    next();
  });
}

// Ruta protegida para admin
app.get('/admin', verifyToken, (req, res) => {
  console.log('Datos decodificados del token:', req.user);  // <- Esto ayuda a depurar
  if (req.user.rol !== 'admin') return res.status(403).send('Acceso denegado');
  res.send('Bienvenido, administrador');
});
// Ruta protegida para usuario
app.get('/usuario', verifyToken, (req, res) => {
  console.log('Datos decodificados del token:', req.user);
  if (req.user.rol !== 'usuario') return res.status(403).send('Acceso denegado para no usuarios');
  res.send('Bienvenido, usuario');
});

app.get('/me', verifyToken, (req, res) => {
  res.json({ id: req.user.id, rol: req.user.rol });
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
