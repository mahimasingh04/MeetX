import express, { Express, Request, Response } from 'express';
import cookieParser from "cookie-parser";
import {PrismaClient} from "@prisma/client"
import userRouter from "./routes/user"
import activityRouter from './routes/Activity';
import dotenv from 'dotenv';
import cors from "cors"

dotenv.config();

const prisma = new PrismaClient()
const app = express();

app.use(cors({
  origin:  'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['set-cookie']
}));


app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/activity", activityRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
   
  });