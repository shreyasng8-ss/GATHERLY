import { Router, Request, Response } from 'express';
import { storage } from '../storage/storage';

export const studentsRouter = Router();

// GET /api/students/:studentId/registrations - Return events for which a student registered
studentsRouter.get('/:studentId/registrations', async (req: Request, res: Response) => {
  try {
    const studentId = String(req.params.studentId || '');

    if (!studentId || studentId.trim().length === 0) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'studentId path parameter is required'
      });
      return;
    }

    const registrations = await storage.getRegistrationsForStudent(studentId);

    res.json({
      studentId,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    console.error(`Error in GET /api/students/${req.params.studentId}/registrations:`, error);
    res.status(500).json({ error: 'Failed to retrieve student registrations' });
  }
});

// GET /api/students/:studentId/clubs - Return clubs joined by student
studentsRouter.get('/:studentId/clubs', async (req: Request, res: Response) => {
  try {
    const studentId = String(req.params.studentId || '');

    if (!studentId || studentId.trim().length === 0) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'studentId path parameter is required'
      });
      return;
    }

    const clubs = await storage.getClubsForStudent(studentId);

    res.json({
      studentId,
      count: clubs.length,
      clubs
    });
  } catch (error) {
    console.error(`Error in GET /api/students/${req.params.studentId}/clubs:`, error);
    res.status(500).json({ error: 'Failed to retrieve student clubs' });
  }
});
