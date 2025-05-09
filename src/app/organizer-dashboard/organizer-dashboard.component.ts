import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { EventService, Event } from '../services/event.service';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="dashboard-container">
      <header>
        <h1>Dashboard Organisateur</h1>
        <button (click)="logout()" class="logout-btn">Déconnexion</button>
      </header>
      
      <div class="content">
        <div class="create-event-section">
          <h2>Créer un nouvel événement</h2>
          <form (ngSubmit)="onSubmit()" class="event-form">
            <div class="form-group">
              <label for="name">Nom de l'événement</label>
              <input type="text" id="name" [(ngModel)]="eventFormData.name" name="name" required>
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" [(ngModel)]="eventFormData.description" name="description" required></textarea>
            </div>
            
            <div class="form-group">
              <label for="date">Date</label>
              <input type="datetime-local" id="date" [(ngModel)]="eventFormData.date" name="date" required>
            </div>
            
            <div class="form-group">
              <label for="photo">Photo</label>
              <input type="file" id="photo" (change)="onFileSelected($event)" accept="image/*">
            </div>
            
            <button type="submit" class="submit-btn">Créer l'événement</button>
          </form>
        </div>

        <div class="events-list-section">
          <h2>Mes événements</h2>
          <div class="events-grid">
            <div *ngFor="let event of events" class="event-card">
              <img [src]="event.photo || 'assets/default-event.jpg'" alt="Event photo" class="event-photo">
              <div class="event-details">
                <h3>{{ event.name }}</h3>
                <p>{{ event.description }}</p>
                <p class="event-date">{{ event.date | date:'medium' }}</p>
                <button (click)="editEvent(event)" class="edit-btn">Modifier</button>
                <button (click)="deleteEvent(event.id)" class="delete-btn">Supprimer</button>
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
    
    .logout-btn {
      padding: 8px 16px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .logout-btn:hover {
      background-color: #c82333;
    }

    .content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 30px;
    }

    .create-event-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .event-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    label {
      font-weight: 500;
      color: #333;
    }

    input, textarea {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    .submit-btn {
      padding: 10px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .submit-btn:hover {
      background-color: #218838;
    }

    .events-list-section {
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
    }

    .event-card:hover {
      transform: translateY(-5px);
    }

    .event-photo {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .event-details {
      padding: 15px;
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

    .edit-btn {
      width: 100%;
      padding: 8px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }

    .edit-btn:hover {
      background-color: #218838;
    }

    .delete-btn {
      width: 100%;
      padding: 8px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }

    .delete-btn:hover {
      background-color: #c82333;
    }
  `]
})
export class OrganizerDashboardComponent implements OnInit {
  events: Event[] = [];
  currentUser: any;
  showModal: boolean = false;
  editingEvent: Event | null = null;
  eventFormData: Partial<Event> = {
    name: '',
    description: '',
    date: new Date(),
    photo: ''
  };

  constructor(
    private eventService: EventService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEventsByOrganizer(this.currentUser.id).subscribe(events => {
      this.events = events;
    });
  }

  openCreateEventModal() {
    this.editingEvent = null;
    this.eventFormData = {
      name: '',
      description: '',
      date: new Date(),
      photo: ''
    };
    this.showModal = true;
  }

  editEvent(event: Event) {
    this.editingEvent = event;
    this.eventFormData = { ...event };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingEvent = null;
    this.eventFormData = {
      name: '',
      description: '',
      date: new Date(),
      photo: ''
    };
  }

  onSubmit() {
    if (this.editingEvent) {
      // Mise à jour de l'événement existant
      const updatedEvent = {
        ...this.editingEvent,
        ...this.eventFormData
      };
      this.eventService.updateEvent(updatedEvent).subscribe(() => {
        this.loadEvents();
        this.closeModal();
      });
    } else {
      // Création d'un nouvel événement
      const newEvent = {
        ...this.eventFormData,
        organizerId: this.currentUser.id
      } as Event;
      
      this.eventService.createEvent(newEvent).subscribe(() => {
        this.loadEvents();
        this.closeModal();
      });
    }
  }

  deleteEvent(eventId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(eventId).subscribe(() => {
        this.loadEvents();
      });
    }
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
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
} 