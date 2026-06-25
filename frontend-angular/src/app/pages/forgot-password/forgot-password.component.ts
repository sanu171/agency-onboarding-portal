import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { getErrorMessage } from '../../utils/error-handler';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="h-screen w-full flex bg-white">
      <!-- Left decorative panel -->
      <div class="hidden md:flex w-1/2 flex-col justify-between p-12 text-white relative"
           style="background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%);">
        <div class="absolute inset-0 opacity-10"
             style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;"></div>

        <div class="relative z-10 flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg"
               style="background: rgba(255,255,255,0.2);">O</div>
          <span class="font-bold tracking-tight text-xl">OnBoardly</span>
        </div>

        <div class="relative z-10 max-w-md">
          <div class="text-6xl mb-6">🔑</div>
          <h1 class="text-4xl font-bold leading-tight mb-6 tracking-tight">Forgot your password?</h1>
          <p class="text-blue-100 text-lg leading-relaxed font-medium">
            No worries. Enter your email and we'll send you a one-time code to reset it in seconds.
          </p>
        </div>

        <div class="relative z-10 text-blue-200 text-sm">
          Secure 6-digit OTP · Expires in 15 minutes
        </div>
      </div>

      <!-- Right form panel -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div class="w-full max-w-md">

          <!-- State 1: Email form -->
          <ng-container *ngIf="!otpSent">
            <div class="mb-10 text-center">
              <h2 class="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Reset your password</h2>
              <p class="text-gray-500 font-medium">Enter your agency email to receive an OTP.</p>
            </div>

            <form [formGroup]="form" (ngSubmit)="handleSubmit()"
                  class="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Agency Email</label>
                <input
                  id="forgot-email"
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

              <button
                id="forgot-submit"
                type="submit"
                [disabled]="loading || form.invalid"
                class="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-md"
                [class.opacity-70]="loading || form.invalid"
              >
                {{ loading ? 'Sending OTP...' : 'Send Reset Code' }}
              </button>

              <p *ngIf="error"
                 class="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg font-medium border border-red-100">
                {{ error }}
              </p>
            </form>
          </ng-container>

          <!-- State 2: OTP sent confirmation -->
          <ng-container *ngIf="otpSent">
            <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border-2 border-green-200">
                📬
              </div>
              <h2 class="text-2xl font-extrabold text-gray-900 mb-3">Check your inbox</h2>
              <p class="text-gray-500 mb-2 font-medium">
                We sent a 6-digit reset code to:
              </p>
              <p class="text-blue-700 font-bold text-lg mb-6 bg-blue-50 px-4 py-2 rounded-lg inline-block">
                {{ form.value.email }}
              </p>
              <p class="text-gray-400 text-sm mb-8">
                Didn't receive it? Check your spam folder or wait a few seconds.
              </p>
              <button
                id="go-to-reset"
                (click)="goToReset()"
                class="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-md mb-4"
              >
                Enter Reset Code →
              </button>
              <button
                (click)="otpSent = false"
                class="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                ← Use a different email
              </button>
            </div>
          </ng-container>

          <div class="mt-8 text-center text-sm font-medium text-gray-500">
            Remember your password?
            <a routerLink="/login" class="font-bold text-blue-600 hover:text-blue-800 ml-1">Back to Sign in</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]]
  });

  loading = false;
  error = '';
  otpSent = false;

  private router = inject(Router);
  private http = inject(HttpClient);

  get f() { return this.form.controls; }

  async handleSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    try {
      await this.http.post(
        `${environment.apiUrl}/api/auth/forgot-password`,
        { email: this.f['email'].value }
      ).toPromise();
      this.otpSent = true;
    } catch (err: any) {
      this.error = getErrorMessage(err, 'Failed to send OTP. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  goToReset() {
    this.router.navigate(['/reset-password'], {
      queryParams: { email: this.f['email'].value }
    });
  }
}
