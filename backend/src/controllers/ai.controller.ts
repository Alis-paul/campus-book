import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/ai.service';
import prisma from '../prisma/client';

export const summarize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, style } = req.body;
    const result = await aiService.summarizeText(text, style);
    
    await prisma.aISession.create({
      data: {
        userId: req.user!.id,
        featureType: 'SUMMARIZE',
        prompt: text,
        response: result.summary,
        tokens: result.tokens,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        summary: result.summary,
        wordCount: result.summary.split(/\s+/).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { material } = req.body;
    const result = await aiService.generateQuiz(material);
    
    await prisma.aISession.create({
      data: {
        userId: req.user!.id,
        featureType: 'QUIZ',
        prompt: material,
        response: result.quiz,
        tokens: result.tokens,
      },
    });

    res.status(200).json({ status: 'success', data: { quiz: result.quiz } });
  } catch (error) {
    next(error);
  }
};

export const essayFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { essay } = req.body;
    const result = await aiService.evaluateEssay(essay);
    
    await prisma.aISession.create({
      data: {
        userId: req.user!.id,
        featureType: 'ESSAY',
        prompt: essay,
        response: result.feedback,
        tokens: result.tokens,
      },
    });

    res.status(200).json({ status: 'success', data: { feedback: result.feedback } });
  } catch (error) {
    next(error);
  }
};

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;

    // Fetch resources with active bookings for context
    const now = new Date();
    const resources = await prisma.resource.findMany({
      include: {
        bookings: {
          where: {
            startTime: { lte: now },
            endTime: { gte: now },
            status: { in: ['CONFIRMED', 'CHECKED_IN'] }
          },
          include: { user: { select: { name: true } } }
        }
      }
    });

    const context = resources.map(r => {
      const booking = r.bookings[0];
      const status = booking 
        ? `Engaged by ${booking.user.name} until ${new Date(booking.endTime).toLocaleTimeString()}` 
        : "Free";
      return `Room: ${r.name}, Block: ${r.location}, Type: ${r.type}, Capacity: ${r.capacity}, Status: ${status}`;
    }).join('\n');

    const result = await aiService.chatWithAssistant(message, context);
    
    await prisma.aISession.create({
      data: {
        userId: req.user!.id,
        featureType: 'CHAT',
        prompt: message,
        response: result.response,
        tokens: result.tokens,
      },
    });

    res.status(200).json({ status: 'success', data: { reply: result.response } });
  } catch (error) {
    next(error);
  }
};
