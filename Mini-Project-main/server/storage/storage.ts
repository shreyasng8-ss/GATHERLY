import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  EventItem,
  RegistrationRecord,
  TaskItem,
  TicketVerificationResponse,
  CheckInResponse,
  ClubItem,
  ClubMembership
} from '../../src/types';
import { selectEventImage } from '../utils/eventImageSelector';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, '../data');

const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const CLUBS_FILE = path.join(DATA_DIR, 'clubs.json');
const CLUB_MEMBERSHIPS_FILE = path.join(DATA_DIR, 'club_memberships.json');

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

const SEED_CLUBS: ClubItem[] = [
  {
    id: 'club-coding',
    name: 'Coding Club',
    category: 'Technology',
    description: 'Hands-on coding sprints, competitive programming, open-source projects, and technical interview preparation.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    memberCount: 142,
    leadName: 'Sarah Jenkins',
    meetingSchedule: 'Wednesdays • 6:00 PM',
    tags: ['Coding', 'WebDev', 'Python', 'OpenSource']
  },
  {
    id: 'club-cultural',
    name: 'Cultural Club',
    category: 'Cultural',
    description: 'Celebrating campus diversity, traditional festivities, cultural nights, and festive celebrations throughout the academic year.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    memberCount: 198,
    leadName: 'Maya Patel',
    meetingSchedule: 'Thursdays • 5:30 PM',
    tags: ['Festivals', 'Heritage', 'Celebration', 'Traditions']
  },
  {
    id: 'club-dance',
    name: 'Dance Society',
    category: 'Performing Arts',
    description: 'Expressive choreography, hip-hop, contemporary, and classical dance routines for university showcases and state competitions.',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    memberCount: 86,
    leadName: 'Elena Rostova',
    meetingSchedule: 'Tuesdays & Fridays • 6:30 PM',
    tags: ['Dance', 'Choreography', 'HipHop', 'Performance']
  },
  {
    id: 'club-music',
    name: 'Music Club',
    category: 'Music',
    description: 'A vibrant collective of vocalists, instrumentalists, and music producers hosting jam sessions, acoustic nights, and concerts.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    memberCount: 115,
    leadName: 'Marcus Vance',
    meetingSchedule: 'Mondays • 6:00 PM',
    tags: ['Acoustic', 'Vocals', 'Bands', 'JamSessions']
  },
  {
    id: 'club-sports',
    name: 'Sports Club',
    category: 'Athletics',
    description: 'Organizing inter-college cricket, football, basketball leagues, campus fitness marathons, and sports meets.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    memberCount: 230,
    leadName: 'Devin Taylor',
    meetingSchedule: 'Saturdays • 8:00 AM',
    tags: ['Cricket', 'Football', 'Basketball', 'Fitness']
  },
  {
    id: 'club-photo',
    name: 'Photography Club',
    category: 'Creative Arts',
    description: 'Visual storytelling, photowalks, camera technique masterclasses, and campus event documentation.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    memberCount: 74,
    leadName: 'Aiden Scott',
    meetingSchedule: 'Bi-weekly Sundays • 10:00 AM',
    tags: ['Photography', 'Photowalk', 'Camera', 'VisualArts']
  },
  {
    id: 'club-ecell',
    name: 'Entrepreneurship Club',
    category: 'Business',
    description: 'Fostering student startup culture, venture pitch competitions, angel investor keynotes, and product incubation.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    memberCount: 95,
    leadName: 'Priya Das',
    meetingSchedule: 'Fridays • 5:00 PM',
    tags: ['Startups', 'Pitch', 'Networking', 'Venture']
  }
];

