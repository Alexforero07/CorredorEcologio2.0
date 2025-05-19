create database reportesforo;
use reportesforo;

CREATE TABLE reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255),
  descripcion TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE reportes ADD imagen VARCHAR(255);

select * from reportes;

