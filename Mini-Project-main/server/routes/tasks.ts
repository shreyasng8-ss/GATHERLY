import { Router, Request, Response } from 'express';
import { storage } from '../storage/storage';

export const tasksRouter = Router();

// GET /api/tasks - List all organizer prep tasks
tasksRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// POST /api/tasks - Create new task
tasksRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, assignee, assigneeAvatar } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ error: 'Validation failed', message: 'Task title is required' });
      return;
    }

    if (!assignee || typeof assignee !== 'string' || assignee.trim().length === 0) {
      res.status(400).json({ error: 'Validation failed', message: 'Assignee is required' });
      return;
    }

    const newTask = await storage.createTask({
      title,
      assignee,
      assigneeAvatar
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id/toggle - Toggle task completion status
tasksRouter.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await storage.toggleTask(id);

    if (!updated) {
      res.status(404).json({ error: 'Task not found', message: `No task found with id '${id}'` });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error(`Error in PATCH /api/tasks/${req.params.id}/toggle:`, error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete task
tasksRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await storage.deleteTask(id);

    if (!deleted) {
      res.status(404).json({ error: 'Task not found', message: `No task found with id '${id}'` });
      return;
    }

    res.json({ message: 'Task deleted successfully', id });
  } catch (error) {
    console.error(`Error in DELETE /api/tasks/${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});
