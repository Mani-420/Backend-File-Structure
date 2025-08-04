import jwt from 'jsonwebtoken';

export const generateToken = (
  payload,
  expiresIn = process.env.JWT_EXPIRES_IN || '2d'
) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn
    });
    return token;
  } catch (error) {
    throw new Error(`Error Generating Token: ${error.message}`);
  }
};
