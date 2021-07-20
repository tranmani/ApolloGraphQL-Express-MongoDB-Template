import jwt from 'jsonwebtoken'
import { AuthenticationError } from 'apollo-server-express'
require('dotenv').config();

export const verifyToken = (token: string) => {
    try {
        const payload: any = jwt.verify(token, process.env.JWT_SECRET);
        const id = payload.id;

        return { id, token };
    } catch (e) {
        throw new AuthenticationError(
            'Authentication token is invalid, please log in',
        );
    }
}

export const createToken = (id: string) => {
    try {
        const token = jwt.sign({ id }, process.env.JWT_SECRET);
        return { token, id }
    } catch (e) {
        throw new AuthenticationError(
            'Authentication token is invalid, please log in',
        )
    }
}