import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
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
          <div class="mb-10 text-center">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Create Agency Account</h2>
            <p class="text-gray-500 font-medium">Start onboarding clients properly.</p>
          </div>
          
          <form [formGroup]="form" (ngSubmit)="handleRegister()" class="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Agency Name</label>
              <input 
                id="register-name"
                type="text"
                formControlName="name"
                maxlength="100"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-800" 
                placeholder="Acme Studio"
              />
              <div *ngIf="f['name'].touched && f['name'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="f['name'].errors?.['required']">Agency name is required</span>
                <span *ngIf="f['name'].errors?.['maxlength']">Agency name must be 100 characters or fewer</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <input 
                id="register-email"
                type="email"
                formControlName="email"
                maxlength="100"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-800" 
                placeholder="agency@example.com"
              />
              <div *ngIf="f['email'].touched && f['email'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="f['email'].errors?.['required']">Email is required</span>
                <span *ngIf="f['email'].errors?.['email']">Please enter a valid email address</span>
                <span *ngIf="f['email'].errors?.['maxlength']">Email must be 100 characters or fewer</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input 
                id="register-password"
                type="password"
                formControlName="password"
                maxlength="128"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-800" 
                placeholder="••••••••"
              />
              <div *ngIf="f['password'].touched && f['password'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="f['password'].errors?.['required']">Password is required</span>
                <span *ngIf="f['password'].errors?.['minlength']">Password must be at least 6 characters</span>
              </div>
            </div>
            
            <button 
              id="register-submit"
              type="submit" 
              [disabled]="loading || form.invalid"
              class="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-md mt-6"
              [class.opacity-70]="loading || form.invalid"
            >
              {{ loading ? 'Creating...' : 'Create Account' }}
            </button>
            <p *ngIf="error" class="text-red-500 text-sm mt-3 text-center bg-red-50 p-2 rounded-lg font-medium border border-red-100">{{ error }}</p>
            <p *ngIf="success" class="text-green-600 font-medium text-sm text-center">Registration successful! Redirecting to login...</p>
          </form>
          
          <div class="mt-8 text-center text-sm font-medium text-gray-500">
            Already have an account? 
            <a routerLink="/login" class="font-bold text-blue-600 hover:text-blue-800 ml-1">Sign in here</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]]
  });

  error = '';
  success = false;
  loading = false;

  private router = inject(Router);
  private http = inject(HttpClient);

  get f() { return this.form.controls; }

  async handleRegister() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    
    try {
      await this.http.post(`${environment.apiUrl}/api/auth/register`, {
        name: this.f['name'].value,
        email: this.f['email'].value,
        password: this.f['password'].value
      }).toPromise();
      
      this.success = true;
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (err: any) {
      this.error = err?.error?.message || err?.message || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }
}
