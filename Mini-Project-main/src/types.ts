export type ScreenId =
  | 'login'
  | 'organizer'
  | 'student'
  | 'create-event'
  | 'team-tasks'
  | 'org-setup'
  | 'settings'
  | 'ticket-scanner'
  | 'verify-ticket';

export interface EventItem {
  id: string;
  title: string;
  category: string;
  type?: string;
  status?: 'Active' | 'Upcoming' | 'Past' | string;
  date: string;
  time: string;
  venue: string;
  registeredCount: number;
  capacity: number;
  image?: string;
  description?: string;
  eligibleYears?: string[];
  seatPass?: string;
  isRegistered?: boolean;
  registrationId?: string;
  ticketId?: string;
  registrationLink?: string;
  organizer?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  badgeText: string;
  badgeColor: string;
  avatar: string;
  tasksAssigned: number;
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  assigneeAvatar?: string;
  completed: boolean;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  timeAgo: string;
  type: string;
  read: boolean;
}

export interface StudentProfile {
  name: string;
  gradYear: string;
  standing: string;
  studentId: string;
  avatar: string;
  campusPassValid: boolean;
  liveTelemetry: boolean;
  upcomingCount: number;
  xp: number;
  xpMonthlyGain: number;
  joinedClubsCount: number;
  milestonesCompleted: number;
  milestonesTotal: number;
  tierStatus: string;
  nfcSynced: boolean;
  meshConnected: boolean;
}

export interface RegistrationRecord {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  rollNumber?: string;
  department?: string;
  yearOfStudy?: string;
  collegeName?: string;
  ticketId: string;
  seatPass?: string;
  registeredAt: string;
  status?: 'Confirmed' | 'Attended' | 'Cancelled';
  checkedIn?: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
}

export interface EventRegistrationPayload {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  rollNumber: string;
  department: string;
  yearOfStudy: string;
  collegeName?: string;
  additionalNotes?: string;
  studentId?: string;
  seatPass?: string;
}

export interface TicketVerificationResponse {
  valid: boolean;
  ticketId: string;
  registrationId?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  rollNumber?: string;
  department?: string;
  yearOfStudy?: string;
  seatPass?: string;
  registeredAt?: string;
  status?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  event?: {
    id: string;
    title: string;
    category: string;
    date: string;
    time: string;
    venue: string;
    organizer?: string;
  };
  error?: string;
  message?: string;
  verifiedAt: string;
}

export interface CheckInResponse {
  success: boolean;
  status: 'checked_in' | 'already_checked_in' | 'wrong_event' | 'invalid_ticket' | 'unauthorized';
  message: string;
  ticketId?: string;
  registrationId?: string;
  studentId?: string;
  studentName?: string;
  rollNumber?: string;
  department?: string;
  yearOfStudy?: string;
  seatPass?: string;
  checkedInAt?: string;
  originalCheckedInAt?: string;
  event?: {
    id: string;
    title: string;
    category?: string;
    date?: string;
    time?: string;
    venue?: string;
  };
  expectedEvent?: {
    id: string;
    title: string;
  };
  actualEvent?: {
    id: string;
    title: string;
    date?: string;
    venue?: string;
  };
  error?: string;
}

