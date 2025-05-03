import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  username: string;
  password: string;
  type: 'organizer' | 'client';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [];

  register(user: User): Observable<User> {
    // Vérifier si l'utilisateur existe déjà
    if (this.users.find(u => u.username === user.username)) {
      throw new Error('Ce nom d\'utilisateur est déjà pris');
    }
    
    // Ajouter le nouvel utilisateur
    this.users.push(user);
    return of(user);
  }

  login(username: string, password: string): Observable<User | null> {
    const user = this.users.find(u => u.username === username && u.password === password);
    return of(user || null);
  }

  getUsers(): Observable<User[]> {
    return of(this.users);
  }

  getOrganizers(): Observable<User[]> {
    return new Observable(subscriber => {
      subscriber.next(this.users.filter(u => u.type === 'organizer'));
      subscriber.complete();
    });
  }

  getClients(): Observable<User[]> {
    return new Observable(subscriber => {
      subscriber.next(this.users.filter(u => u.type === 'client'));
      subscriber.complete();
    });
  }
} 