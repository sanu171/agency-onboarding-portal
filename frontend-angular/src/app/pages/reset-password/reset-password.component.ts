import { Component, inject, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/** Custom validator: newPassword and confirmPassword must match */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="h-screen w-full flex bg-white overflow-auto">
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
          <div class="text-6xl mb-6">🔐</div>
          <h1 class="text-4xl font-bold leading-tight mb-6 tracking-tight">Enter your reset code</h1>
          <p class="text-blue-100 text-lg leading-relaxed font-medium">
            Check your email for the 6-digit code we sent you and choose a new password.
          </p>
        </div>

        <div class="relative z-10 text-blue-200 text-sm">
          OTP expires in 15 minutes · Never share this code with anyone
        </div>
      </div>

      <!-- Right form panel -->
      <div class="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div class="w-full max-w-md">

          <!-- Success state -->
          <ng-container *ngIf="success">
            <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border-2 border-green-200">✅</div>
              <h2 class="text-2xl font-extrabold text-gray-900 mb-3">Password Reset!</h2>
              <p class="text-gray-500 mb-8 font-medium">Your password has been updated successfully. You can now sign in.</p>
              <a routerLink="/login" [queryParams]="{reason: 'password_reset'}"
                 class="block w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-md text-center">
                Go to Sign In →
              </a>
            </div>
          </ng-container>

          <!-- Reset form -->
          <ng-container *ngIf="!success">
            <div class="mb-8 text-center">
              <h2 class="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Create new password</h2>
              <p class="text-gray-500 font-medium">
                Resetting for: <span class="text-blue-700 font-bold">{{ email }}</span>
              </p>
            </div>

            <form [formGroup]="form" (ngSubmit)="handleSubmit()"
                  class="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

              <!-- 6-digit OTP input boxes -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">6-Digit Reset Code</label>
                <div class="flex gap-3 justify-between">
 <input
  *ngFor="let digit of otpDigits; let i = index; trackBy: trackByIndex"
  #otpInput
  type="text"
  inputmode="numeric"
  maxlength="1"
  [id]="'otp-digit-' + i"
  autocomplete="one-time-code"
  (input)="onOtpInput($event, i)"
  (keydown)="onOtpKeydown($event, i)"
  (paste)="onOtpPaste($event)"
  class="w-12 h-14 text-center text-xl font-semibold border-2 rounded-xl outline-none"
  [class.border-blue-500]="otpDigits[i]"
  [class.border-gray-200]="!otpDigits[i]"
/>
</div>
                <p *ngIf="otpError" class="mt-2 text-red-500 text-xs font-medium">{{ otpError }}</p>
              </div>

              <!-- New Password -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  formControlName="newPassword"
                  maxlength="128"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-800"
                  placeholder="Min. 8 characters"
                />
                <div *ngIf="f['newPassword'].touched && f['newPassword'].errors"
                     class="mt-1 text-red-500 text-xs font-medium">
                  <span *ngIf="f['newPassword'].errors?.['required']">Password is required</span>
                  <span *ngIf="f['newPassword'].errors?.['minlength']">At least 8 characters required</span>
                </div>
              </div>

              <!-- Confirm Password -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  formControlName="confirmPassword"
                  maxlength="128"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-800"
                  placeholder="Re-enter your password"
                />
                <div *ngIf="f['confirmPassword'].touched && form.errors?.['passwordMismatch']"
                     class="mt-1 text-red-500 text-xs font-medium">
                  Passwords do not match
                </div>
              </div>

              <button
                id="reset-submit"
                type="submit"
                [disabled]="loading || form.invalid || otpValue.length < 6"
                class="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-md"
                [class.opacity-70]="loading || form.invalid || otpValue.length < 6"
              >
                {{ loading ? 'Resetting...' : 'Reset Password' }}
              </button>

              <p *ngIf="error"
                 class="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg font-medium border border-red-100">
                {{ error }}
              </p>
            </form>

            <div class="mt-6 text-center">
              <a routerLink="/forgot-password"
                 class="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">
                ← Request a new OTP
              </a>
            </div>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  form = inject(FormBuilder).nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmPassword: ['', [Validators.required, Validators.maxLength(128)]]
    },
    { validators: passwordMatchValidator }
  );

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  trackByIndex(index: number): number {
    return index;
  }
  // 6 individual digit slots
  otpDigits: string[] = ['', '', '', '', '', ''];
  otpError = '';
  error = '';
  loading = false;
  success = false;
  email = '';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  get f() { return this.form.controls; }

  /** Combines the 6 digit slots into a single OTP string */
  get otpValue(): string {
    return this.otpDigits.join('');
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  // ---- OTP box interaction handlers ----------------------------------------
  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const inputs = this.otpInputs.toArray();

    let value = input.value.replace(/\D/g, '');

    if (!value) {
      input.value = '';
      this.otpDigits[index] = '';
      return;
    }

    value = value.charAt(value.length - 1);

    input.value = value;
    this.otpDigits[index] = value;

    if (index < inputs.length - 1) {
      inputs[index + 1].nativeElement.focus();
    }
  }
  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const inputs = this.otpInputs.toArray();

    if (event.key === 'Backspace') {

      if (this.otpDigits[index]) {
        this.otpDigits[index] = '';
        inputs[index].nativeElement.value = '';
      } else if (index > 0) {
        inputs[index - 1].nativeElement.focus();
        inputs[index - 1].nativeElement.value = '';
        this.otpDigits[index - 1] = '';
      }

      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputs[index - 1].nativeElement.focus();
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowRight' && index < inputs.length - 1) {
      inputs[index + 1].nativeElement.focus();
      event.preventDefault();
      return;
    }

    const allowed = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight'
    ];

    if (!/^\d$/.test(event.key) && !allowed.includes(event.key)) {
      event.preventDefault();
    }
  }
  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pasted =
      event.clipboardData?.getData('text')
        .replace(/\D/g, '')
        .slice(0, 6) ?? '';

    const inputs = this.otpInputs.toArray();

    this.otpDigits = ['', '', '', '', '', ''];

    for (let i = 0; i < 6; i++) {
      const digit = pasted[i] || '';

      this.otpDigits[i] = digit;

      if (inputs[i]) {
        inputs[i].nativeElement.value = digit;
      }
    }

    const focusIndex = Math.min(pasted.length, 5);

    if (inputs[focusIndex]) {
      inputs[focusIndex].nativeElement.focus();
    }
  }
  // ---- Form submit ----------------------------------------------------------

  async handleSubmit() {
    if (this.form.invalid) return;
    if (this.otpValue.length < 6) {
      this.otpError = 'Please enter all 6 digits';
      return;
    }

    this.loading = true;
    this.error = '';
    this.otpError = '';

    try {
      await this.http.post(
        `${environment.apiUrl}/api/auth/reset-password`,
        {
          email: this.email,
          otp: this.otpValue,
          newPassword: this.f['newPassword'].value
        }
      ).toPromise();
      this.success = true;
    } catch (err: any) {
      const msg = err?.error?.message || 'Something went wrong. Please try again.';
      // Route OTP-specific errors to the OTP field area
      if (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('code')) {
        this.otpError = msg;
      } else {
        this.error = msg;
      }
    } finally {
      this.loading = false;
    }
  }
}
