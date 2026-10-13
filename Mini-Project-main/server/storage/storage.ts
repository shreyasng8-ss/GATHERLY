import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  EventItem,
  RegistrationRecord,
  TaskItem,
  TicketVerificationResponse
} from '../../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, '../data');

const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Memory lock to queue concurrent writes safely
let writeLock = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeLock.then(fn, fn);
  writeLock = next.then(() => {}, () => {});
  return next;
}

// Ensure directory exists
async function ensureDir(dirPath: string): Promise<void> {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

// Atomic file write: writes to temp file first, then renames
async function safeWriteJson(filePath: string, data: any): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
  const jsonString = JSON.stringify(data, null, 2);
  await fs.promises.writeFile(tempPath, jsonString, 'utf8');
  await fs.promises.rename(tempPath, filePath);
}

// Safe file read
async function safeReadJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = await fs.promises.readFile(filePath, 'utf8');
    if (!raw.trim()) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return fallback;
  }
}

// Initial seed data preserving existing mock data
const SEED_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Intro to Web3 & Smart Contracts',
    category: 'Tech Workshop',
    type: 'Tech Workshop',
    status: 'Active',
    date: 'Oct 24 • 5:00 PM',
    time: '5:00 PM - 7:30 PM',
    venue: 'Innovation Center, Room 204',
    registeredCount: 3,
    capacity: 150,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    description: 'Hands-on session on Ethereum development, Solidity bytecode primitives, and smart contract security best practices.',
    eligibleYears: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
    seatPass: 'Zone B-14',
    organizer: 'GDSC Web3 Chapter',
    registrationLink: 'https://gatherly.campus.edu/rsvp/web3-smart-contracts'
  },
  {
    id: 'evt-2',
    title: 'Campus Hack 2024 Prep',
    category: 'Hackathon',
    type: 'Hackathon',
    status: 'Upcoming',
    date: 'Oct 28 • 10:00 AM',
    time: '10:00 AM - 4:00 PM',
    venue: 'Main Library, Collaborative Space',
    registeredCount: 2,
    capacity: 100,
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
    description: 'Form teams, pitch technical project themes, and review the hackathon API sponsor challenges before the main marathon.',
    eligibleYears: ['Sophomore', 'Junior', 'Senior'],
    seatPass: 'Zone A-08',
    organizer: 'Hackathon Organizing Committee',
    registrationLink: 'https://gatherly.campus.edu/rsvp/campushack2024'
  },
  {
    id: 'evt-3',
    title: 'Spring Career Fair 2024',
    category: 'Academic',
    type: 'Career',
    status: 'Upcoming',
    date: 'Oct 15, 2024 • 10:00 AM',
    time: '10:00 AM - 3:00 PM',
    venue: 'Student Union Hall',
    registeredCount: 0,
    capacity: 500,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'Connect with top employers from across the country looking for bright minds in engineering, design, and management.',
    eligibleYears: ['Freshman', 'Sophomore'],
    seatPass: 'Booth Hall Main',
    organizer: 'University Career Services',
    registrationLink: 'https://gatherly.campus.edu/rsvp/springfair2024'
  }
];

