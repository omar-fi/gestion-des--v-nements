import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { EventService, Event, Ticket } from '../services/event.service';
import { ChatbotComponent } from '../components/chatbot/chatbot.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, ChatbotComponent, FormsModule],
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
                  <button class="book-btn" (click)="openBookingModal(event)">
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
                  <button class="delete-btn" (click)="deleteTicket(ticket)">
                    <i class="fas fa-trash"></i>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Modal de réservation -->
    <div class="modal" *ngIf="showBookingModal" (click)="closeBookingModal($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Réserver des tickets</h2>
          <button class="close-btn" (click)="closeBookingModal($event)">×</button>
        </div>
        <div class="modal-body">
          <h3>{{ selectedEvent?.name }}</h3>
          <p>{{ selectedEvent?.description }}</p>
          <div class="ticket-selection">
            <label for="ticketCount">Nombre de tickets :</label>
            <div class="ticket-controls">
              <button (click)="decreaseTicketCount()" [disabled]="ticketCount <= 1">-</button>
              <input type="number" id="ticketCount" [(ngModel)]="ticketCount" min="1" max="10">
              <button (click)="increaseTicketCount()" [disabled]="ticketCount >= 10">+</button>
            </div>
          </div>
          <div class="total-price" *ngIf="selectedEvent">
            Total : {{ ticketCount * selectedEvent.price }} €
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" (click)="closeBookingModal($event)">Annuler</button>
          <button class="confirm-btn" (click)="confirmBooking()">Confirmer</button>
        </div>
      </div>
    </div>

    <app-chatbot></app-chatbot>
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
      gap: 1rem;
    }

    .download-btn, .delete-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background-color 0.3s ease;
      color: white;
    }

    .download-btn {
      background: #28a745;
    }

    .download-btn:hover {
      background: #218838;
    }

    .delete-btn {
      background: #dc3545;
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

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-body h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .ticket-selection {
      margin: 1.5rem 0;
    }

    .ticket-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .ticket-controls button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3498db;
      color: white;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ticket-controls button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .ticket-controls input {
      width: 60px;
      text-align: center;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
    }

    .total-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: #2c3e50;
      margin-top: 1rem;
    }

    .modal-footer {
      padding: 1rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .cancel-btn {
      background: #e74c3c;
    }

    .confirm-btn {
      background: #2ecc71;
    }

    .cancel-btn:hover {
      background: #c0392b;
    }

    .confirm-btn:hover {
      background: #27ae60;
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  events: Event[] = [];
  tickets: Ticket[] = [];
  upcomingEvents: Event[] = [];
  showBookingModal: boolean = false;
  selectedEvent: Event | null = null;
  ticketCount: number = 1;

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
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) return;

    this.tickets = [
      {
        id: 1,
        eventId: 1,
        userId: currentUser.id,
        ticketNumber: 'TICKET-001',
        purchaseDate: new Date(),
        status: 'valid',
        eventName: 'Concert Jazz',
        eventDate: new Date(),
        eventLocation: 'Paris'
      },
      {
        id: 2,
        eventId: 2,
        userId: currentUser.id,
        ticketNumber: 'TICKET-002',
        purchaseDate: new Date(),
        status: 'used',
        eventName: 'Festival Rock',
        eventDate: new Date(),
        eventLocation: 'Lyon'
      }
    ];
  }

  bookEvent(event: Event) {
    // Implémenter la logique de réservation
    console.log('Réservation de l\'événement:', event);
  }

  downloadTicket(ticket: Ticket) {
    // Implémenter la logique de téléchargement
    console.log('Téléchargement du ticket:', ticket);
  }

  openBookingModal(event: Event) {
    this.selectedEvent = event;
    this.ticketCount = 1;
    this.showBookingModal = true;
  }

  closeBookingModal(event: MouseEvent) {
    this.showBookingModal = false;
    this.selectedEvent = null;
  }

  increaseTicketCount() {
    if (this.ticketCount < 10) {
      this.ticketCount++;
    }
  }

  decreaseTicketCount() {
    if (this.ticketCount > 1) {
      this.ticketCount--;
    }
  }

  confirmBooking() {
    if (this.selectedEvent) {
      const currentUser = this.userService.getCurrentUser();
      if (!currentUser) return;

      // Ici, vous pouvez ajouter la logique pour sauvegarder la réservation
      console.log('Réservation confirmée:', {
        event: this.selectedEvent,
        ticketCount: this.ticketCount,
        totalPrice: this.ticketCount * (this.selectedEvent.price || 0)
      });
      
      // Ajouter le ticket à la liste des tickets
      const newTicket: Ticket = {
        id: Date.now(),
        eventId: this.selectedEvent.id,
        userId: currentUser.id,
        ticketNumber: `TICKET-${Date.now()}`,
        purchaseDate: new Date(),
        status: 'valid',
        eventName: this.selectedEvent.name,
        eventDate: this.selectedEvent.date,
        eventLocation: this.selectedEvent.location
      };
      
      this.tickets.unshift(newTicket);
      this.closeBookingModal(new MouseEvent('click'));
    }
  }

  deleteTicket(ticket: Ticket) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      const index = this.tickets.findIndex(t => t.id === ticket.id);
      if (index !== -1) {
        this.tickets.splice(index, 1);
        // Ici, vous pouvez ajouter la logique pour supprimer le ticket du backend
        console.log('Ticket supprimé:', ticket);
      }
    }
  }
} 