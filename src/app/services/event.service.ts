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
  photo: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  organizerId: number;
  organizer?: User;
}

export interface Ticket {
  id: number;
  eventId: number;
  userId: number;
  ticketNumber: string;
  purchaseDate: Date;
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
    console.log('Sauvegarde des événements:', this.events);
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
      id: Date.now(),
      status: 'pending'
    };
    console.log('Création nouvel événement:', newEvent);
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
      console.log('EventService: getEvents - Aucun utilisateur connecté');
      return of([]);
    }

    console.log('EventService: getEvents - Utilisateur connecté:', currentUser);
    console.log('EventService: getEvents - Tous les événements disponibles dans le service:', this.events);

    let filteredEvents: Event[];
    
    switch (currentUser.type) {
      case 'admin':
        filteredEvents = [...this.events];
        console.log('EventService: getEvents - Filtrage admin - Événements (tous):', filteredEvents);
        break;
      case 'client':
        filteredEvents = this.events.filter(e => {
          const isApproved = e.status === 'approved';
          console.log(`EventService: getEvents - Client filter check for "${e.name}" (ID: ${e.id}): Approved=${isApproved}`);
          return isApproved;
        });
        console.log('EventService: getEvents - Filtrage client - Événements (approuvés):', filteredEvents);
        break;
      case 'organizer':
        filteredEvents = this.events.filter(e => e.organizerId === currentUser.id);
        console.log('Filtrage organisateur - Événements:', filteredEvents);
        break;
      default:
        filteredEvents = [];
    }

    // Trier les événements par date
    filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    console.log('Événements triés:', filteredEvents);

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
      console.log('Événement approuvé:', event);
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

  deleteTicket(ticketId: number): Observable<boolean> {
    const index = this.tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      // Optional: Add a check to ensure the user deleting is the ticket owner
      // const currentUser = this.userService.getCurrentUser();
      // if (!currentUser || this.tickets[index].userId !== currentUser.id) {
      //   return new Observable(subscriber => {
      //     subscriber.next(false);
      //     subscriber.complete();
      //   });
      // }
      
      this.tickets.splice(index, 1);
      this.saveTickets();
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
} 