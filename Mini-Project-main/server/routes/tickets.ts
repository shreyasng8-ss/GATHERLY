import { Router, Request, Response } from 'express';
import { storage } from '../storage/storage';

export const ticketsRouter = Router();

// GET /api/tickets/:ticketId/verify - Public / external verification lookup
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

// Helper for check-in logic
async function handleCheckIn(
  ticketId: string,
  eventId: string | undefined,
  req: Request,
  res: Response
) {
  const roleHeader = req.headers['x-user-role'] || req.headers['x-organizer-role'];
  const roleBody = req.body?.role;
  const effectiveRole = String(roleHeader || roleBody || 'organizer').toLowerCase().trim();

  // Guard: explicitly forbid student callers from check-in
  if (effectiveRole === 'student') {
    res.status(403).json({
      success: false,
      status: 'unauthorized',
      error: 'Unauthorized',
      message: 'Unauthorized: Students cannot check in tickets. Only event organizers are permitted to authorize gate admission.'
    });
    return;
  }

  const result = await storage.checkInTicket(ticketId, {
    expectedEventId: eventId,
    checkedInBy: req.body?.organizerName || 'Organizer Station',
    isOrganizer: true
  });

  if (result.status === 'invalid_ticket') {
    res.status(404).json(result);
    return;
  }

  if (result.status === 'wrong_event') {
    res.status(422).json(result);
    return;
  }

  if (result.status === 'already_checked_in') {
    res.status(409).json(result);
    return;
  }

  if (result.status === 'unauthorized') {
    res.status(403).json(result);
    return;
  }

  res.status(200).json(result);
}

// POST /api/tickets/check-in - General check-in endpoint (ticket in body)
ticketsRouter.post('/check-in', async (req: Request, res: Response) => {
  try {
    const ticketId = String(req.body?.ticketId || req.body?.ticket || '').trim();
    const eventId = req.body?.eventId ? String(req.body.eventId).trim() : undefined;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        status: 'invalid_ticket',
        error: 'Validation failed',
        message: 'ticketId is required in request body'
      });
      return;
    }

    await handleCheckIn(ticketId, eventId, req, res);
  } catch (error) {
    console.error('Error in POST /api/tickets/check-in:', error);
    res.status(500).json({
      success: false,
      status: 'invalid_ticket',
      error: 'Internal server error',
      message: 'Failed to process ticket check-in'
    });
  }
});

// POST /api/tickets/:ticketId/check-in - Specific ticket route
ticketsRouter.post('/:ticketId/check-in', async (req: Request, res: Response) => {
  try {
    const ticketId = String(req.params.ticketId || '').trim();
    const eventId = req.body?.eventId ? String(req.body.eventId).trim() : undefined;

    if (!ticketId) {
      res.status(400).json({
        success: false,
        status: 'invalid_ticket',
        error: 'Validation failed',
        message: 'ticketId parameter is required'
      });
      return;
    }

    await handleCheckIn(ticketId, eventId, req, res);
  } catch (error) {
    console.error(`Error in POST /api/tickets/${req.params.ticketId}/check-in:`, error);
    res.status(500).json({
      success: false,
      status: 'invalid_ticket',
      error: 'Internal server error',
      message: 'Failed to process ticket check-in'
    });
  }
});
