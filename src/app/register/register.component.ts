import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @ViewChild('registerForm') registerForm!: NgForm;
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: 'organizer' | 'client' = 'client';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Vérifier que les mots de passe correspondent
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Les mots de passe ne correspondent pas';
        this.isLoading = false;
        return;
      }

      // Créer l'objet utilisateur sans l'ID (le service s'en chargera)
      const userData = {
        username: this.email,
        password: this.password,
        type: this.role
      };

      this.userService.register(userData).subscribe({
        next: (user) => {
          this.errorMessage = 'Compte créé avec succès ! Connexion en cours...';
          // Attendre un peu avant de rediriger pour que l'utilisateur voie le message
          setTimeout(() => {
            this.goToLogin();
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
          this.isLoading = false;
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
} 