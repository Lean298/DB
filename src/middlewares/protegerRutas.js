const protegerRutas = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'El rol asignado no tiene acceso a esta transacción' });
    }
    next();
  };
};

export default protegerRutas;

