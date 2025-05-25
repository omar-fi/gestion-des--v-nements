import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { EventService, Event, Ticket } from '../services/event.service';
import { User } from '../models/user.model';
import { TicketConfirmationModalComponent } from '../components/ticket-confirmation-modal/ticket-confirmation-modal.component';
import { ChatbotComponent } from '../components/chatbot/chatbot.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketConfirmationModalComponent, ChatbotComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Tableau de bord client</h1>
        <div class="user-info">
          <span>Bienvenue, {{ currentUser?.fullname }}</span>
        </div>
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
              <span class="stat-value">{{ availableEvents.length }}</span>
              <span class="stat-label">Événements disponibles</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <section class="events-section">
          <h2>Événements disponibles</h2>
          <div class="events-grid" *ngIf="availableEvents.length > 0">
            <div *ngFor="let event of availableEvents" class="event-card">
              <div class="event-image">
                <img [src]="event.photo || 'assets/default-event.jpg'" [alt]="event.name">
                <div class="event-date">
                  <i class="fas fa-calendar"></i>
                  {{ event.date | date:'dd MMM yyyy, HH:mm' }}
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
                  <button
                    class="book-btn"
                    (click)="bookEvent(event)"
                    [disabled]="isLoading || checkIfUserHasTicket(event.id)" >
                    <i class="fas" [ngClass]="isLoading ? 'fa-spinner fa-spin' : 'fa-ticket-alt'"></i>
                    {{ checkIfUserHasTicket(event.id) ? 'Déjà réservé' : (isLoading ? 'Réservation...' : 'Réserver') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="no-events" *ngIf="availableEvents.length === 0">
            <i class="fas fa-calendar-times"></i>
            <p>Aucun événement disponible pour le moment</p>
          </div>
        </section>

        <section class="tickets-section">
          <h2>Mes tickets</h2>
          <div class="my-tickets-list">
            <div *ngIf="userTickets.length === 0" class="no-tickets-message">
              Aucun ticket disponible pour le moment.
            </div>
            <div *ngFor="let ticket of userTickets" class="ticket-card">
              <img [src]="ticket.event?.photo || 'assets/default-event.jpg'" alt="Event photo" class="ticket-photo">
              <div class="ticket-details">
                <div class="ticket-number">#{{ ticket.ticketNumber }} <span class="used-status">Utilisé</span></div>
                <h3>{{ ticket.event?.name || 'Événement inconnu' }}</h3>
                <p class="ticket-date">
                  <i class="fas fa-calendar"></i>
                  {{ ticket.event?.date | date:'medium' }}
                </p>
                <p class="ticket-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ ticket.event?.location || 'Lieu inconnu' }}
                </p>
                <button (click)="downloadTicket(ticket.ticketNumber)" class="download-btn">
                  Télécharger
                </button>
                <button (click)="deleteTicket(ticket.id)" class="delete-btn">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
          <div class="no-tickets" *ngIf="userTickets.length === 0">
            <i class="fas fa-ticket-alt"></i>
            <p>Vous n'avez pas encore de tickets</p>
          </div>
        </section>
      </div>

      <!-- Ticket Confirmation Modal -->
      <app-ticket-confirmation-modal
        *ngIf="showTicketConfirmationModal"
        [ticket]="bookedTicket"
        [event]="bookedEvent"
        (close)="closeTicketConfirmationModal()"
      ></app-ticket-confirmation-modal>

      <!-- Chatbot -->
      <app-chatbot></app-chatbot>
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

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .btn-danger {
      background: #dc3545;
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

    .btn-danger:hover {
      background: #c82333;
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
      gap: 0.5rem;
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

    .delete-btn {
      background: #dc3545;
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

    .delete-btn:hover {
      background: #c82333;
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

    .no-events, .no-tickets {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 12px;
      margin-top: 1rem;
    }

    .no-events i, .no-tickets i {
      font-size: 3rem;
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .no-events p, .no-tickets p {
      color: #6c757d;
      font-size: 1.1rem;
    }

    .ticket-card-flex {
      display: flex;
      align-items: stretch;
      gap: 1.5rem;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .ticket-event-image {
      flex: 0 0 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      min-height: 100px;
    }
    .ticket-event-image img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }
    .ticket-main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  events: Event[] = [];
  tickets: any[] = [];
  availableEvents: Event[] = [];
  currentUser: User | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  userTickets: Ticket[] = [];
  showTicketConfirmationModal: boolean = false;
  bookedTicket: Ticket | null = null;
  bookedEvent: Event | null = null;

  constructor(
    private userService: UserService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    // @ts-ignore
    if (!this.currentUser || this.currentUser.type !== 'client') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadEvents();
    this.loadTickets();
  }

  loadEvents() {
    this.isLoading = true;
    console.log('Chargement des événements...');
    this.eventService.getEvents().subscribe({
      next: (events) => {
        console.log('Événements reçus:', events);
        this.events = events;
        this.availableEvents = events;
        console.log('Événements disponibles:', this.availableEvents);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements:', error);
        this.errorMessage = 'Erreur lors du chargement des événements';
        this.isLoading = false;
      }
    });
  }

  loadTickets() {
    this.eventService.getUserTickets().subscribe(
      tickets => {
        this.userTickets = tickets;
        console.log('Tickets chargés:', tickets);
      },
      error => {
        console.error('Erreur lors du chargement des tickets:', error);
      }
    );
  }

  bookEvent(event: Event) {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.eventService.registerForEvent(event.id).subscribe(
      ticket => {
        this.isLoading = false;
        this.bookedTicket = ticket;
        this.bookedEvent = event;
        this.showTicketConfirmationModal = true;
        this.loadTickets();
      },
      error => {
        this.isLoading = false;
        console.error('Erreur lors de la réservation:', error);
        alert('Erreur lors de la réservation. Veuillez réessayer.');
      }
    );
  }

  closeTicketConfirmationModal() {
    console.log('Closing ticket confirmation modal.');
    this.showTicketConfirmationModal = false;
    this.bookedTicket = null;
    this.bookedEvent = null;
  }

  deleteTicket(ticketId: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      this.eventService.deleteTicket(ticketId).subscribe(
        () => {
          this.loadTickets();
        },
        error => {
          console.error('Erreur lors de la suppression du ticket:', error);
        }
      );
    }
  }

  downloadTicket(ticketNumber: string) {
    // Implémentation du téléchargement du ticket
    console.log('Téléchargement du ticket:', ticketNumber);
  }

  checkIfUserHasTicket(eventId: string): boolean {
    return this.userTickets.some(ticket => ticket.eventId === eventId);
  }
}
