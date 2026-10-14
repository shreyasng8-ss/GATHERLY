import { Router, Request, Response } from 'express';
import { storage } from '../storage/storage';

export const clubsRouter = Router();

// GET /api/clubs - List all clubs (optionally checks membership with ?studentId=)
clubsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
    const clubs = await storage.getAllClubs(studentId);
    res.json(clubs);
  } catch (error) {
    console.error('Error in GET /api/clubs:', error);
    res.status(500).json({ error: 'Failed to retrieve clubs' });
  }
});

// GET /api/clubs/:id - Get single club details, member count, and relevant events
clubsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;

    const club = await storage.getClubById(id, studentId);
    if (!club) {
      res.status(404).json({
        error: 'Club not found',
        message: `No club found with id '${id}'`
      });
      return;
    }

    res.json(club);
  } catch (error) {
    console.error(`Error in GET /api/clubs/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve club details' });
  }
});

// POST /api/clubs/:id/join - Join a campus club
clubsRouter.post('/:id/join', async (req: Request, res: Response) => {
  try {
    const clubId = String(req.params.id);
    const body = req.body;

    if (!body || typeof body !== 'object') {
      res.status(400).json({
        error: 'Validation failed',
        message: 'Request body must be a valid JSON object'
      });
      return;
    }

    const studentId = String(body.studentId || '').trim();
    const studentName = typeof body.studentName === 'string' ? body.studentName.trim() : undefined;

    if (!studentId) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'studentId is required to join a club'
      });
      return;
    }

    const result = await storage.joinClub(clubId, studentId, studentName);
    res.status(result.alreadyJoined ? 200 : 201).json(result);
  } catch (error: any) {
    console.error(`Error in POST /api/clubs/${req.params.id}/join:`, error);
    if (error.message?.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to join club' });
  }
});

// POST or DELETE /api/clubs/:id/leave - Leave a club
const handleLeaveClub = async (req: Request, res: Response) => {
  try {
    const clubId = String(req.params.id);
    const studentId = String(req.body?.studentId || req.query.studentId || '').trim();

    if (!studentId) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'studentId is required (in body or query) to leave a club'
      });
      return;
    }

    const result = await storage.leaveClub(clubId, studentId);
    res.json(result);
  } catch (error: any) {
    console.error(`Error leaving club ${req.params.id}:`, error);
    if (error.message?.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to leave club' });
  }
};

clubsRouter.delete('/:id/leave', handleLeaveClub);
clubsRouter.post('/:id/leave', handleLeaveClub);