const SEED_CLUB_MEMBERSHIPS: ClubMembership[] = [
  {
    id: 'mem-1',
    clubId: 'club-coding',
    studentId: '#GTH-8821',
    studentName: 'Alex Chen',
    joinedAt: '2024-09-15T10:00:00.000Z'
  },
  {
    id: 'mem-2',
    clubId: 'club-cultural',
    studentId: '#GTH-8821',
    studentName: 'Alex Chen',
    joinedAt: '2024-09-20T14:30:00.000Z'
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

    // Initialize clubs if file does not exist or is empty
    if (!fs.existsSync(CLUBS_FILE)) {
      await safeWriteJson(CLUBS_FILE, SEED_CLUBS);
      console.log('[Storage] Initialized clubs.json with seed clubs.');
    }

    // Initialize club memberships if file does not exist or is empty
    if (!fs.existsSync(CLUB_MEMBERSHIPS_FILE)) {
      await safeWriteJson(CLUB_MEMBERSHIPS_FILE, SEED_CLUB_MEMBERSHIPS);
      console.log('[Storage] Initialized club_memberships.json with seed memberships.');
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

  private async readClubsRaw(): Promise<ClubItem[]> {
    await this.init();
    return safeReadJson<ClubItem[]>(CLUBS_FILE, []);
  }

  private async writeClubsRaw(clubs: ClubItem[]): Promise<void> {
    await safeWriteJson(CLUBS_FILE, clubs);
  }

  private async readClubMembershipsRaw(): Promise<ClubMembership[]> {
    await this.init();
    return safeReadJson<ClubMembership[]>(CLUB_MEMBERSHIPS_FILE, []);
  }

  private async writeClubMembershipsRaw(memberships: ClubMembership[]): Promise<void> {
    await safeWriteJson(CLUB_MEMBERSHIPS_FILE, memberships);
  }

  // Calculate actual registration counts and apply sensible image fallback
  private enrichEventWithCounts(event: EventItem, registrations: RegistrationRecord[]): EventItem {
    const eventRegistrations = registrations.filter((r) => r.eventId === event.id);
    const validImage =
      event.image && event.image.trim().length > 0 && !event.image.includes('placeholder')
        ? event.image
        : selectEventImage({
            title: event.title,
            category: event.category,
            type: event.type,
            description: event.description
          });

    return {
      ...event,
      image: validImage,
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
      const selectedImage =
        eventData.image &&
        eventData.image.trim().length > 0 &&
        eventData.image !==
          'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80'
          ? eventData.image.trim()
          : selectEventImage({
              title: eventData.title,
              category: eventData.category,
              type: eventData.type,
              description: eventData.description
            });

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
        image: selectedImage,
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

      let cleanQuery = ticketId.trim();
      // Handle URL format if passed
      if (cleanQuery.includes('ticket=')) {
        try {
          const u = new URL(cleanQuery, 'http://dummy.com');
          const tParam = u.searchParams.get('ticket');
          if (tParam) cleanQuery = tParam.trim();
        } catch {
          const match = cleanQuery.match(/ticket=([^&]+)/);
          if (match) cleanQuery = decodeURIComponent(match[1]).trim();
        }
      }
      cleanQuery = cleanQuery.replace(/^["']|["']$/g, '').toLowerCase();

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
        status: reg.status || (reg.checkedIn ? 'Attended' : 'Confirmed'),
        checkedIn: Boolean(reg.checkedIn),
        checkedInAt: reg.checkedInAt,
        checkedInBy: reg.checkedInBy,
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
        message: reg.checkedIn
          ? `Gate pass is valid and was checked in at ${reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString() : 'an earlier time'}.`
          : 'Gate pass successfully verified and approved for entry.',
        verifiedAt: new Date().toISOString()
      };
    });
  }

  async checkInTicket(
    ticketOrCode: string,
    options?: {
      expectedEventId?: string;
      checkedInBy?: string;
      isOrganizer?: boolean;
    }
  ): Promise<CheckInResponse> {
    return withLock(async () => {
      // 1. Organizer authorization check
      if (options?.isOrganizer === false) {
        return {
          success: false,
          status: 'unauthorized',
          message: 'Unauthorized: Only event organizers are permitted to check in attendees.',
          error: 'Unauthorized'
        };
      }

      const [events, registrations] = await Promise.all([
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      // Normalize ticket code or full verification URL from QR scanner
      let cleanQuery = (ticketOrCode || '').trim();
      if (cleanQuery.includes('ticket=')) {
        try {
          const u = new URL(cleanQuery, 'http://dummy.com');
          const tParam = u.searchParams.get('ticket');
          if (tParam) cleanQuery = tParam.trim();
        } catch {
          const match = cleanQuery.match(/ticket=([^&]+)/);
          if (match) cleanQuery = decodeURIComponent(match[1]).trim();
        }
      }

      cleanQuery = cleanQuery.replace(/^["']|["']$/g, '').trim().toLowerCase();

      // 2. Locate registration record
      const regIndex = registrations.findIndex(
        (r) =>
          (r.ticketId && r.ticketId.toLowerCase() === cleanQuery) ||
          r.id.toLowerCase() === cleanQuery
      );

      if (regIndex === -1) {
        return {
          success: false,
          status: 'invalid_ticket',
          ticketId: ticketOrCode,
          message: `Ticket identifier '${ticketOrCode}' is not recognized in the registration records.`,
          error: 'Invalid Ticket'
        };
      }

      const reg = registrations[regIndex];
      const actualEvent = events.find((e) => e.id === reg.eventId);

      // 3. Verify event matching if checking in for a specific event
      if (options?.expectedEventId && reg.eventId !== options.expectedEventId) {
        const expectedEvent = events.find((e) => e.id === options.expectedEventId);
        return {
          success: false,
          status: 'wrong_event',
          ticketId: reg.ticketId,
          registrationId: reg.id,
          studentName: reg.studentName,
          rollNumber: reg.rollNumber,
          department: reg.department,
          seatPass: reg.seatPass,
          actualEvent: actualEvent
            ? {
                id: actualEvent.id,
                title: actualEvent.title,
                date: actualEvent.date,
                venue: actualEvent.venue
              }
            : undefined,
          expectedEvent: expectedEvent
            ? {
                id: expectedEvent.id,
                title: expectedEvent.title
              }
            : undefined,
          message: `This ticket belongs to "${actualEvent?.title || reg.eventId}", not "${expectedEvent?.title || options.expectedEventId}".`,
          error: 'Wrong Event'
        };
      }

      // 4. Prevent duplicate check-in
      if (reg.checkedIn) {
        return {
          success: false,
          status: 'already_checked_in',
          ticketId: reg.ticketId,
          registrationId: reg.id,
          studentName: reg.studentName,
          rollNumber: reg.rollNumber,
          department: reg.department,
          seatPass: reg.seatPass,
          checkedInAt: reg.checkedInAt,
          originalCheckedInAt: reg.checkedInAt,
          event: actualEvent
            ? {
                id: actualEvent.id,
                title: actualEvent.title,
                venue: actualEvent.venue,
                date: actualEvent.date
              }
            : undefined,
          message: `Attendee ${reg.studentName} was ALREADY checked in at ${reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString() : 'earlier'}. Duplicate entry rejected!`,
          error: 'Duplicate Check-In'
        };
      }

      // 5. Successful check-in mutation
      const checkInTimestamp = new Date().toISOString();
      const updatedReg: RegistrationRecord = {
        ...reg,
        checkedIn: true,
        checkedInAt: checkInTimestamp,
        checkedInBy: options?.checkedInBy || 'Organizer Check-In Station',
        status: 'Attended'
      };

      registrations[regIndex] = updatedReg;
      await this.writeRegistrationsRaw(registrations);

      return {
        success: true,
        status: 'checked_in',
        ticketId: updatedReg.ticketId,
        registrationId: updatedReg.id,
        studentId: updatedReg.studentId,
        studentName: updatedReg.studentName,
        rollNumber: updatedReg.rollNumber,
        department: updatedReg.department,
        yearOfStudy: updatedReg.yearOfStudy,
        seatPass: updatedReg.seatPass,
        checkedInAt: checkInTimestamp,
        event: actualEvent
          ? {
              id: actualEvent.id,
              title: actualEvent.title,
              category: actualEvent.category,
              date: actualEvent.date,
              time: actualEvent.time,
              venue: actualEvent.venue
            }
          : undefined,
        message: `Check-in confirmed for ${updatedReg.studentName}! Gate entry authorized.`
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

  // -------------------------------------------------------------
  // CLUB OPERATIONS (Feature 3 & 5)
  // -------------------------------------------------------------

  private getClubEvents(club: ClubItem, events: EventItem[]): EventItem[] {
    const cName = club.name.toLowerCase();
    const cat = club.category.toLowerCase();
    return events.filter((e) => {
      const eCat = (e.category || '').toLowerCase();
      const eType = (e.type || '').toLowerCase();
      const eTitle = (e.title || '').toLowerCase();
      const eOrg = (e.organizer || '').toLowerCase();

      if (club.id === 'club-coding') {
        return (
          eCat.includes('tech') ||
          eType.includes('tech') ||
          eCat.includes('hackathon') ||
          eType.includes('hackathon') ||
          eOrg.includes('gdsc') ||
          eOrg.includes('web3')
        );
      }
      if (club.id === 'club-cultural') {
        return (
          eCat.includes('cultural') ||
          eType.includes('cultural') ||
          eTitle.includes('fest') ||
          eTitle.includes('garba')
        );
      }
      if (club.id === 'club-dance') {
        return eCat.includes('dance') || eType.includes('dance') || eTitle.includes('dance');
      }
      if (club.id === 'club-music') {
        return eCat.includes('music') || eType.includes('music') || eTitle.includes('song') || eTitle.includes('concert');
      }
      if (club.id === 'club-sports') {
        return (
          eCat.includes('sports') ||
          eType.includes('sports') ||
          eTitle.includes('cricket') ||
          eTitle.includes('football') ||
          eTitle.includes('tournament')
        );
      }
      if (club.id === 'club-photo') {
        return eTitle.includes('photo') || eTitle.includes('camera') || eTitle.includes('lens');
      }
      if (club.id === 'club-ecell') {
        return eCat.includes('career') || eType.includes('career') || eTitle.includes('fair') || eTitle.includes('startup');
      }
      return eCat.includes(cat) || eTitle.includes(cName);
    });
  }

  async getAllClubs(studentId?: string): Promise<ClubItem[]> {
    return withLock(async () => {
      const [clubs, memberships] = await Promise.all([
        this.readClubsRaw(),
        this.readClubMembershipsRaw()
      ]);

      const effectiveStudentId = studentId ? studentId.trim() : undefined;

      return clubs.map((club) => {
        const clubMems = memberships.filter((m) => m.clubId === club.id);
        const isJoined = effectiveStudentId
          ? clubMems.some((m) => m.studentId.toLowerCase() === effectiveStudentId.toLowerCase())
          : false;

        return {
          ...club,
          memberCount: club.memberCount ? Math.max(club.memberCount, clubMems.length) : clubMems.length,
          isJoined
        };
      });
    });
  }

  async getClubById(id: string, studentId?: string): Promise<ClubItem | null> {
    return withLock(async () => {
      const [clubs, memberships, events, registrations] = await Promise.all([
        this.readClubsRaw(),
        this.readClubMembershipsRaw(),
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      const club = clubs.find((c) => c.id === id);
      if (!club) return null;

      const enrichedEvents = events.map((e) => this.enrichEventWithCounts(e, registrations));
      const clubEvents = this.getClubEvents(club, enrichedEvents);
      const clubMems = memberships.filter((m) => m.clubId === club.id);

      const effectiveStudentId = studentId ? studentId.trim() : undefined;
      const isJoined = effectiveStudentId
        ? clubMems.some((m) => m.studentId.toLowerCase() === effectiveStudentId.toLowerCase())
        : false;

      return {
        ...club,
        memberCount: club.memberCount ? Math.max(club.memberCount, clubMems.length) : clubMems.length,
        isJoined,
        events: clubEvents
      };
    });
  }

  async joinClub(
    clubId: string,
    studentId: string,
    studentName?: string
  ): Promise<{ success: boolean; message: string; club: ClubItem; alreadyJoined?: boolean }> {
    return withLock(async () => {
      const [clubs, memberships] = await Promise.all([
        this.readClubsRaw(),
        this.readClubMembershipsRaw()
      ]);

      const clubIndex = clubs.findIndex((c) => c.id === clubId);
      if (clubIndex === -1) {
        throw new Error(`Club with id '${clubId}' not found`);
      }

      const existingMem = memberships.find(
        (m) =>
          m.clubId === clubId &&
          m.studentId.toLowerCase().trim() === studentId.toLowerCase().trim()
      );

      if (existingMem) {
        return {
          success: true,
          alreadyJoined: true,
          message: `Already a member of ${clubs[clubIndex].name}.`,
          club: { ...clubs[clubIndex], isJoined: true }
        };
      }

      const newMembership: ClubMembership = {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        clubId,
        studentId: studentId.trim(),
        studentName: studentName?.trim() || 'Alex Chen',
        joinedAt: new Date().toISOString()
      };

      memberships.push(newMembership);
      await this.writeClubMembershipsRaw(memberships);

      clubs[clubIndex].memberCount = (clubs[clubIndex].memberCount || 0) + 1;
      await this.writeClubsRaw(clubs);

      return {
        success: true,
        message: `Successfully joined ${clubs[clubIndex].name}!`,
        club: { ...clubs[clubIndex], isJoined: true }
      };
    });
  }

  async leaveClub(
    clubId: string,
    studentId: string
  ): Promise<{ success: boolean; message: string; club: ClubItem }> {
    return withLock(async () => {
      const [clubs, memberships] = await Promise.all([
        this.readClubsRaw(),
        this.readClubMembershipsRaw()
      ]);

      const clubIndex = clubs.findIndex((c) => c.id === clubId);
      if (clubIndex === -1) {
        throw new Error(`Club with id '${clubId}' not found`);
      }

      const memIndex = memberships.findIndex(
        (m) =>
          m.clubId === clubId &&
          m.studentId.toLowerCase().trim() === studentId.toLowerCase().trim()
      );

      if (memIndex !== -1) {
        memberships.splice(memIndex, 1);
        await this.writeClubMembershipsRaw(memberships);

        clubs[clubIndex].memberCount = Math.max(0, (clubs[clubIndex].memberCount || 1) - 1);
        await this.writeClubsRaw(clubs);
      }

      return {
        success: true,
        message: `Left ${clubs[clubIndex].name}.`,
        club: { ...clubs[clubIndex], isJoined: false }
      };
    });
  }

  async getClubsForStudent(studentId: string): Promise<ClubItem[]> {
    return withLock(async () => {
      const [clubs, memberships, events, registrations] = await Promise.all([
        this.readClubsRaw(),
        this.readClubMembershipsRaw(),
        this.readEventsRaw(),
        this.readRegistrationsRaw()
      ]);

      const normId = studentId.toLowerCase().trim();
      const studentClubIds = new Set(
        memberships.filter((m) => m.studentId.toLowerCase().trim() === normId).map((m) => m.clubId)
      );

      const enrichedEvents = events.map((e) => this.enrichEventWithCounts(e, registrations));

      return clubs
        .filter((c) => studentClubIds.has(c.id))
        .map((club) => {
          const clubMems = memberships.filter((m) => m.clubId === club.id);
          const clubEvents = this.getClubEvents(club, enrichedEvents);
          return {
            ...club,
            memberCount: club.memberCount ? Math.max(club.memberCount, clubMems.length) : clubMems.length,
            isJoined: true,
            events: clubEvents
          };
        });
    });
  }
}

export const storage = new StorageService();
