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
  username: string = '';
  password: string = '';
  userType: 'organizer' | 'client' = 'client';
  errorMessage: string = '';
  isAdminLogin: boolean = false;

  constructor(
    public router: Router,
    private userService: UserService
  ) {}

  login() {
    if (this.isAdminLogin) {
      // Vérification des identifiants admin
      if (this.username === 'admin' && this.password === 'admin123') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.errorMessage = 'Identifiants admin incorrects';
      }
    } else {
      this.userService.login(this.username, this.password).subscribe(user => {
        if (user) {
          const userType = user.type as 'organizer' | 'client';
          if (userType === 'organizer') {
            this.router.navigate(['/organizer-dashboard']);
          } else if (userType === 'client') {
            this.router.navigate(['/client-dashboard']);
          }
        } else {
          this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
        }
      });
    }
  }

  register() {
    this.userService.register({
      username: this.username,
      password: this.password,
      type: this.userType
    }).subscribe(user => {
      if (user) {
        this.login();
      }
    });
  }
} 