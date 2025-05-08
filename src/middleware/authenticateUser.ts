import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cookieParser  from 'cookie-parser'
dotenv.config();

declare global {
    namespace Express {
      interface Request {
        userId?: string;
      }
    }
  }

const prisma = new PrismaClient();

export const authMiddleware = async(req: Request , res : Response , next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies.tokenInfo;
        console.log("Token from cookies:", token); 

        if (!token) {
            res.status(200).json({
             success: false,
             message: "You are not authorized to access this route",
           });
           return;
         }
   
         const decoded = verifyToken(token) as JwtPayload;
         console.log("Decoded token:", decoded);

         
         if(!decoded) {
           res.status(200).json({
               success: false,
               message: "Invalid token!!",
             });
             return;

    }

    req.userId = decoded.userId 
    next();
    }
    catch(error) {
         
            console.error('Error verifying token:', error);
            res.status(401).json({ message: 'Invalid or expired token.' });
    }
    
      
}
