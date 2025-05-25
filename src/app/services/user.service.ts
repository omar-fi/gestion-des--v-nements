import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly ADMIN_USER: User = {
    id: 'admin',
    fullname: 'Administrateur',
    username: 'admin@admin.com',
    password: 'admin123',
    role: 'admin'
  };

  private users: User[] = [this.ADMIN_USER];
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.logout();

    const usersRef = collection(db, 'users');
    onSnapshot(usersRef, (snapshot) => {
      const parsedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      if (!parsedUsers.find((u: User) => u.role === 'admin')) {
        this.saveAdminUser();
      }
      this.users = parsedUsers;
    });

    // Récupérer l'utilisateur courant depuis Firestore (exemple)
    this.getCurrentUserFromFirestore();
  }

  private async saveAdminUser() {
    const usersRef = collection(db, 'users');
    await addDoc(usersRef, this.ADMIN_USER);
  }

  private async setCurrentUserInFirestore(user: User | null) {
    const sessionRef = doc(db, 'sessions', 'current');
    await setDoc(sessionRef, { user });
  }

  private async getCurrentUserFromFirestore() {
    const sessionRef = doc(db, 'sessions', 'current');
    const sessionSnap = await getDocs(query(collection(db, 'sessions')));
    const session = sessionSnap.docs.find(d => d.id === 'current');
    if (session && session.data()['user']) {
      this.currentUserSubject.next(session.data()['user'] as User);
    }
  }

  register(user: Omit<User, 'id'>): Observable<User> {
    if (this.users.find(u => u.username === user.username)) {
      return throwError(() => new Error('Ce nom d\'utilisateur est déjà pris'));
    }

    if (user.role === 'admin') {
      return throwError(() => new Error('La création de compte administrateur n\'est pas autorisée'));
    }

    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      fullname: user.fullname || user.username, // Utiliser le nom d'utilisateur comme nom complet par défaut
    };

    // Ajout dans Firestore
    const usersRef = collection(db, 'users');
    addDoc(usersRef, newUser);

    this.users.push(newUser);
    return of(newUser);
  }

  login(username: string, password: string): Observable<User | null> {
    if (username === this.ADMIN_USER.username && password === this.ADMIN_USER.password) {
      this.currentUserSubject.next(this.ADMIN_USER);
      this.setCurrentUserInFirestore(this.ADMIN_USER);
      return of(this.ADMIN_USER);
    }

    const user = this.users.find(u =>
      u.username === username &&
      u.password === password &&
      u.role !== 'admin'
    );

    if (user) {
      this.currentUserSubject.next(user);
      this.setCurrentUserInFirestore(user);
      return of(user);
    }

    return of(null);
  }

  logout() {
    this.currentUserSubject.next(null);
    this.setCurrentUserInFirestore(null);
  }

  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    if (!user) {
      return null;
    }

    const userExists = this.users.some(u => u.id === user.id && u.username === user.username);
    if (!userExists) {
      this.logout();
      return null;
    }

    return user;
  }

  getUsers(): Observable<User[]> {
    return of(this.users);
  }

  getOrganizers(): Observable<User[]> {
    return new Observable(subscriber => {
      subscriber.next(this.users.filter(u => u.role === 'organizer'));
      subscriber.complete();
    });
  }

  getClients(): Observable<User[]> {
    return new Observable(subscriber => {
      subscriber.next(this.users.filter(u => u.role === 'client'));
      subscriber.complete();
    });
  }
}
