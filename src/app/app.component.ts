import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { UserService } from './services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <nav *ngIf="isLoggedIn" class="navbar">
        <div class="navbar-brand">
          <span class="brand-text">EventHub</span>
        </div>
        <div class="navbar-content">
          <div class="user-info">
            <i class="fas fa-user-circle"></i>
            <span>{{ currentUser?.username }}</span>
            <span class="user-role">{{ currentUser?.type | titlecase }}</span>
          </div>
          <button (click)="logout()" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i>
            Déconnexion
          </button>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #2c3e50, #3498db);
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .navbar-brand {
      display: flex;
      align-items: center;
    }

    .brand-text {
      font-size: 1.5rem;
      font-weight: bold;
      background: linear-gradient(45deg, #fff, #e0e0e0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .navbar-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .user-role {
      background-color: rgba(255,255,255,0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.8rem;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background-color: rgba(255,255,255,0.2);
      transform: translateY(-1px);
    }

    .main-content {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }

      .navbar-content {
        width: 100%;
        justify-content: space-between;
      }

      .user-info {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'event-management';
  isLoggedIn = false;
  currentUser: any = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
    } else {
      this.isLoggedIn = true;
      this.currentUser = currentUser;
    }

    this.userService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.userService.logout();
    this.isLoggedIn = false;
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}
