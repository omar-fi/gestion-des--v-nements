import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { EventService, Event } from '../services/event.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header>
        <h1>Dashboard Administrateur</h1>
      </header>
      
      <div class="content">
        <div class="events-section">
          <h2>Gestion des événements</h2>
          <div class="events-grid">
            <div *ngFor="let event of events" class="event-card" [ngClass]="event.status">
              <img [src]="event.photo || 'assets/default-event.jpg'" alt="Event photo" class="event-photo">
              <div class="event-details">
                <div class="event-status" [ngClass]="event.status">
                  {{ event.status === 'pending' ? 'En attente' : 
                     event.status === 'approved' ? 'Approuvé' : 'Rejeté' }}
                </div>
                <h3>{{ event.name }}</h3>
                <p>{{ event.description }}</p>
                <p class="event-date">{{ event.date | date:'medium' }}</p>
                <p class="event-organizer">Organisateur: {{ event.organizer?.username || 'Inconnu' }}</p>
                
                <div class="event-actions" *ngIf="event.status === 'pending'">
                  <button (click)="approveEvent(event.id)" class="approve-btn">Approuver</button>
                  <button (click)="rejectEvent(event.id)" class="reject-btn">Rejeter</button>
                </div>
                <div class="event-actions" *ngIf="event.status !== 'pending'">
                  <button (click)="deleteEvent(event.id)" class="delete-btn">Supprimer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }

    .content {
      padding: 20px;
    }

    .events-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .event-card {
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s;
      position: relative;
    }

    .event-card:hover {
      transform: translateY(-5px);
    }

    .event-card.pending {
      border-left: 4px solid #ffc107;
    }

    .event-card.approved {
      border-left: 4px solid #28a745;
    }

    .event-card.rejected {
      border-left: 4px solid #dc3545;
    }

    .event-photo {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .event-details {
      padding: 15px;
    }

    .event-status {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: 500;
    }

    .event-status.pending {
      background-color: #ffc107;
      color: #000;
    }

    .event-status.approved {
      background-color: #28a745;
      color: white;
    }

    .event-status.rejected {
      background-color: #dc3545;
      color: white;
    }

    .event-details h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .event-details p {
      margin: 0 0 10px 0;
      color: #666;
    }

    .event-date {
      font-size: 0.9em;
      color: #888;
    }

    .event-organizer {
      font-size: 0.9em;
      color: #666;
      font-style: italic;
    }

    .event-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .approve-btn, .reject-btn, .delete-btn {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .approve-btn {
      background-color: #28a745;
      color: white;
    }

    .approve-btn:hover {
      background-color: #218838;
    }

    .reject-btn {
      background-color: #dc3545;
      color: white;
    }

    .reject-btn:hover {
      background-color: #c82333;
    }

    .delete-btn {
      background-color: #6c757d;
      color: white;
    }

    .delete-btn:hover {
      background-color: #5a6268;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  events: Event[] = [];

  constructor(
    private userService: UserService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || currentUser.type !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    });
  }

  approveEvent(eventId: number) {
    this.eventService.approveEvent(eventId).subscribe(() => {
      this.loadEvents();
    });
  }

  rejectEvent(eventId: number) {
    this.eventService.rejectEvent(eventId).subscribe(() => {
      this.loadEvents();
    });
  }

  deleteEvent(eventId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(eventId).subscribe(() => {
        this.loadEvents();
      });
    }
  }
} 