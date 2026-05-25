const jwt = require('jsonwebtoken');

const SECRET = 'clave_secreta_sistema_ventas';

const verificarToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no enviado' });
  }

  try {
    const tokenLimpio = token.split(' ')[1];
    const usuario = jwt.verify(tokenLimpio, SECRET);
    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
};

module.exports = verificarToken;