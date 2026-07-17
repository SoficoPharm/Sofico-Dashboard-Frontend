import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// ========================================
// 📦 Interfaces
// ========================================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserDto;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ========================================
  // 🔧 Configuration
  // ========================================
  private apiUrl = `${environment.apiUrl}/Login`;
  
  // ========================================
  // 📡 State Management
  // ========================================
  private currentUserSubject = new BehaviorSubject<UserDto | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔧 Auth Service initialized with API:', this.apiUrl);
    console.log('🌍 Environment:', environment.production ? 'Production' : 'Development');
  }

  // ========================================
  // 🔐 Login
  // ========================================
  login(username: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { username, password };

    return this.http.post<LoginResponse>(this.apiUrl, request).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.setSession(response.user);
          console.log('✅ Login successful:', response.user.username);
        }
      }),
      catchError(this.handleError)
    );
  }

  // ========================================
  // 🚪 Logout
  // ========================================
  logout(): void {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
    console.log('✅ Logged out successfully');
  }

  // ========================================
  // 💾 Session Management
  // ========================================
  private setSession(user: UserDto): void {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('authToken', 'true');
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private getUserFromStorage(): UserDto | null {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  private hasToken(): boolean {
    return sessionStorage.getItem('authToken') !== null;
  }

  // ========================================
  // 📊 Getters
  // ========================================
  get currentUserValue(): UserDto | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // ========================================
  // 🧪 Test Connection
  // ========================================
  testConnection(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/Login/test`);
  }

  // ========================================
  // ❌ Error Handling
  // ========================================
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ في الاتصال بالخادم';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid input data';
      } else if (error.status === 500) {
        errorMessage = 'Server error occurred';
      } else if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please check your connection';
      }
    }

    console.error('❌ Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}