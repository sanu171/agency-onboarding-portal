import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { getErrorMessage } from '../../utils/error-handler';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="h-screen w-full flex bg-white">
      <!-- Left decorative panel -->
      <div class="hidden md:flex w-1/2 bg-blue-600 flex-col justify-between p-12 text-white relative">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 opacity-90 z-0"></div>
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;"></div>
        
        <!-- OnBoardly Logo -->
        <div class="relative z-10 flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg"
               style="background: linear-gradient(135deg, #1d4ed8, #7c3aed);">
            O
          </div>
          <span class="font-bold tracking-tight text-xl">OnBoardly</span>
        </div>
        
        <div class="relative z-10 max-w-md">
          <h1 class="text-4xl font-bold leading-tight mb-6 tracking-tight">Streamline how you welcome new clients.</h1>
          <p class="text-blue-100 text-lg leading-relaxed mb-12 font-medium">A single portal for intake forms, file uploads, contract signing, and payments. Say goodbye to scattered email threads.</p>
          
          <div class="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div class="flex -space-x-3">
              <img class="w-10 h-10 rounded-full border-2 border-blue-600" src="https://i.pravatar.cc/100?img=1" alt="User 1" />
              <img class="w-10 h-10 rounded-full border-2 border-blue-600" src="https://i.pravatar.cc/100?img=2" alt="User 2" />
              <div class="w-10 h-10 rounded-full border-2 border-blue-600 bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">+2k</div>
            </div>
            <div class="text-sm font-medium">Agencies trust OnBoardly to onboard clients</div>
          </div>
        </div>
      </div>
      
      <!-- Right form panel -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div class="w-full max-w-md">

          <!-- Session expired banner -->
          <div *ngIf="sessionExpired"
               class="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl font-medium text-sm">
            <span class="text-lg">⏱️</span>
            Session expired. Please login again.
          </div>

          <!-- Password reset success banner -->
          <div *ngIf="passwordReset"
               class="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl font-medium text-sm">
            <span class="text-lg">✅</span>
            Password reset successfully. Please sign in with your new password.
          </div>
          <div class="mb-10 text-center">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Sign in to your agency</h2>
            <p class="text-gray-500 font-medium">Welcome back! Please enter your details.</p>
          </div>
          
          <form [formGroup]="form" (ngSubmit)="handleLogin()" class="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <input 
                id="login-email"
                type="email" 
                formControlName="email"
                maxlength="100"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-800" 
                placeholder="agency@example.com"
              />
              <div *ngIf="f['email'].touched && f['email'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="f['email'].errors?.['required']">Email is required</span>
                <span *ngIf="f['email'].errors?.['email']">Please enter a valid email address</span>
              </div>
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-semibold text-gray-700">Password</label>
                <a routerLink="/forgot-password" class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Forgot password?</a>
              </div>
              <input 
                id="login-password"
                type="password" 
                formControlName="password"
                maxlength="128"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-800" 
                placeholder="••••••••"
              />
              <div *ngIf="f['password'].touched && f['password'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="f['password'].errors?.['required']">Password is required</span>
              </div>
            </div>
            
            <button 
              id="login-submit"
              type="submit" 
              [disabled]="loading || form.invalid"
              class="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-md mt-6"
              [class.opacity-70]="loading || form.invalid"
            >
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
            <p *ngIf="error" class="text-red-500 text-sm mt-3 text-center bg-red-50 p-2 rounded-lg font-medium border border-red-100">{{ error }}</p>
          </form>
          
          <div class="mt-8 text-center text-sm font-medium text-gray-500">
            Don't have an account? 
            <a routerLink="/register" class="font-bold text-blue-600 hover:text-blue-800 ml-1">Create an agency account</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.maxLength(128)]]
  });

  error = '';
  loading = false;
  sessionExpired = false;
  passwordReset = false;

  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  get f() { return this.form.controls; }

  constructor() {
    // Redirect if already authenticated
    effect(() => {
      const loading = this.auth.isLoading();
      if (!loading && this.auth.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.sessionExpired = params['reason'] === 'session_expired';
      this.passwordReset = params['reason'] === 'password_reset';
    });
  }

  async handleLogin() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    try {
      const data = await this.http.post<any>(`${environment.apiUrl}/api/auth/login`, {
        email: this.f['email'].value,
        password: this.f['password'].value
      }).toPromise();

      this.auth.login({
        id: data.agencyId,
        email: this.f['email'].value,
        agencyName: data.agencyName,
        token: data.token
      });
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = getErrorMessage(err, 'Login failed. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
