import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id?: number;
  name: string;
  email: string;
  username: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo?: {
      lat: string;
      lng: string;
    };
  };
  company?: {
    name: string;
    catchPhrase?: string;
    bs?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';
  private cachedUsers: User[] | null = null;
  private usersUpdated = new BehaviorSubject<void>(undefined);
  private localUsers: User[] = [];

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    if (this.cachedUsers) {
      return of(this.cachedUsers);
    }
    
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(data => {
        this.cachedUsers = data;
      })
    );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  notifyUsersUpdated(): void {
    this.usersUpdated.next();
  }

  getUsersUpdated(): Observable<void> {
    return this.usersUpdated.asObservable();
  }

  clearCache(): void {
    this.cachedUsers = null;
  }

  addUserToCache(user: User): void {
    if (!this.cachedUsers) {
      this.cachedUsers = [];
    }
    this.cachedUsers = [user, ...this.cachedUsers];
    this.usersUpdated.next();
  }

  getCachedUsers(): User[] {
    return this.cachedUsers || [];
  }

  setLocalUsers(users: User[]): void {
    this.localUsers = [...users];
  }

  getLocalUsers(): User[] {
    return this.localUsers;
  }

  addLocalUser(user: User): void {
    this.localUsers = [user, ...this.localUsers];
    this.usersUpdated.next();
  }

  removeLocalUser(id: number): void {
    this.localUsers = this.localUsers.filter(u => u.id !== id);
    this.usersUpdated.next();
  }

  clearLocalUsers(): void {
    this.localUsers = [];
    this.usersUpdated.next();
  }

  getLocalUser(id: number): User | undefined {
    return this.localUsers.find(u => u.id === id);
  }

  updateLocalUser(id: number, user: User): void {
    const index = this.localUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.localUsers[index] = { ...this.localUsers[index], ...user };
      this.usersUpdated.next();
    }
  }
}