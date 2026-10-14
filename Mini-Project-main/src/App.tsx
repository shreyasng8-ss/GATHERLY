/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScreenId, EventItem, TeamMember, TaskItem, NotificationItem, EventRegistrationPayload } from './types';
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
import { EventDetailsModal } from './components/modals/EventDetailsModal';
import { EventRegistrationModal } from './components/modals/EventRegistrationModal';
import { OrganizerScannerModal } from './components/modals/OrganizerScannerModal';
import { TicketVerificationScreen } from './components/screens/TicketVerificationScreen';
import { ClubsScreen } from './components/screens/ClubsScreen';
import { NavigationDrawer } from './components/navigation/NavigationDrawer';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [viewMode, setViewMode] = useState<'frame' | 'responsive'>('frame');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Application State
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [, setIsLoadingEvents] = useState<boolean>(true);
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

  // Event Details Modal State
  const [detailsEvent, setDetailsEvent] = useState<EventItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Event Registration Modal State
  const [registerModalEvent, setRegisterModalEvent] = useState<EventItem | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Live QR Attendance Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerInitialEventId, setScannerInitialEventId] = useState<string | undefined>(undefined);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Fetch events and student registrations from real backend API
  const refreshEvents = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoadingEvents(true);

      const [eventsResult, studentRegsResult] = await Promise.allSettled([
        api.getEvents(),
        api.getStudentRegistrations(studentProfile.studentId),
      ]);

      if (eventsResult.status === 'fulfilled' && Array.isArray(eventsResult.value)) {
        // Build map of registered event IDs and registration details
        const regMap = new Map<string, { registrationId: string; ticketId: string; seatPass?: string }>();
        if (
          studentRegsResult.status === 'fulfilled' &&
          Array.isArray(studentRegsResult.value?.registrations)
        ) {
          for (const item of studentRegsResult.value.registrations) {
            const evId = item.registration?.eventId || item.event?.id;
            if (evId) {
              regMap.set(evId, {
                registrationId: item.registration.id,
                ticketId: item.registration.ticketId,
                seatPass: item.registration.seatPass
              });
            }
          }
        }

        const syncedEvents = eventsResult.value.map((evt) => {
          const regInfo = regMap.get(evt.id);
          return {
            ...evt,
            isRegistered: Boolean(regInfo) || Boolean(evt.isRegistered),
            registrationId: regInfo?.registrationId || evt.registrationId,
            ticketId: regInfo?.ticketId || evt.ticketId,
            seatPass: regInfo?.seatPass || evt.seatPass
          };
        });

        setEvents(syncedEvents);
      }
    } catch (err: any) {
      console.warn('Backend API connection note, using local fallback:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // Fetch organizer tasks from backend API
  const refreshTasks = useCallback(async () => {
    try {
      const serverTasks = await api.getTasks();
      if (Array.isArray(serverTasks) && serverTasks.length > 0) {
        setTasks(serverTasks);
      }
    } catch (err) {
      console.warn('Tasks API note, using initial local tasks:', err);
    }
  }, []);

  useEffect(() => {
    refreshEvents();
    refreshTasks();

    // Handle deep-link or QR code scan URL: /verify?ticket=... or ?ticket=...
    if (typeof window !== 'undefined' && window.location) {
      const searchParams = new URLSearchParams(window.location.search);
      const urlTicket = searchParams.get('ticket') || searchParams.get('t') || searchParams.get('id');
      const isVerifyRoute = window.location.pathname.includes('/verify');
      if (urlTicket || isVerifyRoute) {
        setCurrentScreen('verify-ticket');
      }
    }
  }, [refreshEvents, refreshTasks]);

  const handleResetData = () => {
    setEvents(initialEvents);
    setTasks(initialTasks);
    setOrganizerNotifs(initialOrganizerNotifications);
    setStudentNotifs(initialStudentNotifications);
    showToast('Application mock data reset to original defaults.');
  };

  const handleToggleTask = async (taskId: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    try {
      const updated = await api.toggleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
    } catch (err) {
      console.warn('Task toggle offline fallback:', err);
    }
  };

  const handleAddTask = async (title: string, assignee: string, assigneeAvatar?: string) => {
    try {
      const created = await api.createTask({ title, assignee, assigneeAvatar });
      setTasks((prev) => [...prev, created]);
      showToast(`Task "${title}" created and saved!`);
    } catch (err: any) {
      console.error('Failed to save task to backend:', err);
      const fallbackTask: TaskItem = {
        id: `task-${Date.now()}`,
        title,
        assignee,
        assigneeAvatar,
        completed: false,
      };
      setTasks((prev) => [...prev, fallbackTask]);
      showToast('Task added locally.');
    }
  };

  // Create Event via real API
  const handlePublishEvent = async (newEventData: Partial<EventItem>) => {
    try {
      const created = await api.createEvent(newEventData);
      setEvents((prev) => [created, ...prev]);
      showToast(`Event "${created.title}" published & saved to backend!`);
      refreshEvents(true);
    } catch (err: any) {
      console.error('Failed to publish event via API:', err);
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

  // Update Event via real API
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

  // Delete Event via real API
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

  // Event Registration Submit via real API
  const handleSubmitRegistration = async (
    eventId: string,
    payload: EventRegistrationPayload
  ) => {
    setRegisteringEventId(eventId);
    try {
      const res = await api.registerForEvent(eventId, payload);

      // Update state with newly recalculated registration count and marked as registered
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                ...res.event,
                isRegistered: true,
                registrationId: res.registration.id,
                ticketId: res.registration.ticketId,
                seatPass: res.registration.seatPass,
              }
            : e
        )
      );

      showToast(`Registered for "${res.event.title}"! Ticket generated.`);
      refreshEvents(true);

      return {
        registration: res.registration,
        event: {
          ...res.event,
          isRegistered: true,
          registrationId: res.registration.id,
          ticketId: res.registration.ticketId,
          seatPass: res.registration.seatPass
        }
      };
    } finally {
      setRegisteringEventId(null);
    }
  };

  const handleOpenTicket = (event: EventItem) => {
    setTicketEvent(event);
    setIsTicketOpen(true);
  };

  const handleOpenDetails = (event: EventItem) => {
    setDetailsEvent(event);
    setIsDetailsOpen(true);
  };

  const handleOpenRegistrationModal = (event: EventItem) => {
    setRegisterModalEvent(event);
    setIsRegisterModalOpen(true);
  };

  const handleMarkAllRead = () => {
    if (currentScreen === 'student') {
      setStudentNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } else {
      setOrganizerNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
    showToast('All notifications marked as read.');
  };

  // Scroll to relevant section when navigating to explore-events or my-registrations
  useEffect(() => {
    if (currentScreen === 'explore-events') {
      const timer = setTimeout(() => {
        const el = document.getElementById('discover-events');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else if (currentScreen === 'my-registrations') {
      const timer = setTimeout(() => {
        const el = document.getElementById('my-registrations');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Determine current active theme (Student & Clubs screens use Amber/Orange, all others Cyan)
  const isStudentScreen =
    currentScreen === 'student' ||
    currentScreen === 'clubs' ||
    currentScreen === 'my-registrations' ||
    currentScreen === 'explore-events';
  const theme = isStudentScreen ? 'orange' : 'cyan';

  return (
    <div className="min-h-screen bg-[#070b0c] text-zinc-100 flex flex-col font-sans selection:bg-[#00f2ff]/30">
      {/* Top Navigation Switcher Bar with Central Hamburger Menu */}
      <TopNavSwitcher
        currentScreen={currentScreen}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onSelectScreen={(screen) => {
          if (screen !== 'create-event') setEditingEvent(null);
          if (screen === 'ticket-scanner') {
            setIsScannerOpen(true);
          } else {
            setCurrentScreen(screen);
          }
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
            onNavigate={(screen) => {
              if (screen === 'ticket-scanner') {
                setIsScannerOpen(true);
              } else {
                setCurrentScreen(screen);
              }
            }}
            onOpenMenu={() => setIsDrawerOpen(true)}
            onMarkAllRead={handleMarkAllRead}
            onSelectEvent={(evt) => {
              setEditingEvent(evt);
              handleOpenTicket(evt);
            }}
            onDeleteEvent={handleDeleteEvent}
            onShowToast={showToast}
            onOpenScanner={(eventId) => {
              setScannerInitialEventId(eventId);
              setIsScannerOpen(true);
            }}
          />
        )}

        {(currentScreen === 'student' ||
          currentScreen === 'explore-events' ||
          currentScreen === 'my-registrations') && (
          <StudentDashboardScreen
            profile={studentProfile}
            events={events}
            notifications={studentNotifs}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenMenu={() => setIsDrawerOpen(true)}
            onOpenTicket={handleOpenTicket}
            onSelectEventDetails={handleOpenDetails}
            onOpenRegistrationModal={handleOpenRegistrationModal}
            onMarkAllRead={handleMarkAllRead}
            onShowToast={showToast}
            registeringEventId={registeringEventId}
          />
        )}

        {currentScreen === 'clubs' && (
          <ClubsScreen
            profile={studentProfile}
            events={events}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenMenu={() => setIsDrawerOpen(true)}
            onShowToast={showToast}
            onSelectEventDetails={handleOpenDetails}
          />
        )}

        {currentScreen === 'create-event' && (
          <CreateEventScreen
            onNavigate={(screen) => {
              setEditingEvent(null);
              setCurrentScreen(screen);
            }}
            onOpenMenu={() => setIsDrawerOpen(true)}
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
            onOpenMenu={() => setIsDrawerOpen(true)}
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
            onOpenMenu={() => setIsDrawerOpen(true)}
            onShowToast={showToast}
          />
        )}

        {(currentScreen === 'verify-ticket' || currentScreen === 'ticket-scanner') && (
          <TicketVerificationScreen
            isOrganizer={true}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onShowToast={showToast}
          />
        )}
      </DeviceFrame>

      {/* Central Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen={currentScreen}
        onSelectScreen={(screen) => {
          if (screen !== 'create-event') setEditingEvent(null);
          if (screen === 'ticket-scanner') {
            setIsScannerOpen(true);
          } else {
            setCurrentScreen(screen);
          }
        }}
        studentName={studentProfile.name}
        studentId={studentProfile.studentId}
        onSignOut={() => {
          showToast('Signed out of session.');
          setCurrentScreen('login');
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Live Organizer QR & Attendance Scanner Modal */}
      <OrganizerScannerModal
        events={events}
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onShowToast={showToast}
        initialEventId={scannerInitialEventId}
        onCheckInSuccess={() => refreshEvents(true)}
      />

      {/* Dynamic Digital Gate Pass Ticket Modal */}
      <TicketModal
        event={ticketEvent}
        profile={studentProfile}
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
      />

      {/* Detailed Event Modal */}
      <EventDetailsModal
        event={detailsEvent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onRegisterClick={(evt) => {
          handleOpenRegistrationModal(evt);
        }}
        onViewTicketClick={(evt) => {
          handleOpenTicket(evt);
        }}
      />

      {/* Student Event Registration Form Modal */}
      <EventRegistrationModal
        event={registerModalEvent}
        profile={studentProfile}
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmitRegistration={handleSubmitRegistration}
        onOpenTicket={(evt) => handleOpenTicket(evt)}
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
