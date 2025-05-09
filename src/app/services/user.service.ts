import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

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
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Charger les utilisateurs depuis le localStorage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }

    // Vérifier si un utilisateur est déjà connecté
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  private saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  register(user: User): Observable<User> {
    // Vérifier si l'utilisateur existe déjà
    if (this.users.find(u => u.username === user.username)) {
      throw new Error('Ce nom d\'utilisateur est déjà pris');
    }
    
    // Ajouter le nouvel utilisateur
    this.users.push(user);
    this.saveUsers();
    return of(user);
  }

  login(username: string, password: string): Observable<User | null> {
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    return of(user || null);
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
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