import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  userType: 'organizer' | 'client' = 'client';
  errorMessage: string = '';

  constructor(
    public router: Router,
    private userService: UserService
  ) {}

  register() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.userService.register({
      username: this.username,
      password: this.password,
      type: this.userType
    }).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
      }
    });
  }
} 