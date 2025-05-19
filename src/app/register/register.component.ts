import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>Créer un compte</h1>
          <p>Rejoignez EventHub et commencez à gérer vos événements</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-group">
            <label for="username">
              <i class="fas fa-user"></i>
              Nom d'utilisateur
            </label>
            <input 
              type="text" 
              id="username" 
              [(ngModel)]="username" 
              name="username" 
              required
              placeholder="Choisissez un nom d'utilisateur"
            >
          </div>

          <div class="form-group">
            <label for="password">
              <i class="fas fa-lock"></i>
              Mot de passe
            </label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password" 
              required
              placeholder="Créez un mot de passe"
            >
          </div>

          <div class="form-group">
            <label for="confirmPassword">
              <i class="fas fa-lock"></i>
              Confirmer le mot de passe
            </label>
            <input 
              type="password" 
              id="confirmPassword" 
              [(ngModel)]="confirmPassword" 
              name="confirmPassword" 
              required
              placeholder="Confirmez votre mot de passe"
            >
          </div>

          <div class="form-group">
            <label for="role">
              <i class="fas fa-user-tag"></i>
              Rôle
            </label>
            <select 
              id="role" 
              [(ngModel)]="role" 
              name="role" 
              required
              class="role-select"
            >
              <option value="client">Client</option>
              <option value="organizer">Organisateur</option>
            </select>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <button type="submit" class="register-btn" [disabled]="isLoading">
            <i class="fas" [ngClass]="isLoading ? 'fa-spinner fa-spin' : 'fa-user-plus'"></i>
            {{ isLoading ? 'Création en cours...' : 'Créer un compte' }}
          </button>
        </form>

        <div class="login-link">
          <p>Vous avez déjà un compte ?</p>
          <a routerLink="/login" class="login-btn">
            <i class="fas fa-sign-in-alt"></i>
            Se connecter
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }

    .register-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      padding: 2.5rem;
      width: 100%;
      max-width: 500px;
      animation: slideUp 0.5s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .register-header h1 {
      color: #2c3e50;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .register-header p {
      color: #666;
      font-size: 1rem;
    }

    .register-form {
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

    input, select {
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    input:focus, select:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      outline: none;
    }

    .role-select {
      background-color: white;
      cursor: pointer;
    }

    .error-message {
      background-color: #fee2e2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .register-btn {
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

    .register-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    }

    .register-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .login-link {
      margin-top: 2rem;
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }

    .login-link p {
      color: #666;
      margin-bottom: 0.5rem;
    }

    .login-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #3498db;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .login-btn:hover {
      color: #2980b9;
    }

    @media (max-width: 480px) {
      .register-card {
        padding: 1.5rem;
      }

      .register-header h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: 'admin' | 'organizer' | 'client' = 'client';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.redirectBasedOnRole(currentUser.type);
    }
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData: Omit<User, 'id'> = {
      username: this.username,
      password: this.password,
      type: this.role
    };

    this.userService.register(userData).subscribe({
      next: (user) => {
        if (user) {
          this.redirectBasedOnRole(this.role);
        } else {
          this.errorMessage = 'Erreur lors de la création du compte';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
        this.isLoading = false;
      }
    });
  }

  private redirectBasedOnRole(role: 'admin' | 'organizer' | 'client') {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'organizer':
        this.router.navigate(['/organizer-dashboard']);
        break;
      case 'client':
        this.router.navigate(['/client-dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
} 