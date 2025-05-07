import { Request, Response } from "express";

import { PrismaClient } from "@prisma/client"; // Import PrismaClient
import {z} from "zod";

const prisma = new PrismaClient(); 

const bookActivitySchema = z.object({
    activityId: z.string().uuid(),
    userId: z.string().uuid()
  });

export const listActivities = async (req : Request , res: Response) : Promise<void> => {
  console.log('listActivities endpoint hit'); // Debug log
    try {
      console.log('Fetching activities from database...'); // De
        const activities = await prisma.activity.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            dateTime: true
          },
          orderBy: {
            dateTime: 'asc' // Sort by nearest date first
          }
        });
    
        // Format date for better readability
        const formattedActivities = activities.map(activity => ({
          ...activity,
          dateTime: activity.dateTime.toISOString().replace('T', ' ').slice(0, 16)
        }));
    
        res.json({
          success: true,
          data: formattedActivities
        });
      } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch activities'
        });
      }
    };


    export const bookActivity = async (req : Request, res: Response): Promise<void> => {
        try {
            const { activityId } = bookActivitySchema.parse(req.params);
            const {userId} = bookActivitySchema.parse(req.userId);
        
            // Transaction for atomic operations
            const result = await prisma.$transaction(async (tx) => {
              // 1. Check activity availability
              const activity = await tx.activity.findUnique({
                where: { id: activityId }
              });
        
              if (!activity) {
                throw new Error('Activity not found');
              }
        
              if (activity.isBooked) {
                throw new Error('Activity already booked');
              }
        
              // 2. Verify user exists
              const user = await tx.user.findUnique({
                where: { id: userId }
              });
              if (!user) throw new Error('User not found');
        
              // 3. Mark activity as booked + create booking
              const [updatedActivity, newBooking] = await Promise.all([
                tx.activity.update({
                  where: { id: activityId },
                  data: { isBooked: true }
                }),
                tx.booking.create({
                  data: { userId, activityId },
                  include: {
                    activity: { select: { title: true,
                        description: true,
                        location : true,
                        dateTime: true,
                     } },
                    user: { select: { name: true } }
                  }
                })
              ]);
        
              return { activity: updatedActivity, booking: newBooking };
            });
        
            res.status(201).json({
              success: true,
              message: 'Booking confirmed',
              data: {
                bookingId: result.booking.id,
                activityTitle: result.booking.activity.title,
                userName: result.booking.user.name,
                isBooked: result.activity.isBooked
              }
            });
        
          } catch (error) {
            if (error instanceof z.ZodError) {
               res.status(400).json({
                success: false,
                message: error.errors.map(e => e.message)
              });
            }
        
            res.status(400).json({
              success: false,
              message: error instanceof Error ? error.message : 'Booking failed'
            });
          }
        };
    
