import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OnboardingService } from '../../services/onboarding.service';
import { environment } from '../../../environments/environment';

import { IntakeFormComponent } from './intake-form/intake-form.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ContractViewerComponent } from './contract-viewer/contract-viewer.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { BookingCalendarComponent } from './booking-calendar/booking-calendar.component';
import { CompletionScreenComponent } from './completion-screen/completion-screen.component';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="background: var(--bg-card); border-bottom: 1px solid var(--border); padding: 20px 32px; margin-bottom: 0;">
      <div style="display: flex; align-items: center; max-width: 600px; margin: 0 auto;">
        <ng-container *ngFor="let step of steps; let i = index; let last = last">
          <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex-shrink:0;">
            <div [style.width]="'34px'" [style.height]="'34px'" [style.borderRadius]="'50%'" [style.display]="'flex'" [style.alignItems]="'center'" [style.justifyContent]="'center'" [style.fontWeight]="'700'" [style.fontSize]="'13px'" [style.transition]="'all 0.3s'"
                 [style.background]="i < currentIdx ? 'var(--success)' : i === currentIdx ? 'var(--brand)' : 'var(--bg-surface)'"
                 [style.color]="i <= currentIdx ? '#fff' : 'var(--text-muted)'"
                 [style.border]="i < currentIdx ? '2px solid var(--success)' : i === currentIdx ? '2px solid var(--brand)' : '2px solid var(--border)'"
                 [style.boxShadow]="i === currentIdx ? '0 0 0 4px rgba(37,99,235,0.12)' : 'none'">
              {{ i < currentIdx ? '✓' : i + 1 }}
            </div>
            <span [style.fontSize]="'11px'" [style.fontWeight]="i === currentIdx ? '600' : '500'"
                  [style.color]="i < currentIdx ? 'var(--success)' : i === currentIdx ? 'var(--brand)' : 'var(--text-muted)'"
                  style="white-space:nowrap">
              {{ step.label }}
            </span>
          </div>

          <div *ngIf="!last" style="flex:1; height:2px; margin:0 4px; margin-bottom:18px; transition:background 0.3s"
               [style.background]="i < currentIdx ? 'var(--success)' : 'var(--border)'">
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class ProgressBarComponent {
  // @Input() bindings will be mapped manually below since Angular 19 signals could be used, but standard inputs are fine for rendering context
  @Input() currentIdx = 0;
  @Input() steps: any[] = [];
  @Input() brandColor = '#2563EB';
}

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [
    CommonModule, ProgressBarComponent,
    IntakeFormComponent, FileUploadComponent, ContractViewerComponent,
    PaymentFormComponent, BookingCalendarComponent, CompletionScreenComponent
  ],
  template: `
    <div *ngIf="onboarding.isLoading()" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-xl font-semibold text-gray-500 animate-pulse">Loading Pipeline Profile...</div>
    </div>
    
    <div *ngIf="onboarding.error()" class="min-h-screen flex items-center justify-center bg-red-50 p-8">
      <div class="bg-white border rounded shadow p-6 text-red-600 max-w-lg text-center font-medium">{{ onboarding.error() }}</div>
    </div>

    <div *ngIf="!onboarding.isLoading() && !onboarding.error() && sessionData" class="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header style="background:var(--bg-card); border-bottom:1px solid var(--border); padding:0 32px; height:64px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:10; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:36px; height:36px; border-radius:8px; overflow:hidden; flex-shrink:0; border:1px solid var(--border); background:var(--bg-surface);">
            <img *ngIf="agency?.logoUrl" [src]="agency?.logoUrl" alt="Logo" style="width:100%; height:100%; object-fit:contain;" />
            <div *ngIf="!agency?.logoUrl" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#2563EB; font-weight:700; font-size:14px; background:#EFF6FF;">
              {{ (agency?.name || 'A').charAt(0).toUpperCase() }}
            </div>
          </div>
          <div>
            <div style="font-weight:600; font-size:14px; color:var(--text-primary);">{{ agency?.name || 'Agency' }} Onboarding</div>
            <div style="font-size:12px; color:var(--text-muted);">Secure client portal</div>
          </div>
        </div>

        <div style="font-size:13px; color:var(--text-secondary); font-weight:500; background:var(--bg-surface); padding:6px 14px; border-radius:20px; border:1px solid var(--border);">
          👋 {{ formatName(clientName) }}
        </div>
      </header>

      <main class="flex-1 w-full mx-auto p-4 md:p-8" [style.maxWidth]="showWelcome ? '600px' : '900px'">
        <app-progress-bar *ngIf="!showWelcome && sessionData.currentStep !== 'complete'" [currentIdx]="currentIndex" [steps]="steps" [brandColor]="agency?.brandColor || '#2563EB'"></app-progress-bar>
        
        <div class="bg-white shadow-sm border border-gray-200 rounded-xl min-h-[400px] p-6 lg:p-10 text-gray-800">
          
          <div *ngIf="showWelcome" style="max-width:540px; margin:40px auto; text-align:center;">
            <img *ngIf="agency?.logoUrl" [src]="agency?.logoUrl" alt="Logo" class="h-16 object-contain mx-auto mb-6" />
            <h1 style="font-size:28px; font-weight:700; margin-bottom:12px;">Welcome, {{ formatName(clientName) }}! 👋</h1>
            <p style="font-size:16px; color:var(--text-secondary); line-height:1.6; margin-bottom:32px;">
              We're excited to start working with you. This will take about 5–10 minutes. Here's what we'll cover:
            </p>
            <div style="text-align:left; margin-bottom:32px;">
              <div *ngFor="let step of stepsInfo; let i = index; let last = last" style="display:flex; align-items:center; gap:14px; padding:12px 0;" [style.borderBottom]="!last ? '1px solid var(--border)' : 'none'">
                <div style="width:28px; height:28px; border-radius:50%; flex-shrink:0; background:var(--bg-surface); border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:var(--text-muted);">
                  {{ i + 1 }}
                </div>
                <div>
                  <div style="font-weight:600; font-size:14px; color:var(--text-primary);">{{ step.label }}</div>
                  <div style="font-size:12px; color:var(--text-muted);">{{ step.desc }}</div>
                </div>
              </div>
            </div>
            <button (click)="startOnboarding()" class="btn-primary" style="padding:14px 32px; font-size:16px; width:100%; max-width:300px;">
              Let's Begin →
            </button>
          </div>

          <div *ngIf="!showWelcome">
            <app-intake-form *ngIf="sessionData.currentStep === 'intake'"></app-intake-form>
            <app-file-upload *ngIf="sessionData.currentStep === 'files'"></app-file-upload>
            <app-contract-viewer *ngIf="sessionData.currentStep === 'contract'"></app-contract-viewer>
            <app-payment-form *ngIf="sessionData.currentStep === 'payment'"></app-payment-form>
            <app-booking-calendar *ngIf="sessionData.currentStep === 'booking'"></app-booking-calendar>
            <app-completion-screen *ngIf="sessionData.currentStep === 'complete'"></app-completion-screen>
          </div>

        </div>
      </main>
    </div>
  `
})
export class ClientPortalComponent implements OnInit {
  onboarding = inject(OnboardingService);
  route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  showWelcome = false;
  steps = [
    { id: 'intake', label: 'Brand Info' },
    { id: 'files', label: 'Files' },
    { id: 'contract', label: 'Contract' },
    { id: 'payment', label: 'Payment' },
    { id: 'booking', label: 'Booking' }
  ];

