CREATE DATABASE sistema_usuarios;

USE sistema_usuarios;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  rol ENUM('usuario', 'admin') DEFAULT 'usuario'
);



select * from usuarios;
UPDATE usuarios SET rol = 'admin' WHERE email = 'alex@example.com';
DELETE FROM usuarios WHERE id = 12;
