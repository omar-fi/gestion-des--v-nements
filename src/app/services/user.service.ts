import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: number;
  username: string;
  password: string;
  type: 'admin' | 'organizer' | 'client';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Compte administrateur fixe
  private readonly ADMIN_USER: User = {
    id: 1,
    username: 'admin@admin.com',
    password: 'admin123',
    type: 'admin'
  };

  private users: User[] = [this.ADMIN_USER];
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Charger les utilisateurs depuis le localStorage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      // S'assurer que le compte admin existe toujours
      if (!parsedUsers.find((u: User) => u.type === 'admin')) {
        parsedUsers.push(this.ADMIN_USER);
      }
      this.users = parsedUsers;
    }
    this.saveUsers();

    // Vérifier si un utilisateur est déjà connecté
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  private saveUsers() {
    // S'assurer que le compte admin n'est pas modifié
    const usersWithoutAdmin = this.users.filter(u => u.type !== 'admin');
    const usersToSave = [...usersWithoutAdmin, this.ADMIN_USER];
    localStorage.setItem('users', JSON.stringify(usersToSave));
  }

  register(user: Omit<User, 'id'>): Observable<User> {
    // Vérifier si l'utilisateur existe déjà
    if (this.users.find(u => u.username === user.username)) {
      throw new Error('Ce nom d\'utilisateur est déjà pris');
    }
    
    // Empêcher la création d'un compte admin
    if (user.type === 'admin') {
      throw new Error('La création de compte administrateur n\'est pas autorisée');
    }
    
    // Créer un nouvel utilisateur avec un ID unique
    const newUser: User = {
      ...user,
      id: Date.now() // Utiliser timestamp comme ID unique
    };
    
    // Ajouter le nouvel utilisateur
    this.users.push(newUser);
    this.saveUsers();
    return of(newUser);
  }

  login(username: string, password: string): Observable<User | null> {
    // Vérification spéciale pour le compte admin
    if (username === this.ADMIN_USER.username && password === this.ADMIN_USER.password) {
      this.currentUserSubject.next(this.ADMIN_USER);
      localStorage.setItem('currentUser', JSON.stringify(this.ADMIN_USER));
      return of(this.ADMIN_USER);
    }

    // Vérification pour les autres utilisateurs
    const user = this.users.find(u => 
      u.username === username && 
      u.password === password && 
      u.type !== 'admin'
    );
    
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