  stepsInfo = [
    { label: 'Brand information', desc: 'Tell us about your business' },
    { label: 'Upload your files', desc: 'Logos, brand guides, references' },
    { label: 'Sign the agreement', desc: 'Review and e-sign the contract' },
    { label: 'Pay your deposit', desc: 'Secure your project slot' },
    { label: 'Book your kickoff call', desc: 'Pick a time to meet the team' },
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const token = params.get('token');
      if (token) this.fetchSession(token);
    });
  }

  async fetchSession(token: string) {
    this.onboarding.setLoading(true);
    this.onboarding.setError(null);
    try {
      const data = await this.http.get<any>(`${environment.apiUrl}/api/onboarding/${token}`).toPromise();
      this.onboarding.setSessionConfig({ ...data, token });
      if (data.currentStep === 'intake') {
        this.showWelcome = true;
      }
    } catch (err: any) {
      if (err?.status === 404 || err?.status === 400) {
        this.onboarding.setError('Invalid or expired link. Please ask your agency for a new link.');
      } else {
        this.onboarding.setError('Network Error: Could not connect to the onboarding API.');
      }
    } finally {
      this.onboarding.setLoading(false);
    }
  }

  get sessionData() {
    return Object.keys(this.onboarding.sessionData()).length ? this.onboarding.sessionData() : null;
  }

  get clientName() {
    return this.sessionData?.clientName || '';
  }

  get agency() {
    return this.sessionData?.agency;
  }

  get currentIndex() {
    return this.steps.findIndex(s => s.id === this.sessionData?.currentStep);
  }

  startOnboarding() {
    this.showWelcome = false;
  }

  formatName(name: string): string {
    if (!name) return 'Client';
    const first = name.split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
}
