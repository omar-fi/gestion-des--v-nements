import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Event {
  name: string;
  description: string;
  date: Date;
  photo: string;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent {
  events: Event[] = [
    {
      name: 'Concert de Jazz',
      description: 'Un concert de jazz exceptionnel avec des artistes internationaux',
      date: new Date('2024-06-15T20:00:00'),
      photo: 'assets/jazz-concert.jpg'
    },
    {
      name: 'Exposition d\'Art',
      description: 'Exposition des œuvres d\'artistes contemporains',
      date: new Date('2024-07-01T10:00:00'),
      photo: 'assets/art-exhibition.jpg'
    }
  ];
} 