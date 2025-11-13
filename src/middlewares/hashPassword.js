import bcrypt from 'bcrypt';

export const hashearPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const compararPassword = async (password, passwordHasheado) => {
  return await bcrypt.compare(password, passwordHasheado);
};