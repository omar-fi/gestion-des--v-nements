import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../models/user.model';

export interface Event {
  id: number;
  name: string;
  description: string;
  date: Date;
  location: string;
  organizerId: number;
  photo?: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  organizer?: User;
}

export interface Ticket {
  id: number;
  eventId: number;
  userId: number;
  ticketNumber: string;
  purchaseDate: Date;
  status: 'valid' | 'used';
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  event?: Event;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: Event[] = [];
  private tickets: Ticket[] = [];
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
    // Charger les événements depuis le localStorage
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      this.events = JSON.parse(storedEvents).map((event: any) => ({
        ...event,
        date: new Date(event.date)
      }));
      this.eventsSubject.next(this.events);
    }

    // Charger les tickets depuis le localStorage
    const storedTickets = localStorage.getItem('tickets');
    if (storedTickets) {
      this.tickets = JSON.parse(storedTickets).map((ticket: any) => ({
        ...ticket,
        purchaseDate: new Date(ticket.purchaseDate)
      }));
      this.ticketsSubject.next(this.tickets);
    }
  }

  private saveEvents() {
    localStorage.setItem('events', JSON.stringify(this.events));
    this.eventsSubject.next(this.events);
  }

  private saveTickets() {
    localStorage.setItem('tickets', JSON.stringify(this.tickets));
    this.ticketsSubject.next(this.tickets);
  }

  createEvent(event: Omit<Event, 'id' | 'status'>): Observable<Event> {
    const newEvent: Event = {
      ...event,
      id: Date.now(), // Utiliser timestamp comme ID unique
      status: 'pending'
    };
    this.events.push(newEvent);
    this.saveEvents();
    return new Observable(subscriber => {
      subscriber.next(newEvent);
      subscriber.complete();
    });
  }

  updateEvent(event: Event): Observable<Event> {
    const index = this.events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      this.events[index] = event;
      this.saveEvents();
      return new Observable(subscriber => {
        subscriber.next(event);
        subscriber.complete();
      });
    }
    return new Observable(subscriber => {
      subscriber.error('Event not found');
      subscriber.complete();
    });
  }

  getEvents(): Observable<Event[]> {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      return of([]);
    }

    let filteredEvents: Event[];
    switch (currentUser.type) {
      case 'admin':
        // L'admin voit tous les événements
        filteredEvents = [...this.events];
        break;
      case 'client':
        // Les clients ne voient que les événements approuvés
        filteredEvents = this.events.filter(e => e.status === 'approved');
        break;
      case 'organizer':
        // Les organisateurs voient leurs propres événements
        filteredEvents = this.events.filter(e => e.organizerId === currentUser.id);
        break;
      default:
        filteredEvents = [];
    }

    return of(filteredEvents);
  }

  getPendingEvents(): Observable<Event[]> {
    return new Observable(subscriber => {
      subscriber.next(this.events.filter(e => e.status === 'pending'));
      subscriber.complete();
    });
  }

  approveEvent(eventId: number): Observable<Event | null> {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.status = 'approved';
      this.saveEvents();
    }
    return new Observable(subscriber => {
      subscriber.next(event || null);
      subscriber.complete();
    });
  }

  rejectEvent(eventId: number): Observable<Event | null> {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.status = 'rejected';
      this.saveEvents();
    }
    return new Observable(subscriber => {
      subscriber.next(event || null);
      subscriber.complete();
    });
  }

  getEventsByOrganizer(organizerId: number): Observable<Event[]> {
    return new Observable(subscriber => {
      subscriber.next(this.events.filter(e => e.organizerId === organizerId));
      subscriber.complete();
    });
  }

  deleteEvent(eventId: number): Observable<boolean> {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.events.splice(index, 1);
      this.saveEvents();
      return new Observable(subscriber => {
        subscriber.next(true);
        subscriber.complete();
      });
    }
    return new Observable(subscriber => {
      subscriber.next(false);
      subscriber.complete();
    });
  }

  registerForEvent(eventId: number): Observable<Ticket> {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      return new Observable(subscriber => {
        subscriber.error('User not logged in');
        subscriber.complete();
      });
    }

    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      return new Observable(subscriber => {
        subscriber.error('Event not found');
        subscriber.complete();
      });
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const existingTicket = this.tickets.find(
      t => t.eventId === eventId && t.userId === currentUser.id
    );
    if (existingTicket) {
      return new Observable(subscriber => {
        subscriber.error('Already registered for this event');
        subscriber.complete();
      });
    }

    // Générer un numéro de ticket unique
    const ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newTicket: Ticket = {
      id: Date.now(),
      eventId,
      userId: currentUser.id,
      ticketNumber,
      purchaseDate: new Date(),
      status: 'valid',
      eventName: event.name,
      eventDate: event.date,
      eventLocation: event.location,
      event,
      user: currentUser
    };

    this.tickets.push(newTicket);
    this.saveTickets();

    return new Observable(subscriber => {
      subscriber.next(newTicket);
      subscriber.complete();
    });
  }

  getUserTickets(): Observable<Ticket[]> {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      return of([]);
    }

    return new Observable(subscriber => {
      const userTickets = this.tickets.filter(t => t.userId === currentUser.id);
      subscriber.next(userTickets);
      subscriber.complete();
    });
  }

  getEventTickets(eventId: number): Observable<Ticket[]> {
    return new Observable(subscriber => {
      const eventTickets = this.tickets.filter(t => t.eventId === eventId);
      subscriber.next(eventTickets);
      subscriber.complete();
    });
  }
} 