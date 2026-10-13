import { Router, Request, Response } from 'express';
import { storage } from '../storage/storage';

export const eventsRouter = Router();

// GET /api/events - List all events (supports ?category= & ?search=)
eventsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string'
      ? req.query.search
      : typeof req.query.q === 'string'
        ? req.query.q
        : undefined;

    const events = await storage.getAllEvents({ category, search });
    res.json(events);
  } catch (error) {
    console.error('Error in GET /api/events:', error);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// GET /api/events/:id - Get single event
eventsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const event = await storage.getEventById(id);

    if (!event) {
      res.status(404).json({
        error: 'Event not found',
        message: `No event found with id '${id}'`
      });
      return;
    }

    res.json(event);
  } catch (error) {
    console.error(`Error in GET /api/events/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve event' });
  }
});

// POST /api/events - Create new event
eventsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate required fields
    const errors: string[] = [];

    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Validation failed', details: ['Request body must be a JSON object'] });
      return;
    }

    if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 3) {
      errors.push('Title is required and must be at least 3 characters');
    }

    if (!body.date || typeof body.date !== 'string' || body.date.trim().length === 0) {
      errors.push('Date is required (e.g. "Oct 24 • 5:00 PM" or "2024-10-24")');
    }

    if (!body.time || typeof body.time !== 'string' || body.time.trim().length === 0) {
      errors.push('Time is required (e.g. "5:00 PM - 7:30 PM")');
    }

    if (!body.venue || typeof body.venue !== 'string' || body.venue.trim().length === 0) {
      errors.push('Venue is required');
    }

    if (!body.category || typeof body.category !== 'string' || body.category.trim().length === 0) {
      errors.push('Category is required (e.g. "Tech Workshop", "Hackathon", "Career", "Academic")');
    }

    if (body.capacity !== undefined) {
      const cap = Number(body.capacity);
      if (isNaN(cap) || cap <= 0) {
        errors.push('Capacity must be a positive number');
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
      return;
    }

    const createdEvent = await storage.createEvent(body);
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error('Error in POST /api/events:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update existing event
eventsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const body = req.body;

    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Request body must be a valid JSON object' });
      return;
    }

    // Capacity validation if provided
    if (body.capacity !== undefined) {
      const cap = Number(body.capacity);
      if (isNaN(cap) || cap <= 0) {
        res.status(400).json({ error: 'Validation failed', details: ['Capacity must be a positive number'] });
        return;
      }
    }

    const updated = await storage.updateEvent(id, body);

    if (!updated) {
      res.status(404).json({
        error: 'Event not found',
        message: `Cannot update non-existent event with id '${id}'`
      });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error(`Error in PUT /api/events/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event and its registrations
eventsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const result = await storage.deleteEvent(id);

    if (!result.deleted) {
      res.status(404).json({
        error: 'Event not found',
        message: `Cannot delete non-existent event with id '${id}'`
      });
      return;
    }

    res.json({
      message: 'Event and associated registrations deleted successfully',
      id,
      deletedRegistrationsCount: result.deletedRegistrationsCount
    });
  } catch (error) {
    console.error(`Error in DELETE /api/events/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/events/:id/register - Register student for event
eventsRouter.post('/:id/register', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const body = req.body;

    if (!body || typeof body !== 'object') {
      res.status(400).json({
        error: 'Validation failed',
        message: 'Request body must be a valid JSON object'
      });
      return;
    }

    const {
      studentId,
      studentName,
      studentEmail,
      studentPhone,
      rollNumber,
      department,
      yearOfStudy,
      collegeName,
      additionalNotes,
      seatPass
    } = body;

    const errors: string[] = [];

    // Identification validation (Roll Number or Student ID)
    const effectiveRoll = (rollNumber || studentId || '').toString().trim();
    if (!effectiveRoll) {
      errors.push('University Roll Number (or Student ID) is required');
    }

    // Name validation
    if (studentName !== undefined && (typeof studentName !== 'string' || studentName.trim().length < 2)) {
      errors.push('Full Name is required and must be at least 2 characters');
    }

    // Email format validation
    if (studentEmail !== undefined && studentEmail !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof studentEmail !== 'string' || !emailRegex.test(studentEmail.trim())) {
        errors.push('A valid email address is required (e.g. student@campus.edu)');
      }
    }

    // Phone validation if supplied
    if (studentPhone !== undefined && studentPhone !== '') {
      const phoneDigits = String(studentPhone).replace(/\D/g, '');
      if (phoneDigits.length < 7) {
        errors.push('Phone number must contain at least 7 digits');
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
        message: errors.join('; ')
      });
      return;
    }

    const result = await storage.registerStudent(id, {
      studentId: (studentId || effectiveRoll).trim(),
      studentName: studentName ? String(studentName).trim() : undefined,
      studentEmail: studentEmail ? String(studentEmail).trim() : undefined,
      studentPhone: studentPhone ? String(studentPhone).trim() : undefined,
      rollNumber: effectiveRoll,
      department: department ? String(department).trim() : undefined,
      yearOfStudy: yearOfStudy ? String(yearOfStudy).trim() : undefined,
      collegeName: collegeName ? String(collegeName).trim() : undefined,
      additionalNotes: additionalNotes ? String(additionalNotes).trim() : undefined,
      seatPass: seatPass ? String(seatPass).trim() : undefined
    });

    if (!result.success) {
      res.status(result.statusCode).json({
        error: result.error,
        message: result.message
      });
      return;
    }

    res.status(201).json({
      message: result.message,
      registration: result.registration,
      event: result.event
    });
  } catch (error) {
    console.error(`Error in POST /api/events/${req.params.id}/register:`, error);
    res.status(500).json({ error: 'Failed to process event registration' });
  }
});

// GET /api/events/:id/registrations - Get all registrations for an event
eventsRouter.get('/:id/registrations', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = await storage.getRegistrationsForEvent(id);

    if (!data.event) {
      res.status(404).json({
        error: 'Event not found',
        message: `No event found with id '${id}'`
      });
      return;
    }

    res.json({
      eventId: id,
      eventTitle: data.event.title,
      count: data.registrations.length,
      capacity: data.event.capacity,
      registrations: data.registrations
    });
  } catch (error) {
    console.error(`Error in GET /api/events/${req.params.id}/registrations:`, error);
    res.status(500).json({ error: 'Failed to retrieve event registrations' });
  }
});
