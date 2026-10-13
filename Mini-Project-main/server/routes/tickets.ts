import { Router, Request, Response } from 'express';
import { storage } from '../storage/storage';

export const ticketsRouter = Router();

// GET /api/tickets/:ticketId/verify - Verify digital ticket pass
ticketsRouter.get('/:ticketId/verify', async (req: Request, res: Response) => {
  try {
    const ticketId = String(req.params.ticketId || '').trim();

    if (!ticketId) {
      res.status(400).json({
        valid: false,
        error: 'Validation failed',
        message: 'ticketId parameter is required',
        verifiedAt: new Date().toISOString()
      });
      return;
    }

    const verification = await storage.getTicketVerification(ticketId);

    if (!verification.valid) {
      res.status(404).json(verification);
      return;
    }

    res.json(verification);
  } catch (error) {
    console.error(`Error in GET /api/tickets/${req.params.ticketId}/verify:`, error);
    res.status(500).json({
      valid: false,
      error: 'Internal server error',
      message: 'Failed to verify ticket pass',
      verifiedAt: new Date().toISOString()
    });
  }
});
