import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { unauthorizedResponse } from '../factories/responseFactory.js';

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      const response = unauthorizedResponse('Unauthorized access');
      return res.status(401).json(response);
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken?.userId);

    if (!user) {
      const response = unauthorizedResponse('Unauthorized access');
      return res.status(401).json(response);
    }

    req.user = user;
    next();
  } catch (error) {
    const response = unauthorizedResponse(
      'Invalid access token: ' + error.message
    );
    return res.status(401).json(response);
  }
};
