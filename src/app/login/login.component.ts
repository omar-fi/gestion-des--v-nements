import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-background">
    <div class="login-container">
      <div class="login-content">
        <div class="login-left">
          <div class="brand-section">
            <h1>EventHub</h1>
            <p class="tagline">Votre plateforme de gestion d'événements</p>
          </div>
          <div class="features">
            <div class="feature-item">
              <i class="fas fa-calendar-check"></i>
              <span>Gérez vos événements facilement</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-ticket-alt"></i>
              <span>Réservez vos places en ligne</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-users"></i>
              <span>Connectez-vous avec d'autres passionnés</span>
            </div>
          </div>
        </div>

        <div class="login-right">
          <div class="login-card">
            <div class="login-header">
              <h2>Connexion</h2>
              <p>Bienvenue ! Connectez-vous pour accéder à votre espace</p>
            </div>

            <form (ngSubmit)="onSubmit()" class="login-form">
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
                  placeholder="Entrez votre nom d'utilisateur"
                  [class.error]="errorMessage"
                >
              </div>

              <div class="form-group">
                <label for="password">
                  <i class="fas fa-lock"></i>
                  Mot de passe
                </label>
                <div class="password-input">
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    id="password"
                    [(ngModel)]="password"
                    name="password"
                    required
                    placeholder="Entrez votre mot de passe"
                    [class.error]="errorMessage"
                  >
                  <button
                    type="button"
                    class="toggle-password"
                    (click)="togglePassword()"
                  >
                    <i class="fas" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
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
                  [class.error]="errorMessage"
                >
                  <option value="client">Client</option>
                  <option value="organizer">Organisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div *ngIf="errorMessage" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                {{ errorMessage }}
              </div>

              <button type="submit" class="login-btn" [disabled]="isLoading">
                <i class="fas" [ngClass]="isLoading ? 'fa-spinner fa-spin' : 'fa-sign-in-alt'"></i>
                {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
              </button>
            </form>

            <div class="register-link">
              <p>Vous n'avez pas de compte ?</p>
              <a routerLink="/register" class="register-btn">
                <i class="fas fa-user-plus"></i>
                Créer un compte
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`

    .login-background {
      position: fixed;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }


    .login-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      top: 0;
      right: 250px;
      height: 100vh;
      position: fixed;
      max-width: 1200px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .login-left {
      background: linear-gradient(135deg, #2c3e50, #3498db);
      padding: 3rem;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .brand-section {
      margin-bottom: 3rem;
    }

    .brand-section h1 {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #fff, #e0e0e0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .tagline {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1.1rem;
    }

    .feature-item i {
      font-size: 1.5rem;
      color: #3498db;
      background: rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 12px;
    }

    .login-right {
      padding: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h2 {
      color: #2c3e50;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .login-header p {
      color: #666;
      font-size: 1rem;
    }

    .login-form {
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

    input.error, select.error {
      border-color: #dc3545;
    }

    .password-input {
      position: relative;
    }

    .toggle-password {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 0.5rem;
      transition: color 0.3s ease;
    }

    .toggle-password:hover {
      color: #3498db;
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

    .login-btn {
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

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .register-link {
      margin-top: 2rem;
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }

    .register-link p {
      color: #666;
      margin-bottom: 0.5rem;
    }

    .register-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #3498db;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .register-btn:hover {
      color: #2980b9;
    }

    @media (max-width: 1024px) {
      .login-content {
        grid-template-columns: 1fr;
        max-width: 500px;
      }

      .login-left {
        display: none;
      }

      .login-right {
        padding: 2rem;
      }
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 1rem;
      }

      .login-right {
        padding: 1.5rem;
      }

      .login-card {
        max-width: 100%;
      }

      .login-header h2 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  role: string = 'client';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.redirectBasedOnRole(currentUser.role);
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.login(this.username, this.password).subscribe({
      next: (user) => {
        if (user && user.role === this.role) {
          this.redirectBasedOnRole(user.role);
        } else {
          this.errorMessage = 'Identifiants invalides ou rôle incorrect';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Une erreur est survenue lors de la connexion';
        this.isLoading = false;
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private redirectBasedOnRole(role: string) {
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
