import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  errorMessage = '';

  // الحسابات المسموح بها
  users: User[] = [
    {
      name: 'Ehab.Khamis',
      email: 'Ehab.Khamis@SoficoPharm.com',
      password: 'Sofico2025',
      avatar: 'assets/images/avatars/default-avatar.png'
    },
    {
      name: 'George.Gamil',
      email: 'George.Gamil@SoficoPharm.com',
      password: 'Sofico2025',
      avatar: 'assets/images/avatars/default-avatar.png'
    },
     {
      name: 'Aly.ElSayed',
      email: 'Aly.ElSayed@SoficoPharm.com',
      password: 'Sofico2025',
      avatar: 'assets/images/avatars/default-avatar.png'
    }
  ];

  constructor(private router: Router) {}

  onLogin(): void {
    const foundUser = this.users.find(
      u => u.email === this.email && u.password === this.password
    );

    if (foundUser) {
      // حفظ المستخدم في localStorage
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
