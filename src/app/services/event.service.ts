import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
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
    // Pour l'instant, nous utilisons des données en mémoire
    this.events = [
      {
        id: 1,
        name: 'Concert de Jazz',
        description: 'Un concert de jazz exceptionnel',
        date: new Date('2024-06-15T20:00:00'),
        photo: 'assets/jazz-concert.jpg',
        status: 'pending',
        organizerId: 1
      }
    ];
    this.eventsSubject.next(this.events);
  }

  createEvent(event: Omit<Event, 'id' | 'status'>): Observable<Event> {
    const newEvent: Event = {
      ...event,
      id: this.events.length + 1,
      status: 'pending'
    };
    this.events.push(newEvent);
    this.eventsSubject.next(this.events);
    return new Observable(subscriber => {
      subscriber.next(newEvent);
      subscriber.complete();
    });
  }

  getEvents(): Observable<Event[]> {
    return this.eventsSubject.asObservable();
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
      this.eventsSubject.next(this.events);
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
      this.eventsSubject.next(this.events);
    }
    return new Observable(subscriber => {
      subscriber.next(event || null);
      subscriber.complete();
    });
  }
} 