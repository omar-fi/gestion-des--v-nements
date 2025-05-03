import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

interface Event {
  name: string;
  date: Date;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  events: Event[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
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