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
        <div class="stats-section">
          <div class="stat-card">
            <i class="fas fa-calendar-check"></i>
            <div class="stat-info">
              <span class="stat-value">{{ approvedEvents.length }}</span>
              <span class="stat-label">Événements approuvés</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-clock"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pendingEvents.length }}</span>
              <span class="stat-label">En attente</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-history"></i>
            <div class="stat-info">
              <span class="stat-value">{{ pastEvents.length }}</span>
              <span class="stat-label">Événements passés</span>
            </div>
          </div>
        </div>

        <div class="events-section">
          <div class="section-header">
            <h2>Gestion des événements</h2>
            <div class="filters">
              <button 
                [class.active]="currentFilter === 'all'"
                (click)="setFilter('all')"
                class="filter-btn">
                Tous
              </button>
              <button 
                [class.active]="currentFilter === 'past'"
                (click)="setFilter('past')"
                class="filter-btn">
                Passés
              </button>
              <button 
                [class.active]="currentFilter === 'upcoming'"
                (click)="setFilter('upcoming')"
                class="filter-btn">
                À venir
              </button>
            </div>
          </div>
          <div class="events-grid">
            <div *ngFor="let event of filteredEvents" class="event-card" [ngClass]="[event.status, isPastEvent(event) ? 'past-event' : '']">
              <img [src]="event.photo || 'assets/default-event.jpg'" alt="Event photo" class="event-photo">
              <div class="event-details">
                <div class="event-status" [ngClass]="event.status">
                  {{ event.status === 'pending' ? 'En attente' : 
                     event.status === 'approved' ? 'Approuvé' : 'Rejeté' }}
                </div>
                <h3>{{ event.name }}</h3>
                <p>{{ event.description }}</p>
                <p class="event-date">
                  <i class="fas fa-calendar"></i>
                  {{ event.date | date:'medium' }}
                </p>
                <p class="event-organizer">
                  <i class="fas fa-user"></i>
                  Organisateur: {{ event.organizer?.username || 'Inconnu' }}
                </p>
                
                <div class="event-actions" *ngIf="event.status === 'pending'">
                  <button (click)="approveEvent(event.id)" class="approve-btn">
                    <i class="fas fa-check"></i>
                    Approuver
                  </button>
                  <button (click)="rejectEvent(event.id)" class="reject-btn">
                    <i class="fas fa-times"></i>
                    Rejeter
                  </button>
                </div>
                <div class="event-actions" *ngIf="event.status !== 'pending'">
                  <button (click)="deleteEvent(event.id)" class="delete-btn">
                    <i class="fas fa-trash"></i>
                    Supprimer
                  </button>
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

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      background: white;
      color: #666;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-btn:hover {
      border-color: #3498db;
      color: #3498db;
    }

    .filter-btn.active {
      background: #3498db;
      border-color: #3498db;
      color: white;
    }

    .event-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .approve-btn, .reject-btn, .delete-btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .approve-btn {
      background: #28a745;
      color: white;
    }

    .approve-btn:hover {
      background: #218838;
    }

    .reject-btn {
      background: #dc3545;
      color: white;
    }

    .reject-btn:hover {
      background: #c82333;
    }

    .delete-btn {
      background: #6c757d;
      color: white;
    }

    .delete-btn:hover {
      background: #5a6268;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card i {
      font-size: 2rem;
      color: #3498db;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .past-event {
      opacity: 0.8;
      background: #f8f9fa;
    }

    .past-event:hover {
      opacity: 1;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  events: Event[] = [];
  currentFilter: 'all' | 'past' | 'upcoming' = 'all';

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

    console.log('AdminDashboard: Loading events...');
    this.loadEvents();
  }

  get approvedEvents(): Event[] {
    return this.events.filter(event => event.status === 'approved');
  }

  get pendingEvents(): Event[] {
    return this.events.filter(event => event.status === 'pending');
  }

  get pastEvents(): Event[] {
    const now = new Date();
    return this.events.filter(event => new Date(event.date) < now);
  }

  isPastEvent(event: Event): boolean {
    const isPast = new Date(event.date) < new Date();
    console.log(`Event ${event.name} (ID: ${event.id}) date: ${event.date}, isPast: ${isPast}`);
    return isPast;
  }

  get filteredEvents(): Event[] {
    const now = new Date();
    switch (this.currentFilter) {
      case 'past':
        return this.events.filter(event => new Date(event.date) < now);
      case 'upcoming':
        return this.events.filter(event => new Date(event.date) >= now);
      default:
        return this.events;
    }
  }

  setFilter(filter: 'all' | 'past' | 'upcoming') {
    this.currentFilter = filter;
  }

  loadEvents() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    });
  }

  approveEvent(eventId: number) {
    if (confirm('Êtes-vous sûr de vouloir approuver cet événement ?')) {
      this.eventService.approveEvent(eventId).subscribe(() => {
        this.loadEvents();
      });
    }
  }

  rejectEvent(eventId: number) {
    if (confirm('Êtes-vous sûr de vouloir rejeter cet événement ?')) {
      this.eventService.rejectEvent(eventId).subscribe(() => {
        this.loadEvents();
      });
    }
  }

  deleteEvent(eventId: number) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      console.warn(`AdminDashboard: Event with ID ${eventId} not found for deletion.`);
      return;
    }

    const message = this.isPastEvent(event)
      ? 'Cet événement est passé. Êtes-vous sûr de vouloir le supprimer ?'
      : 'Êtes-vous sûr de vouloir supprimer cet événement ?';

    if (confirm(message)) {
      console.log(`AdminDashboard: Confirming deletion for event ID ${eventId}`);
      this.eventService.deleteEvent(eventId).subscribe(
        (success) => {
          if (success) {
            console.log(`AdminDashboard: Event ID ${eventId} successfully deleted.`);
            this.loadEvents();
          } else {
            console.error(`AdminDashboard: Failed to delete event ID ${eventId} via service.`);
          }
        },
        (error) => {
          console.error(`AdminDashboard: Error deleting event ID ${eventId}:`, error);
        }
      );
    } else {
      console.log(`AdminDashboard: Deletion cancelled for event ID ${eventId}.`);
    }
  }
} 