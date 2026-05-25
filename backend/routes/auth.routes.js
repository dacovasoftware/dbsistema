const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const SECRET = 'clave_secreta_sistema_ventas';

router.post('/registro', async (req, res) => {
  const { nombre, correo, password, id_rol } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO usuarios(nombre, correo, password, id_rol) VALUES (?, ?, ?, ?)',
    [nombre, correo, passwordHash, id_rol],
    (error) => {
      if (error) return res.status(500).json(error);

      res.json({ mensaje: 'Usuario registrado correctamente' });
    }
  );
});

router.post('/login', (req, res) => {
  const { correo, password } = req.body;

  db.query(
    `SELECT usuarios.*, roles.nombre AS rol
     FROM usuarios
     INNER JOIN roles ON usuarios.id_rol = roles.id_rol
     WHERE correo = ?`,
    [correo],
    async (error, resultados) => {
      if (error) return res.status(500).json(error);

      if (resultados.length === 0) {
        return res.status(401).json({ mensaje: 'Correo no registrado' });
      }

      const usuario = resultados[0];

      const passwordValida = await bcrypt.compare(password, usuario.password);
      if (!passwordValida) {
        return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
      }
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          rol: usuario.rol
        },
        SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        mensaje: 'Login correcto',
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        }
      });
    }
  );
});

module.exports = router;