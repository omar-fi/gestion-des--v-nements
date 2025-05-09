import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

interface Event {
  name: string;
  date: Date;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header>
        <h1>Dashboard Admin</h1>
        <button (click)="logout()" class="logout-btn">Déconnexion</button>
      </header>
      <div class="content">
        <!-- Contenu du dashboard -->
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
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
  `]
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  events: Event[] = [];

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  deleteUser(user: any) {
    // Implémentation de la suppression d'utilisateur
    console.log('Suppression de l\'utilisateur:', user);
  }

  deleteEvent(event: Event) {
    // Implémentation de la suppression d'événement
    console.log('Suppression de l\'événement:', event);
  }
} 