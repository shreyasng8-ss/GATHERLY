import {
  EventItem,
  RegistrationRecord,
  EventRegistrationPayload,
  TicketVerificationResponse,
  TaskItem
} from '../types';

/**
 * Resolves the backend API base URL:
 * 1. Explicit environment variable: VITE_API_BASE_URL
 * 2. Deployed frontend on Vercel: https://gatherly-7zxe.onrender.com/api
 * 3. Local development fallback: '/api' (proxied by Vite dev server to backend)
 */
const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    window.location &&
    (window.location.hostname.endsWith('.vercel.app') || window.location.hostname.includes('gatherly'))
  ) {
    return 'https://gatherly-7zxe.onrender.com/api';
  }

  return '/api';
};

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: any) {
    console.error(`Network request failed for ${url}:`, err);
    throw new ApiError(
      `Unable to reach backend server at ${API_BASE_URL}. If the free-tier service was asleep, please wait a moment and try again.`,
      0
    );
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `HTTP request failed with status ${res.status}`;
    const details = data?.details;
    throw new ApiError(errorMsg, res.status, details);
  }

  return data as T;
}

export const api = {
  // 1. GET /api/events
  async getEvents(filters?: { category?: string; search?: string }): Promise<EventItem[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await safeFetch(`${API_BASE_URL}/events${queryString}`);
    return handleResponse<EventItem[]>(res);
  },

  // 2. GET /api/events/:id
  async getEventById(id: string): Promise<EventItem> {
    const res = await safeFetch(`${API_BASE_URL}/events/${encodeURIComponent(id)}`);
    return handleResponse<EventItem>(res);
  },

  // 3. POST /api/events
  async createEvent(eventData: Partial<EventItem>): Promise<EventItem> {
    const res = await safeFetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse<EventItem>(res);
  },

  // 4. PUT /api/events/:id
  async updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem> {
    const res = await safeFetch(`${API_BASE_URL}/events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return handleResponse<EventItem>(res);
  },

  // 5. DELETE /api/events/:id
  async deleteEvent(id: string): Promise<{ message: string; id: string; deletedRegistrationsCount?: number }> {
    const res = await safeFetch(`${API_BASE_URL}/events/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: string; deletedRegistrationsCount?: number }>(res);
  },

  // 6. POST /api/events/:id/register
  async registerForEvent(
    eventId: string,
    studentData: EventRegistrationPayload
  ): Promise<{
    message: string;
    registration: RegistrationRecord;
    event: EventItem;
  }> {
    const res = await safeFetch(`${API_BASE_URL}/events/${encodeURIComponent(eventId)}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    return handleResponse<{
      message: string;
      registration: RegistrationRecord;
      event: EventItem;
    }>(res);
  },

  // 7. GET /api/events/:id/registrations
  async getEventRegistrations(eventId: string): Promise<{
    eventId: string;
    eventTitle: string;
    count: number;
    capacity: number;
    registrations: RegistrationRecord[];
  }> {
    const res = await safeFetch(`${API_BASE_URL}/events/${encodeURIComponent(eventId)}/registrations`);
    return handleResponse<{
      eventId: string;
      eventTitle: string;
      count: number;
      capacity: number;
      registrations: RegistrationRecord[];
    }>(res);
  },

  // 8. GET /api/students/:studentId/registrations
  async getStudentRegistrations(studentId: string): Promise<{
    studentId: string;
    count: number;
    registrations: Array<{ registration: RegistrationRecord; event: EventItem }>;
  }> {
    const res = await safeFetch(`${API_BASE_URL}/students/${encodeURIComponent(studentId)}/registrations`);
    return handleResponse<{
      studentId: string;
      count: number;
      registrations: Array<{ registration: RegistrationRecord; event: EventItem }>;
    }>(res);
  },

  // 9. GET /api/tickets/:ticketId/verify
  async verifyTicket(ticketId: string): Promise<TicketVerificationResponse> {
    const res = await safeFetch(`${API_BASE_URL}/tickets/${encodeURIComponent(ticketId)}/verify`);
    return handleResponse<TicketVerificationResponse>(res);
  },

  // 10. Tasks Persistence
  async getTasks(): Promise<TaskItem[]> {
    const res = await safeFetch(`${API_BASE_URL}/tasks`);
    return handleResponse<TaskItem[]>(res);
  },

  async createTask(data: { title: string; assignee: string; assigneeAvatar?: string }): Promise<TaskItem> {
    const res = await safeFetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<TaskItem>(res);
  },

  async toggleTask(id: string): Promise<TaskItem> {
    const res = await safeFetch(`${API_BASE_URL}/tasks/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
    });
    return handleResponse<TaskItem>(res);
  },

  async deleteTask(id: string): Promise<{ message: string; id: string }> {
    const res = await safeFetch(`${API_BASE_URL}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; id: string }>(res);
  },
};
