import express from "express"
import { Request, Response } from "express";

import { PrismaClient } from "@prisma/client"; // Import PrismaClient
import { bookActivity, listActivities } from "../controllers/ActivityController";
import { authMiddleware } from "../middleware/authenticateUser";

const prisma = new PrismaClient(); 

const activityRouter = express.Router();

activityRouter.get("/all-activities", listActivities); //public endpoint
activityRouter.post("/bookActivity/:id", authMiddleware, bookActivity );

export default activityRouter;