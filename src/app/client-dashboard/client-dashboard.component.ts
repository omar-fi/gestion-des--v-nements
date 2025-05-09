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
      <header>
        <h1>Dashboard Client</h1>
        <button (click)="logout()" class="logout-btn">Déconnexion</button>
      </header>
      
      <div class="content">
        <div class="events-section">
          <h2>Événements disponibles</h2>
          <div class="events-grid">
            <div *ngFor="let event of events" class="event-card">
              <img [src]="event.photo || 'assets/default-event.jpg'" alt="Event photo" class="event-photo">
              <div class="event-details">
                <h3>{{ event.name }}</h3>
                <p>{{ event.description }}</p>
                <p class="event-date">{{ event.date | date:'medium' }}</p>
                <button class="register-btn">S'inscrire</button>
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
      margin-bottom: 15px;
    }

    .register-btn {
      width: 100%;
      padding: 10px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .register-btn:hover {
      background-color: #218838;
    }
  `]
})
export class ClientDashboardComponent implements OnInit {
  constructor(
    private userService: UserService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    });
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  events: Event[] = [];
} 