import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event, Ticket } from '../../services/event.service'; // Adjust path as necessary

@Component({
  selector: 'app-ticket-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Réservation Confirmée !</h2>
          <button class="close-button" (click)="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div *ngIf="ticket && event">
            <h3>Votre Ticket</h3>
            <p><strong>Numéro de Ticket :</strong> {{ ticket.ticketNumber }}</p>
            <p><strong>Date de Réservation :</strong> {{ ticket.purchaseDate | date:'medium' }}</p>
            
            <h4>Détails de l'Événement</h4>
            <div class="event-details">
              <img [src]="event.photo || 'assets/default-event.jpg'" alt="Event photo" class="event-photo">
              <div>
                <p><strong>Nom :</strong> {{ event.name }}</p>
                <p><strong>Date :</strong> {{ event.date | date:'medium' }}</p>
                <p><strong>Lieu :</strong> {{ event.location }}</p>
              </div>
            </div>
          </div>
          <div *ngIf="!ticket || !event">
            <p>Impossible d'afficher les détails du ticket.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">Fermer</button>
          <!-- Optional: Add download ticket button here later -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .modal-body h3, .modal-body h4 {
      margin-top: 15px;
      margin-bottom: 10px;
      color: #333;
    }

    .modal-body p {
      margin-bottom: 8px;
    }

    .event-details {
      display: flex;
      gap: 15px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .event-photo {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }

    .modal-footer {
      margin-top: 20px;
      text-align: right;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }
  `]
})
export class TicketConfirmationModalComponent {
  @Input() ticket: Ticket | null = null;
  @Input() event: Event | null = null;
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
} 