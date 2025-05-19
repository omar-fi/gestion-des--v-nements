import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { EventService, Event } from '../services/event.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Tableau de bord client</h1>
        <div class="stats">
          <div class="stat-card">
            <i class="fas fa-ticket-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{ tickets.length }}</span>
              <span class="stat-label">Tickets</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-calendar-check"></i>
            <div class="stat-info">
              <span class="stat-value">{{ upcomingEvents.length }}</span>
              <span class="stat-label">Événements à venir</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <section class="events-section">
          <h2>Événements à venir</h2>
          <div class="events-grid">
            <div *ngFor="let event of upcomingEvents" class="event-card">
              <div class="event-image">
                <img [src]="event.photo || 'assets/default-event.jpg'" [alt]="event.name">
                <div class="event-date">
                  <i class="fas fa-calendar"></i>
                  {{ event.date | date:'dd MMM yyyy' }}
                </div>
              </div>
              <div class="event-details">
                <h3>{{ event.name }}</h3>
                <p>{{ event.description }}</p>
                <div class="event-meta">
                  <span class="organizer">
                    <i class="fas fa-user"></i>
                    {{ event.organizerId }}
                  </span>
                  <button class="book-btn" (click)="bookEvent(event)">
                    <i class="fas fa-ticket-alt"></i>
                    Réserver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="tickets-section">
          <h2>Mes tickets</h2>
          <div class="tickets-list">
            <div *ngFor="let ticket of tickets" class="ticket-card">
              <div class="ticket-header">
                <span class="ticket-id">#{{ ticket.id }}</span>
                <span class="ticket-status" [ngClass]="ticket.status">
                  {{ ticket.status === 'valid' ? 'Valide' : 'Utilisé' }}
                </span>
              </div>
              <div class="ticket-content">
                <h3>{{ ticket.eventName }}</h3>
                <div class="ticket-details">
                  <p>
                    <i class="fas fa-calendar"></i>
                    {{ ticket.eventDate | date:'dd MMM yyyy' }}
                  </p>
                  <p>
                    <i class="fas fa-map-marker-alt"></i>
                    {{ ticket.eventLocation }}
                  </p>
                </div>
                <div class="ticket-actions">
                  <button class="download-btn" (click)="downloadTicket(ticket)">
                    <i class="fas fa-download"></i>
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }

    .stats {
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

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }

    section h2 {
      color: #2c3e50;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .event-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .event-card:hover {
      transform: translateY(-5px);
    }

    .event-image {
      position: relative;
      height: 200px;
    }

    .event-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .event-date {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .event-details {
      padding: 1.5rem;
    }

    .event-details h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .event-details p {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .event-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .organizer {
      color: #666;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .book-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background-color 0.3s ease;
    }

    .book-btn:hover {
      background: #2980b9;
    }

    .tickets-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ticket-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .ticket-header {
      background: #f8f9fa;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ticket-id {
      font-weight: 500;
      color: #2c3e50;
    }

    .ticket-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
    }

    .ticket-status.valid {
      background: #28a745;
      color: white;
    }

    .ticket-status.used {
      background: #dc3545;
      color: white;
    }

    .ticket-content {
      padding: 1rem;
    }

    .ticket-content h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .ticket-details {
      margin-bottom: 1rem;
    }

    .ticket-details p {
      color: #666;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .ticket-actions {
      display: flex;
      justify-content: flex-end;
    }

    .download-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background-color 0.3s ease;
    }

    .download-btn:hover {
      background: #218838;
    }

    @media (max-width: 1024px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats {
        grid-template-columns: 1fr;
      }

      .events-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  events: Event[] = [];
  tickets: any[] = [];
  upcomingEvents: Event[] = [];

  constructor(
    private userService: UserService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || currentUser.type !== 'client') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadEvents();
    this.loadTickets();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
      this.upcomingEvents = events.filter(event => new Date(event.date) > new Date());
    });
  }

  loadTickets() {
    // Simuler le chargement des tickets
    this.tickets = [
      {
        id: 1,
        eventName: 'Concert Jazz',
        eventDate: new Date(),
        eventLocation: 'Paris',
        status: 'valid'
      },
      {
        id: 2,
        eventName: 'Festival Rock',
        eventDate: new Date(),
        eventLocation: 'Lyon',
        status: 'used'
      }
    ];
  }

  bookEvent(event: Event) {
    // Implémenter la logique de réservation
    console.log('Réservation de l\'événement:', event);
  }

  downloadTicket(ticket: any) {
    // Implémenter la logique de téléchargement
    console.log('Téléchargement du ticket:', ticket);
  }
} 