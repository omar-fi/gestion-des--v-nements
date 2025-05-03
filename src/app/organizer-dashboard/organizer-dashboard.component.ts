import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Event {
  name: string;
  description: string;
  date: Date;
  photo: string;
}

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './organizer-dashboard.component.html',
  styleUrls: ['./organizer-dashboard.component.css']
})
export class OrganizerDashboardComponent {
  newEvent: Event = {
    name: '',
    description: '',
    date: new Date(),
    photo: ''
  };

  events: Event[] = [];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newEvent.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  addEvent() {
    if (this.newEvent.name && this.newEvent.description && this.newEvent.date) {
      this.events.push({...this.newEvent});
      this.newEvent = {
        name: '',
        description: '',
        date: new Date(),
        photo: ''
      };
    }
  }
} 