import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @ViewChild('loginForm') loginForm!: NgForm;
  email: string = '';
  password: string = '';
  role: 'admin' | 'organizer' | 'client' = 'client';
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

  private redirectBasedOnUserType(userType: 'admin' | 'organizer' | 'client') {
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
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.userService.login(this.email, this.password).subscribe({
        next: (user) => {
          if (user && user.type === this.role) {
            this.redirectBasedOnUserType(user.type);
          } else {
            this.errorMessage = 'Identifiants invalides ou rôle incorrect';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Une erreur est survenue';
          this.isLoading = false;
        }
      });
    }
  }
  options = {
    path: 'assets/angular-logo-animation.json', // your Lottie file
  };

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
