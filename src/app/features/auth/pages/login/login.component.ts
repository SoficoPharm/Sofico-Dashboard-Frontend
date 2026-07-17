// import { AuthService } from './../../services/auth.service';
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent {
//   username = '';  // تم التغيير من email إلى username
//   password = '';
//   rememberMe = false;
//   errorMessage = '';
//   isLoading = false;

//   constructor(
//     private router: Router,
//     private authService: AuthService
//   ) {}

//   onLogin(): void {
//     this.errorMessage = '';

//     // Validation
//     if (!this.username || !this.password) {
//       this.errorMessage = 'Please enter username and password';
//       return;
//     }

//     this.isLoading = true;

//     // استخدام username بدلاً من email
//     this.authService.login(this.username, this.password).subscribe({
//       next: (response) => {
//         console.log('✅ Login Response:', response);
        
//         if (response.success) {
//           // إعادة توجيه للـ Dashboard
//           this.router.navigate(['/dashboard']);
//         } else {
//           this.errorMessage = response.message || 'Login failed';
//           this.isLoading = false;
//         }
//       },
//       error: (error) => {
//         console.error('❌ Login Error:', error);
//         this.errorMessage = error.message || 'An error occurred during login';
//         this.isLoading = false;
//       }
//     });
//   }

//   // ========================================
//   // 🧪 Test API Connection (اختياري)
//   // ========================================
//   testConnection(): void {
//     this.authService.testConnection().subscribe({
//       next: (response) => {
//         console.log('✅ API Test:', response);
//         alert('Connection to API successful! ✅');
//       },
//       error: (error) => {
//         console.error('❌ API Test Failed:', error);
//         alert('Failed to connect to API ❌\n\nMake sure the API is running on http://localhost:5000');
//       }
//     });
//   }
// }



// import { AuthService } from './../../services/auth.service';
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent {
//   username = '';
//   password = '';
//   rememberMe = false;
//   errorMessage = '';
//   isLoading = false;

//   constructor(
//     private router: Router,
//     private route: ActivatedRoute,
//     private authService: AuthService
//   ) {}

//   onLogin(): void {
//     this.errorMessage = '';

//     if (!this.username || !this.password) {
//       this.errorMessage = 'Please enter username and password';
//       return;
//     }

//     this.isLoading = true;

//     this.authService.login(this.username, this.password).subscribe({
//       next: (response) => {
//         console.log('✅ Login Response:', response);

//         if (response.success) {

//           // لو المستخدم كان داخل على صفحة معينة قبل الـ Login
//           const returnUrl =
//             this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

//           this.router.navigateByUrl(returnUrl);

//         } else {
//           this.errorMessage = response.message || 'Login failed';
//           this.isLoading = false;
//         }
//       },
//       error: (error) => {
//         console.error('❌ Login Error:', error);
//         this.errorMessage = error.message || 'An error occurred during login';
//         this.isLoading = false;
//       }
//     });
//   }

//   testConnection(): void {
//     this.authService.testConnection().subscribe({
//       next: () => {
//         alert('Connection to API successful! ✅');
//       },
//       error: (error) => {
//         console.error('❌ API Test Failed:', error);
//         alert('Failed to connect to API ❌\n\nMake sure the API is running on http://localhost:5000');
//       }
//     });
//   }
// }

import { AuthService } from './../../services/auth.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  username = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  onLogin(): void {

    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe({

      next: (response) => {

        console.log('✅ Login Response:', response);

        if (response.success) {

          // الصفحة اللي المستخدم كان داخل عليها قبل الـ Login
          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

          // ✅ احفظ نقطة البداية
          sessionStorage.setItem('startPage', returnUrl);

          console.log('Start Page:', returnUrl);

          // روح لنفس الصفحة
          this.router.navigateByUrl(returnUrl);

        } else {

          this.errorMessage = response.message || 'Login failed';
          this.isLoading = false;

        }
      },

      error: (error) => {

        console.error('❌ Login Error:', error);

        this.errorMessage =
          error.message || 'An error occurred during login';

        this.isLoading = false;
      }

    });
  }

  testConnection(): void {

    this.authService.testConnection().subscribe({

      next: () => {
        alert('Connection to API successful! ✅');
      },

      error: (error) => {

        console.error('❌ API Test Failed:', error);

        alert(
          'Failed to connect to API ❌\n\nMake sure the API is running on http://localhost:5000'
        );
      }

    });
  }
}