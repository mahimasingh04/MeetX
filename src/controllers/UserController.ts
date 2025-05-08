import { Request, Response } from "express";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";
import { registerSchema } from "../validations/auth";
import { ZodError } from "zod";
import { loginSchema } from "../validations/auth";
import { PrismaClient } from "@prisma/client"; // Import PrismaClient

const prisma = new PrismaClient(); 


export const registerController = async(req : Request, res: Response): Promise<void> => {


    try{
     const validatedData = registerSchema.parse(req.body);
    const { email, name, password ,phone } = validatedData;
       
    if(!email || !name || !password || !phone ) {
        res.status(400).json({message : "All fields are required"});
        return;
    }
       const user = await prisma.user.findUnique({
        where: { email },
    });
    if(user) {
         res.status(400).json({ message: "User already exists" });
         return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
             data : {
                email ,
                name ,
                password : hashedPassword,
                phone,
             }
        })
         res.status(201).json({
          success: true,
          message: "User created successfully",
          user: newUser,
      });
        
  }catch(error) {
    if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
    }


    export const signinController = async (req: Request, res: Response): Promise<void> => {
        try {
          // Validate request body
          const { email, password } = loginSchema.parse(req.body);
      
          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true
            }
          });
      
          if (!user) {
            res.status(401).json({ // Changed from 200 to 401 (Unauthorized)
              success: false,
              message: "Invalid credentials" // Generic message for security
            });
            return;
          }
      
          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user?.password || "");
          if (!isPasswordValid) {
            res.status(401).json({
              success: false,
              message: "Invalid credentials" // Same message as above
            });
            return;
          }
      
          // Generate token
          const token = generateToken(user.id);
      
          // Prepare user data without password
          const userData = {
            id: user.id,
            name: user.name,
            email: user.email
          };
      
          // Set cookie and send response
          res
            .status(200)
            .cookie("tokenInfo", token, {
              httpOnly: true,
              
              sameSite: "strict",
              maxAge: 24 * 60 * 60 * 1000, // 1 day
              
            })
            .json({
              success: true,
              message: "Login successful",
              user: userData
              
            });
      
        } catch (error) {
          if (error instanceof ZodError) {
            res.status(400).json({
              success: false,
              message: "Validation failed",
              errors: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
              }))
            });
          } else {
            console.error("Login error:", error);
            res.status(500).json({
              success: false,
              message: "Internal server error"
            });
          }
        }
      };

export const getMyBookings = async(req: Request, res: Response) : Promise<void> => {
    try{
      const userId = req.userId;
      if(!userId) {
        res.status(400).json({message: "User ID is required"})
        return;
      }

      const bookings = await prisma.booking.findMany({
        where: {userId: userId},
        include: {
            activity: {
                select: {
                    title: true,
                    description: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc' // Newest first
          }
      });

      const formattedBookings = bookings.map(booking => ({
        bookingId: booking.id,
        bookedAt: booking.createdAt,
        activity: booking.activity
      }))

      
    res.status(200).json({
        success: true,
        data: formattedBookings
      });
    }catch(error) {

        console.error('Failed to fetch bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings'
    });
    }
}