import jwt from "jsonwebtoken";

// Generate token
export const generateToken = (payload , secret , options) =>{
    return jwt.sign(payload , secret , options)
}

// verify token
export const verifyToken = (token , secret) =>{
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw { name: 'TokenExpiredError', message: 'Token has expired' };
        }
        if (error.name === 'JsonWebTokenError') {
            throw { name: 'JsonWebTokenError', message: 'Invalid token' };
        }
        throw error;
    }
}