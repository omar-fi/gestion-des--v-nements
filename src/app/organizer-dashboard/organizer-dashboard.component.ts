import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { EventService, Event } from '../services/event.service';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Tableau de bord organisateur</h1>
        <div class="stats">
          <div class="stat-card">
            <i class="fas fa-calendar-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{ events.length }}</span>
              <span class="stat-label">Événements</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-check-circle"></i>
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
        </div>
      </div>

      <div class="dashboard-content">
        <section class="create-event-section">
          <h2>Créer un nouvel événement</h2>
          <form (ngSubmit)="onSubmit()" class="event-form">
            <div class="form-group">
              <label for="name">
                <i class="fas fa-heading"></i>
                Nom de l'événement
              </label>
              <input 
                type="text" 
                id="name" 
                [(ngModel)]="eventFormData.name" 
                name="name" 
                required
                placeholder="Entrez le nom de l'événement"
              >
            </div>
            
            <div class="form-group">
              <label for="description">
                <i class="fas fa-align-left"></i>
                Description
              </label>
              <textarea 
                id="description" 
                [(ngModel)]="eventFormData.description" 
                name="description" 
                required
                placeholder="Décrivez votre événement"
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="date">
                <i class="fas fa-calendar"></i>
                Date
              </label>
              <input 
                type="datetime-local" 
                id="date" 
                [(ngModel)]="eventFormData.date" 
                name="date" 
                required
              >
            </div>
            
            <div class="form-group">
              <label for="photo">
                <i class="fas fa-image"></i>
                Photo
              </label>
              <div class="file-upload">
                <input 
                  type="file" 
                  id="photo" 
                  (change)="onFileSelected($event)" 
                  accept="image/*"
                  class="file-input"
                >
                <label for="photo" class="file-label">
                  <i class="fas fa-cloud-upload-alt"></i>
                  Choisir une image
                </label>
                <span class="file-name" *ngIf="eventFormData.photo">
                  Image sélectionnée
                </span>
              </div>
            </div>
            
            <button type="submit" class="submit-btn" [disabled]="isLoading">
              <i class="fas" [ngClass]="isLoading ? 'fa-spinner fa-spin' : 'fa-plus'"></i>
              {{ isLoading ? 'Création en cours...' : 'Créer l\'événement' }}
            </button>
          </form>
        </section>

        <section class="events-section">
          <h2>Mes événements</h2>
          <div class="events-grid">
            <div *ngFor="let event of events" class="event-card" [ngClass]="event.status">
              <div class="event-image">
                <img [src]="event.photo || 'assets/default-event.jpg'" [alt]="event.name">
                <div class="event-status" [ngClass]="event.status">
                  {{ event.status === 'pending' ? 'En attente' : 
                     event.status === 'approved' ? 'Approuvé' : 'Rejeté' }}
                </div>
              </div>
              <div class="event-details">
                <h3>{{ event.name }}</h3>
                <p>{{ event.description }}</p>
                <div class="event-meta">
                  <span class="event-date">
                    <i class="fas fa-calendar"></i>
                    {{ event.date | date:'dd MMM yyyy' }}
                  </span>
                  <div class="event-actions">
                    <button class="delete-btn" (click)="deleteEvent(event.id)">
                      <i class="fas fa-trash"></i>
                      Supprimer
                    </button>
                  </div>
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
      grid-template-columns: 1fr 2fr;
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

    .event-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      color: #2c3e50;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    input, textarea {
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    input:focus, textarea:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      outline: none;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .file-upload {
      position: relative;
    }

    .file-input {
      position: absolute;
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      z-index: -1;
    }

    .file-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .file-label:hover {
      background: #e9ecef;
      border-color: #3498db;
    }

    .file-name {
      margin-top: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .submit-btn {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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

    .event-status {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .event-status.pending {
      background: #ffc107;
      color: #000;
    }

    .event-status.approved {
      background: #28a745;
      color: white;
    }

    .event-status.rejected {
      background: #dc3545;
      color: white;
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

    .event-date {
      color: #666;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .event-actions {
      display: flex;
      gap: 0.5rem;
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
  `]
})
export class OrganizerDashboardComponent implements OnInit {
  events: Event[] = [];
  eventFormData: Partial<Event> = {
    name: '',
    description: '',
    date: new Date(),
    photo: ''
  };
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || currentUser.type !== 'organizer') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadEvents();
  }

  get approvedEvents(): Event[] {
    return this.events.filter(event => event.status === 'approved');
  }

  get pendingEvents(): Event[] {
    return this.events.filter(event => event.status === 'pending');
  }

  loadEvents() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    });
  }

  onSubmit() {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) return;

    this.isLoading = true;
    const newEvent = {
      ...this.eventFormData,
      organizerId: currentUser.id
    } as Event;
    
    this.eventService.createEvent(newEvent).subscribe({
      next: () => {
        this.loadEvents();
        this.eventFormData = {
          name: '',
          description: '',
          date: new Date(),
          photo: ''
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la création de l\'événement:', error);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.eventFormData.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  deleteEvent(eventId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.loadEvents();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'événement:', error);
        }
      });
    }
  }
} 