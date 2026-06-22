import * as jwt from 'jsonwebtoken';
import { getEnv } from './env';

const JWT_SECRET = getEnv('JWT_SECRET', true);
const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN', true);

export interface TokenPayload {
    username: string;
    email: string;
}

export function generateJWT(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyJWT(authHeader: string | null) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { isValid: false, payload: null, error: "Missing or malformed token" };
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return { isValid: true, payload: decoded, error: null };
    } catch (error) {
        return { isValid: false, payload: null, error: "Invalid or expired token" };
    }
}