/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScreenId, EventItem, TeamMember, TaskItem, NotificationItem } from './types';
import {
  initialEvents,
  initialTeamMembers,
  initialTasks,
  initialOrganizerNotifications,
  initialStudentNotifications,
  studentProfile,
} from './data/mockData';
import { api } from './services/api';
import { TopNavSwitcher } from './components/TopNavSwitcher';
import { DeviceFrame } from './components/DeviceFrame';
import { LoginScreen } from './components/screens/LoginScreen';
import { OrganizerDashboardScreen } from './components/screens/OrganizerDashboardScreen';
import { StudentDashboardScreen } from './components/screens/StudentDashboardScreen';
import { CreateEventScreen } from './components/screens/CreateEventScreen';
import { EventPrepScreen } from './components/screens/EventPrepScreen';
import { OrgSetupScreen } from './components/screens/OrgSetupScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { TicketModal } from './components/modals/TicketModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [viewMode, setViewMode] = useState<'frame' | 'responsive'>('frame');

  // Application State
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);

  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [organizerNotifs, setOrganizerNotifs] =
    useState<NotificationItem[]>(initialOrganizerNotifications);
  const [studentNotifs, setStudentNotifs] =
    useState<NotificationItem[]>(initialStudentNotifications);
  
  // Ticket Modal State
  const [ticketEvent, setTicketEvent] = useState<EventItem | null>(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Fetch events from real backend API and check student registrations
  const refreshEvents = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoadingEvents(true);

      const [eventsResult, studentRegsResult] = await Promise.allSettled([
        api.getEvents(),
        api.getStudentRegistrations(studentProfile.studentId),
      ]);

      if (eventsResult.status === 'fulfilled' && Array.isArray(eventsResult.value)) {
        // Build set of registered event IDs for the logged-in student
        const registeredIds = new Set<string>();
        if (
          studentRegsResult.status === 'fulfilled' &&
          Array.isArray(studentRegsResult.value?.registrations)
        ) {
          for (const item of studentRegsResult.value.registrations) {
            if (item.registration?.eventId) registeredIds.add(item.registration.eventId);
            if (item.event?.id) registeredIds.add(item.event.id);
          }
        }

        const syncedEvents = eventsResult.value.map((evt) => ({
          ...evt,
          isRegistered: registeredIds.has(evt.id) || Boolean(evt.isRegistered),
        }));

        setEvents(syncedEvents);
      }
    } catch (err: any) {
      console.warn('Backend API connection note, using local fallback:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const handleResetData = () => {
    setEvents(initialEvents);
    setTasks(initialTasks);
    setOrganizerNotifs(initialOrganizerNotifications);
    setStudentNotifs(initialStudentNotifications);
    showToast('Application mock data reset to original defaults.');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (title: string, assignee: string, assigneeAvatar?: string) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title,
      assignee,
      assigneeAvatar,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // Feature 1: Create Event via real API
  const handlePublishEvent = async (newEventData: Partial<EventItem>) => {
    try {
      const created = await api.createEvent(newEventData);
      setEvents((prev) => [created, ...prev]);
      showToast(`Event "${created.title}" published & saved to backend!`);
      // Re-sync with backend in background
      refreshEvents(true);
    } catch (err: any) {
      console.error('Failed to publish event via API:', err);
      // Fallback local creation if backend unavailable
      const fallbackEvt: EventItem = {
        id: `evt-${Date.now()}`,
        title: newEventData.title || 'Untitled Event',
        category: newEventData.category || 'Tech Workshop',
        type: newEventData.type || 'Tech Workshop',
        status: 'Upcoming',
        date: newEventData.date || 'Nov 02 • 4:00 PM',
        time: newEventData.time || '4:00 PM - 6:00 PM',
        venue: newEventData.venue || 'Student Union Hall',
        registeredCount: 0,
        capacity: newEventData.capacity || 200,
        image: newEventData.image || initialEvents[0].image,
        description: newEventData.description || '',
        eligibleYears: newEventData.eligibleYears || ['Freshman'],
        seatPass: 'General Admission',
        isRegistered: false,
      };
      setEvents((prev) => [fallbackEvt, ...prev]);
      showToast(err?.message ? `Notice: ${err.message}` : 'Event saved locally.');
    }
  };

  // Feature 1: Update Event via real API
  const handleUpdateEvent = async (id: string, updatedData: Partial<EventItem>) => {
    try {
      const updated = await api.updateEvent(id, updatedData);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
      );
      showToast(`Event "${updated.title}" updated successfully!`);
      setEditingEvent(null);
      refreshEvents(true);
    } catch (err: any) {
      console.error('Failed to update event via API:', err);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updatedData } : e))
      );
      showToast(err?.message ? `Update error: ${err.message}` : 'Event updated locally.');
    }
  };

  // Feature 1: Delete Event via real API
  const handleDeleteEvent = async (id: string) => {
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast('Event deleted from backend database.');
    } catch (err: any) {
      console.error('Failed to delete event via API:', err);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast(err?.message || 'Event removed.');
    }
  };

  // Feature 2: Event Registration via real API
  const handleRegisterEvent = async (eventId: string) => {
    try {
      setRegisteringEventId(eventId);
      const res = await api.registerForEvent(eventId, {
        studentId: studentProfile.studentId,
        studentName: studentProfile.name,
        studentEmail: 'alex.chen@campus.edu',
      });

      showToast(res.message || 'Registration successful!');

      // Update state with newly recalculated registration count and marked as registered
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                ...res.event,
                isRegistered: true,
              }
            : e
        )
      );

      // Open ticket pass for the newly registered event
      handleOpenTicket({
        ...res.event,
        isRegistered: true,
      });

      // Synchronize in background
      refreshEvents(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      showToast(err?.message || 'Registration failed.');
    } finally {
      setRegisteringEventId(null);
    }
  };

  const handleOpenTicket = (event: EventItem) => {
    setTicketEvent(event);
    setIsTicketOpen(true);
  };

  const handleMarkAllRead = () => {
    if (currentScreen === 'student') {
      setStudentNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } else {
      setOrganizerNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
    showToast('All notifications marked as read.');
  };

  // Determine current active theme (Student screen uses Amber/Orange, all others Cyan)
  const isStudentScreen = currentScreen === 'student';
  const theme = isStudentScreen ? 'orange' : 'cyan';

  return (
    <div className="min-h-screen bg-[#070b0c] text-zinc-100 flex flex-col font-sans selection:bg-[#00f2ff]/30">
      {/* Top Navigation Switcher Bar matching Image 13.png */}
      <TopNavSwitcher
        currentScreen={currentScreen}
        onSelectScreen={(screen) => {
          if (screen !== 'create-event') setEditingEvent(null);
          setCurrentScreen(screen);
        }}
        viewMode={viewMode}
        onToggleViewMode={(mode) => setViewMode(mode)}
        onResetData={handleResetData}
      />

      {/* Main Viewport Container */}
      <DeviceFrame viewMode={viewMode} theme={theme}>
        {currentScreen === 'login' && (
          <LoginScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'organizer' && (
          <OrganizerDashboardScreen
            events={events}
            notifications={organizerNotifs}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onMarkAllRead={handleMarkAllRead}
            onSelectEvent={(evt) => {
              setEditingEvent(evt);
              handleOpenTicket(evt);
            }}
            onDeleteEvent={handleDeleteEvent}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'student' && (
          <StudentDashboardScreen
            profile={studentProfile}
            events={events}
            notifications={studentNotifs}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenTicket={handleOpenTicket}
            onMarkAllRead={handleMarkAllRead}
            onShowToast={showToast}
            onRegisterEvent={handleRegisterEvent}
            registeringEventId={registeringEventId}
          />
        )}

        {currentScreen === 'create-event' && (
          <CreateEventScreen
            onNavigate={(screen) => {
              setEditingEvent(null);
              setCurrentScreen(screen);
            }}
            onPublishEvent={handlePublishEvent}
            onUpdateEvent={handleUpdateEvent}
            eventToEdit={editingEvent}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'team-tasks' && (
          <EventPrepScreen
            teamMembers={teamMembers}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'org-setup' && (
          <OrgSetupScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onShowToast={showToast}
          />
        )}
      </DeviceFrame>

      {/* Dynamic Digital Gate Pass Ticket Modal */}
      <TicketModal
        event={ticketEvent}
        profile={studentProfile}
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#121b1e] border border-[#00f2ff]/40 text-white px-4 py-2.5 rounded-2xl shadow-[0_0_24px_rgba(0,242,255,0.4)] flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
