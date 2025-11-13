export const listarTodos = (Entidad) => async (req, res, next) => {
  try {
    const data = await Entidad.find();
    res.status(200).json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

export const obtenerPorId = (Entidad) => async (req, res, next) => {
  try {
    const data = await Entidad.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: "No encontrado" });
    res.status(200).json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

export const crear = (Entidad) => async (req, res, next) => {
  try {
    const nuevo = await Entidad.create(req.body);
    res.status(201).json({ success: true, data: nuevo });
  } catch (e) {
    next(e);
  }
};

export const actualizarPorId = (Entidad) => async (req, res, next) => {
  try {
    const actualizado = await Entidad.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!actualizado) return res.status(404).json({ success: false, error: "No encontrado" });
    res.status(200).json({ success: true, data: actualizado });
  } catch (e) {
    next(e);
  }
};

export const eliminarPorId = (Entidad) => async (req, res, next) => {
  try {
    const actualizado = await Entidad.findByIdAndUpdate(
      req.params.id,
      { eliminado: true },
      { new: true }
    );
    if (!actualizado) return res.status(404).json({ success: false, error: "No encontrado" });
    res.status(200).json({ success: true, data: actualizado });
  } catch (e) {
    next(e);
  }
};