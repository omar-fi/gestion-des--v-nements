import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  role: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    // Vérifier si l'utilisateur est déjà connecté
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.redirectBasedOnUserType(currentUser.type);
    }
  }

  private redirectBasedOnUserType(userType: string) {
    switch (userType) {
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

  onSubmit() {
    if (!this.email || !this.password || !this.role) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.userService.login(this.email, this.password, this.role).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          switch (this.role) {
            case 'admin':
              this.router.navigate(['/admin-dashboard']);
              break;
            case 'organizer':
              this.router.navigate(['/organizer-dashboard']);
              break;
            case 'client':
              this.router.navigate(['/client-dashboard']);
              break;
          }
        } else {
          this.errorMessage = response.message || 'Erreur de connexion';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Une erreur est survenue lors de la connexion';
        console.error('Login error:', error);
      }
    });
  }

  register() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.userService.register({
      username: this.email,
      password: this.password,
      type: this.role
    }).subscribe({
      next: (user) => {
        if (user) {
          this.onSubmit();
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
      }
    });
  }
} 