import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../models/user.model';
// @ts-ignore
import { Ticket } from '../models/ticket.model';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  photo: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  organizerId: string;
  organizer?: User;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
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
    // Écouter les changements des événements dans Firestore
    const eventsRef = collection(db, 'events');
    onSnapshot(eventsRef, (snapshot) => {
      this.events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data()['date'].toDate()
      })) as Event[];
      this.eventsSubject.next(this.events);
    });

    // Écouter les changements des tickets dans Firestore
    const ticketsRef = collection(db, 'tickets');
    onSnapshot(ticketsRef, (snapshot) => {
      this.tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data()['purchaseDate'].toDate()
      })) as Ticket[];
      this.ticketsSubject.next(this.tickets);
    });
  }

  private async saveEvents() {
    const eventsRef = collection(db, 'events');
    for (const event of this.events) {
      if (event.id) {
        const eventRef = doc(db, 'events', event.id);
        await updateDoc(eventRef, { ...event, date: new Date(event.date) });
      } else {
        await addDoc(eventsRef, { ...event, date: new Date(event.date) });
      }
    }
  }

  private async saveTickets() {
    const ticketsRef = collection(db, 'tickets');
    for (const ticket of this.tickets) {
      if (ticket.id) {
        const ticketRef = doc(db, 'tickets', ticket.id);
        await updateDoc(ticketRef, { ...ticket, purchaseDate: new Date(ticket.purchaseDate) });
      } else {
        await addDoc(ticketsRef, { ...ticket, purchaseDate: new Date(ticket.purchaseDate) });
      }
    }
  }

  createEvent(event: Omit<Event, 'id' | 'status'>): Observable<Event> {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
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

    switch (currentUser.role) {
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

  approveEvent(eventId: string): Observable<Event | null> {
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

  rejectEvent(eventId: string): Observable<Event | null> {
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

  getEventsByOrganizer(organizerId: string): Observable<Event[]> {
    return new Observable(subscriber => {
      subscriber.next(this.events.filter(e => e.organizerId === organizerId));
      subscriber.complete();
    });
  }

  deleteEvent(eventId: string): Observable<boolean> {
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

  registerForEvent(eventId: string): Observable<Ticket> {
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
      id: Date.now().toString(),
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

  getEventTickets(eventId: string): Observable<Ticket[]> {
    return new Observable(subscriber => {
      const eventTickets = this.tickets.filter(t => t.eventId === eventId);
      subscriber.next(eventTickets);
      subscriber.complete();
    });
  }

  deleteTicket(ticketId: string): Observable<boolean> {
    const index = this.tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
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
