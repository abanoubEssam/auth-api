
import * as jwt from 'jsonwebtoken';
import * as config from 'config';
import { AppRoles } from '../constants';

 function _generateToken({ userId, tokenSecret, expiresIn, role }) {
    return jwt.sign(
        {
            sub: userId,
            role,
            iss: config.get('auth.jwtSecret'),
            iat: new Date().getTime() / 1000
        },
        tokenSecret,
        { expiresIn: config.get('auth.jwtLifeTime') }
    );
}


export function generateAccessToken(id: string, role: AppRoles) {
    return _generateToken({
        userId: id,
        role,
        tokenSecret: config.get('auth.jwtSecret'),
        expiresIn: config.get('auth.jwtLifeTime')
    });
}