const SEED_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: 'reg-seed-1',
    eventId: 'evt-1',
    studentId: '#GTH-8821',
    studentName: 'Alex Chen',
    studentEmail: 'alex.chen@campus.edu',
    studentPhone: '+1 (555) 234-5678',
    rollNumber: 'GTH-8821',
    department: 'Computer Science & Engineering',
    yearOfStudy: 'Senior (Year 4)',
    collegeName: 'Campus Institute of Technology',
    ticketId: 'TKT-EVT1-ALEXCHEN',
    seatPass: 'Zone B-14',
    registeredAt: '2024-10-10T12:00:00.000Z',
    status: 'Confirmed'
  },
  {
    id: 'reg-seed-2',
    eventId: 'evt-1',
    studentId: '#GTH-9102',
    studentName: 'Sarah Jenkins',
    studentEmail: 'sarah.j@campus.edu',
    studentPhone: '+1 (555) 345-6789',
    rollNumber: 'GTH-9102',
    department: 'Electrical Engineering',
    yearOfStudy: 'Junior (Year 3)',
    collegeName: 'Campus Institute of Technology',
    ticketId: 'TKT-EVT1-SARAHJ',
    seatPass: 'Zone B-15',
    registeredAt: '2024-10-11T14:15:00.000Z',
    status: 'Confirmed'
  },
  {
    id: 'reg-seed-3',
    eventId: 'evt-1',
    studentId: '#GTH-7734',
    studentName: 'Marcus Thorne',
    studentEmail: 'marcus.t@campus.edu',
    studentPhone: '+1 (555) 456-7890',
    rollNumber: 'GTH-7734',
    department: 'Mechanical Engineering',
    yearOfStudy: 'Senior (Year 4)',
    collegeName: 'Campus Institute of Technology',
    ticketId: 'TKT-EVT1-MARCUST',
    seatPass: 'Zone B-16',
    registeredAt: '2024-10-11T16:45:00.000Z',
    status: 'Confirmed'
  },
  {
    id: 'reg-seed-4',
    eventId: 'evt-2',
    studentId: '#GTH-8821',
    studentName: 'Alex Chen',
    studentEmail: 'alex.chen@campus.edu',
    studentPhone: '+1 (555) 234-5678',
    rollNumber: 'GTH-8821',
    department: 'Computer Science & Engineering',
    yearOfStudy: 'Senior (Year 4)',
    collegeName: 'Campus Institute of Technology',
    ticketId: 'TKT-EVT2-ALEXCHEN',
    seatPass: 'Zone A-08',
    registeredAt: '2024-10-12T09:30:00.000Z',
    status: 'Confirmed'
  },
  {
    id: 'reg-seed-5',
    eventId: 'evt-2',
    studentId: '#GTH-8551',
    studentName: 'Leo Kim',
    studentEmail: 'leo.kim@campus.edu',
    studentPhone: '+1 (555) 567-8901',
    rollNumber: 'GTH-8551',
    department: 'Design & Media Arts',
    yearOfStudy: 'Sophomore (Year 2)',
    collegeName: 'Campus Institute of Technology',
    ticketId: 'TKT-EVT2-LEOKIM',
    seatPass: 'Zone A-09',
    registeredAt: '2024-10-12T11:00:00.000Z',
    status: 'Confirmed'
  }
];

const SEED_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Book Venue',
    assignee: 'Marcus Thorne',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tsk-2',
    title: 'Finalize Guest Speaker',
    assignee: 'Priya Das',
    assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tsk-3',
    title: 'Setup Registration Form',
    assignee: 'Sarah Jenkins',
    assigneeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tsk-4',
    title: 'Social Media Graphics',
    assignee: 'Leo Kim',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tsk-5',
    title: 'Equipment Check',
    assignee: 'Maya Patel',
    assigneeAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

export interface RegisterStudentData {
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  rollNumber?: string;
  department?: string;
  yearOfStudy?: string;
  collegeName?: string;
  additionalNotes?: string;
  seatPass?: string;
}

export class StorageService {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    await ensureDir(DATA_DIR);

    // Initialize events if file does not exist or is empty
    if (!fs.existsSync(EVENTS_FILE)) {
      await safeWriteJson(EVENTS_FILE, SEED_EVENTS);
      console.log('[Storage] Initialized events.json with seed events.');
    }

