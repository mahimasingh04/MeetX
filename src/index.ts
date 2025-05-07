import express, { Express, Request, Response } from 'express';
import cookieParser from "cookie-parser";
import {PrismaClient} from "@prisma/client"
import userRouter from "./routes/user"
import activityRouter from './routes/Activity';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient()
const app = express();


app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/activity", activityRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
   
  });