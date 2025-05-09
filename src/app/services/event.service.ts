import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserService, User } from './user.service';

export interface Event {
  id: number;
  name: string;
  description: string;
  date: Date;
  photo: string;
  status: 'pending' | 'approved' | 'rejected';
  organizerId: number;
  organizer?: User;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events: Event[] = [];
  private eventsSubject = new BehaviorSubject<Event[]>([]);

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
  }

  private saveEvents() {
    localStorage.setItem('events', JSON.stringify(this.events));
    this.eventsSubject.next(this.events);
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
} 