    // Initialize registrations if file does not exist or is empty
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      await safeWriteJson(REGISTRATIONS_FILE, SEED_REGISTRATIONS);
      console.log('[Storage] Initialized registrations.json with seed registrations.');
    } else {
      // Ensure seed records have ticketId
      const existingRegs = await safeReadJson<RegistrationRecord[]>(REGISTRATIONS_FILE, []);
      let updated = false;
      for (const reg of existingRegs) {
        if (!reg.ticketId) {
          reg.ticketId = `TKT-${reg.eventId.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          updated = true;
        }
        if (!reg.status) {
          reg.status = 'Confirmed';
          updated = true;
        }
      }
      if (updated) {
        await safeWriteJson(REGISTRATIONS_FILE, existingRegs);
      }
    }

    // Initialize tasks if file does not exist or is empty
    if (!fs.existsSync(TASKS_FILE)) {
      await safeWriteJson(TASKS_FILE, SEED_TASKS);
      console.log('[Storage] Initialized tasks.json with seed tasks.');
    }

    this.initialized = true;
  }

  private async readEventsRaw(): Promise<EventItem[]> {
    await this.init();
    return safeReadJson<EventItem[]>(EVENTS_FILE, []);
  }

  private async readRegistrationsRaw(): Promise<RegistrationRecord[]> {
    await this.init();
    return safeReadJson<RegistrationRecord[]>(REGISTRATIONS_FILE, []);
  }

  private async readTasksRaw(): Promise<TaskItem[]> {
    await this.init();
    return safeReadJson<TaskItem[]>(TASKS_FILE, []);
  }

  private async writeEventsRaw(events: EventItem[]): Promise<void> {
    await safeWriteJson(EVENTS_FILE, events);
  }

  private async writeRegistrationsRaw(registrations: RegistrationRecord[]): Promise<void> {
    await safeWriteJson(REGISTRATIONS_FILE, registrations);
  }

  private async writeTasksRaw(tasks: TaskItem[]): Promise<void> {
    await safeWriteJson(TASKS_FILE, tasks);
  }

  // Calculate actual registration counts from stored registrations
  private enrichEventWithCounts(event: EventItem, registrations: RegistrationRecord[]): EventItem {
    const eventRegistrations = registrations.filter((r) => r.eventId === event.id);
    return {
      ...event,
      registeredCount: eventRegistrations.length
    };
  }

  // -------------------------------------------------------------
  // EVENT OPERATIONS
  // -------------------------------------------------------------

  async getAllEvents(options?: { category?: string; search?: string }): Promise<EventItem[]> {
    return withLock(async () => {
      const [events, registrations] = await Promise.all([
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      let result = events.map((e) => this.enrichEventWithCounts(e, registrations));

      if (options?.category) {
        const cat = options.category.toLowerCase().trim();
        result = result.filter(
          (e) => (e.category && e.category.toLowerCase() === cat) ||
                 (e.type && e.type.toLowerCase() === cat)
        );
      }

      if (options?.search) {
        const term = options.search.toLowerCase().trim();
        result = result.filter(
          (e) => (e.title && e.title.toLowerCase().includes(term)) ||
                 (e.description && e.description.toLowerCase().includes(term)) ||
                 (e.venue && e.venue.toLowerCase().includes(term)) ||
                 (e.category && e.category.toLowerCase().includes(term))
        );
      }

      return result;
    });
  }

  async getEventById(id: string): Promise<EventItem | null> {
    return withLock(async () => {
      const [events, registrations] = await Promise.all([
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      const event = events.find((e) => e.id === id);
      if (!event) return null;

      return this.enrichEventWithCounts(event, registrations);
    });
  }

  async createEvent(eventData: Partial<EventItem>): Promise<EventItem> {
    return withLock(async () => {
      const events = await this.readEventsRaw();

      const newId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newEvent: EventItem = {
        id: newId,
        title: (eventData.title || '').trim(),
        category: (eventData.category || 'Tech Workshop').trim(),
        type: (eventData.type || eventData.category || 'Tech Workshop').trim(),
        status: eventData.status || 'Upcoming',
        date: (eventData.date || '').trim(),
        time: (eventData.time || '').trim(),
        venue: (eventData.venue || '').trim(),
        capacity: Number(eventData.capacity) || 100,
        registeredCount: 0,
        image: eventData.image || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
        description: (eventData.description || '').trim(),
        eligibleYears: Array.isArray(eventData.eligibleYears) && eventData.eligibleYears.length > 0
          ? eventData.eligibleYears
          : ['Freshman', 'Sophomore', 'Junior', 'Senior'],
        seatPass: eventData.seatPass || 'General Admission',
        organizer: (eventData.organizer || 'Campus Student Organization').trim(),
        registrationLink: eventData.registrationLink || undefined
      };

      events.unshift(newEvent);
      await this.writeEventsRaw(events);

      return newEvent;
    });
  }

  async updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem | null> {
    return withLock(async () => {
      const [events, registrations] = await Promise.all([
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      const index = events.findIndex((e) => e.id === id);
      if (index === -1) return null;

      const existing = events[index];
      const updated: EventItem = {
        ...existing,
        ...updates,
        id: existing.id, // Immutable ID
        registeredCount: registrations.filter((r) => r.eventId === id).length // Never overwrite count from client
      };

      if (updates.capacity !== undefined) {
        updated.capacity = Number(updates.capacity);
      }

      events[index] = updated;
      await this.writeEventsRaw(events);

      return updated;
    });
  }

  async deleteEvent(id: string): Promise<{ deleted: boolean; deletedRegistrationsCount: number }> {
    return withLock(async () => {
      const [events, registrations] = await Promise.all([
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      const eventIndex = events.findIndex((e) => e.id === id);
      if (eventIndex === -1) {
        return { deleted: false, deletedRegistrationsCount: 0 };
      }

      // Remove event
      events.splice(eventIndex, 1);
      await this.writeEventsRaw(events);

      // Cascade remove all registrations associated with the event
      const initialRegCount = registrations.length;
      const remainingRegistrations = registrations.filter((r) => r.eventId !== id);
      const deletedRegistrationsCount = initialRegCount - remainingRegistrations.length;

      if (deletedRegistrationsCount > 0) {
        await this.writeRegistrationsRaw(remainingRegistrations);
      }

      return { deleted: true, deletedRegistrationsCount };
    });
  }

  // -------------------------------------------------------------
  // REGISTRATION & TICKET OPERATIONS
  // -------------------------------------------------------------

  async registerStudent(
    eventId: string,
    data: RegisterStudentData
  ): Promise<{
    success: boolean;
    statusCode: number;
    error?: string;
    message: string;
    registration?: RegistrationRecord;
    event?: EventItem;
  }> {
    return withLock(async () => {
      const [events, registrations] = await Promise.all([
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      // 1. Check if event exists
      const event = events.find((e) => e.id === eventId);
      if (!event) {
        return {
          success: false,
          statusCode: 404,
          error: 'Event not found',
          message: `No event found with id '${eventId}'.`
        };
      }

      const cleanStudentId = (data.studentId || '').trim();
      const cleanRollNumber = (data.rollNumber || cleanStudentId).trim();

      // Normalize IDs for duplicate checking (e.g. "#GTH-8821" vs "gth-8821")
      const normalizeId = (id: string) => id.replace(/^#/, '').toLowerCase().trim();
      const targetStudent = normalizeId(cleanStudentId);
      const targetRoll = normalizeId(cleanRollNumber);

      // 2. Prevent duplicate registrations for same student and event
      const isAlreadyRegistered = registrations.some((r) => {
        if (r.eventId !== eventId) return false;
        const rStudent = normalizeId(r.studentId || '');
        const rRoll = normalizeId(r.rollNumber || r.studentId || '');
        return rStudent === targetStudent || (targetRoll && rRoll === targetRoll);
      });

      if (isAlreadyRegistered) {
        return {
          success: false,
          statusCode: 409,
          error: 'Duplicate registration',
          message: `Student with roll number/ID '${cleanRollNumber || cleanStudentId}' is already registered for '${event.title}'.`
        };
      }

      // 3. Respect event capacity
      const currentRegistrations = registrations.filter((r) => r.eventId === eventId);
      if (currentRegistrations.length >= event.capacity) {
        return {
          success: false,
          statusCode: 409,
          error: 'Event capacity reached',
          message: `Event '${event.title}' has reached its maximum capacity of ${event.capacity} attendees.`
        };
      }

      // 4. Generate unique Digital Ticket Gate Pass ID
      const eventCode = event.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const uniqueSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const ticketId = `TKT-${eventCode}-${uniqueSuffix}`;

      // 5. Create and persist registration record
      const regId = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const seatPass = data.seatPass || event.seatPass || `Zone A-Seat ${currentRegistrations.length + 1}`;

      const newRegistration: RegistrationRecord = {
        id: regId,
        eventId,
        studentId: cleanStudentId,
        studentName: (data.studentName || 'Student Attendee').trim(),
        studentEmail: (data.studentEmail || '').trim(),
        studentPhone: data.studentPhone?.trim() || undefined,
        rollNumber: cleanRollNumber,
        department: data.department?.trim() || 'General Engineering',
        yearOfStudy: data.yearOfStudy?.trim() || 'Year 1',
        collegeName: data.collegeName?.trim() || 'Campus Institute of Technology',
        ticketId,
        seatPass,
        registeredAt: new Date().toISOString(),
        status: 'Confirmed'
      };

      registrations.push(newRegistration);
      await this.writeRegistrationsRaw(registrations);

      // Recalculate event with updated count
      const updatedEvent = this.enrichEventWithCounts(event, registrations);

      return {
        success: true,
        statusCode: 201,
        message: `Successfully registered for '${event.title}'.`,
        registration: newRegistration,
        event: updatedEvent
      };
    });
  }

  async getRegistrationsForEvent(eventId: string): Promise<{
    event: EventItem | null;
    registrations: RegistrationRecord[];
  }> {
    return withLock(async () => {
      const [events, registrations] = await Promise.all([
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      const event = events.find((e) => e.id === eventId);
      if (!event) {
        return { event: null, registrations: [] };
      }

      const eventRegistrations = registrations.filter((r) => r.eventId === eventId);
      const enrichedEvent = this.enrichEventWithCounts(event, registrations);

      return {
        event: enrichedEvent,
        registrations: eventRegistrations
      };
    });
  }

  async getRegistrationsForStudent(studentId: string): Promise<
    Array<{ registration: RegistrationRecord; event: EventItem }>
  > {
    return withLock(async () => {
      const [events, registrations] = await Promise.all([
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      const normalizeId = (id: string) => id.replace(/^#/, '').toLowerCase().trim();
      const target = normalizeId(studentId);

      const studentRegs = registrations.filter((r) => {
        const sId = normalizeId(r.studentId || '');
        const rRoll = normalizeId(r.rollNumber || '');
        return sId === target || (rRoll && rRoll === target);
      });

      const results: Array<{ registration: RegistrationRecord; event: EventItem }> = [];

      for (const reg of studentRegs) {
        const event = events.find((e) => e.id === reg.eventId);
        if (event) {
          results.push({
            registration: reg,
            event: this.enrichEventWithCounts(event, registrations)
          });
        }
      }

      return results;
    });
  }

  async getTicketVerification(ticketId: string): Promise<TicketVerificationResponse> {
    return withLock(async () => {
      const [events, registrations] = await Promise.all([
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      const cleanQuery = ticketId.trim().toLowerCase();

      const reg = registrations.find(
        (r) =>
          (r.ticketId && r.ticketId.toLowerCase() === cleanQuery) ||
          r.id.toLowerCase() === cleanQuery
      );

      if (!reg) {
        return {
          valid: false,
          ticketId,
          error: 'Ticket not found',
          message: `No gate pass or registration matches ticket ID '${ticketId}'.`,
          verifiedAt: new Date().toISOString()
        };
      }

      const event = events.find((e) => e.id === reg.eventId);

      return {
        valid: true,
        ticketId: reg.ticketId,
        registrationId: reg.id,
        studentId: reg.studentId,
        studentName: reg.studentName,
        studentEmail: reg.studentEmail,
        rollNumber: reg.rollNumber,
        department: reg.department,
        yearOfStudy: reg.yearOfStudy,
        seatPass: reg.seatPass,
        registeredAt: reg.registeredAt,
        status: reg.status || 'Confirmed',
        event: event
          ? {
              id: event.id,
              title: event.title,
              category: event.category,
              date: event.date,
              time: event.time,
              venue: event.venue,
              organizer: event.organizer
            }
          : undefined,
        message: 'Gate pass successfully verified and approved for entry.',
        verifiedAt: new Date().toISOString()
      };
    });
  }

  // -------------------------------------------------------------
  // TASK OPERATIONS
  // -------------------------------------------------------------

  async getAllTasks(): Promise<TaskItem[]> {
    return withLock(async () => {
      return this.readTasksRaw();
    });
  }

  async createTask(data: { title: string; assignee: string; assigneeAvatar?: string }): Promise<TaskItem> {
    return withLock(async () => {
      const tasks = await this.readTasksRaw();
      const newTask: TaskItem = {
        id: `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: data.title.trim(),
        assignee: data.assignee.trim(),
        assigneeAvatar: data.assigneeAvatar,
        completed: false,
        createdAt: new Date().toISOString()
      };
      tasks.push(newTask);
      await this.writeTasksRaw(tasks);
      return newTask;
    });
  }

  async toggleTask(id: string): Promise<TaskItem | null> {
    return withLock(async () => {
      const tasks = await this.readTasksRaw();
      const task = tasks.find((t) => t.id === id);
      if (!task) return null;

      task.completed = !task.completed;
      await this.writeTasksRaw(tasks);
      return task;
    });
  }

  async deleteTask(id: string): Promise<boolean> {
    return withLock(async () => {
      const tasks = await this.readTasksRaw();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return false;

      tasks.splice(idx, 1);
      await this.writeTasksRaw(tasks);
      return true;
    });
  }
}

export const storage = new StorageService();
