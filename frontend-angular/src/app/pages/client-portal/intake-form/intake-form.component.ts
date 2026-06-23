import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OnboardingService } from '../../../services/onboarding.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-intake-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div
      [style.maxWidth]="'680px'"
      [style.margin]="'32px auto'"
      [style.background]="'var(--bg-card)'"
      [style.borderRadius]="'var(--radius-lg)'"
      [style.border]="'1px solid var(--border)'"
      [style.borderTop]="'3px solid ' + agencyBrandColor"
      [style.boxShadow]="'var(--shadow-md)'"
      [style.overflow]="'hidden'"
    >
      <div [style.padding]="'32px 40px'">
        <h2 [style.fontSize]="'20px'" [style.fontWeight]="'700'" [style.marginBottom]="'6px'">Brand Intake Information</h2>
        <p [style.color]="'var(--text-muted)'" [style.fontSize]="'14px'" [style.marginBottom]="'28px'">
          Help us understand your business so we can deliver the best results.
        </p>
        
        <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="space-y-6">
          
          <!-- Business Name + Industry -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input
                id="intake-businessName"
                type="text"
                formControlName="businessName"
                maxlength="100"
                class="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div *ngIf="f['businessName'].touched && f['businessName'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="f['businessName'].errors?.['required']">Business name is required</span>
                <span *ngIf="f['businessName'].errors?.['maxlength']">Must be 100 characters or fewer</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
              <input
                id="intake-industry"
                type="text"
                formControlName="industry"
                maxlength="100"
                class="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div *ngIf="f['industry'].touched && f['industry'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="f['industry'].errors?.['required']">Industry is required</span>
                <span *ngIf="f['industry'].errors?.['maxlength']">Must be 100 characters or fewer</span>
              </div>
            </div>
          </div>

          <!-- Target Audience -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <textarea
              id="intake-targetAudience"
              rows="2"
              formControlName="targetAudience"
              maxlength="500"
              class="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Women 25-45, health-conscious professionals"
            ></textarea>
            <div *ngIf="f['targetAudience'].touched && f['targetAudience'].errors" class="mt-1 text-red-500 text-xs font-medium">
              <span *ngIf="f['targetAudience'].errors?.['maxlength']">Must be 500 characters or fewer</span>
            </div>
          </div>

          <!-- Brand Personality -->
          <div>
            <label>Brand Personality</label>
            <div class="personality-grid" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
              <button type="button" *ngFor="let p of personalities" 
                (click)="togglePersonality(p)"
                [style.background]="selectedPersonalities.includes(p) ? 'var(--brand-light)' : 'var(--bg-surface)'"
                [style.color]="selectedPersonalities.includes(p) ? 'var(--brand)' : 'var(--text-secondary)'"
                [style.border]="selectedPersonalities.includes(p) ? '1px solid var(--brand)' : '1px solid var(--border)'"
                style="padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; transition: all 0.2s;"
              >
                <span *ngIf="selectedPersonalities.includes(p)">✓ </span>{{ p }}
              </button>
            </div>
          </div>

          <!-- Brand Colors -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
            <div class="space-y-3 mb-2">
              <div *ngFor="let color of brandColors; let i = index" class="flex items-center gap-4">
                <input type="color" [(ngModel)]="color.hex" [name]="'colorHex' + i" class="w-12 h-10 p-1 rounded border cursor-pointer" />
                <input type="text" [(ngModel)]="color.hex" [name]="'colorText' + i" maxlength="10" class="w-24 border border-gray-300 rounded p-2 uppercase font-mono text-sm" />
                <button *ngIf="brandColors.length > 1" type="button" (click)="removeColor(i)" class="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
              </div>
            </div>
            <button type="button" (click)="addColor()" class="text-blue-600 hover:text-blue-800 text-sm font-medium">+ Add another color</button>
          </div>

          <!-- Competitors -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Competitors</label>
            <input
              id="intake-competitors"
              type="text"
              formControlName="competitors"
              maxlength="200"
              class="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Who are your main competitors?"
            />
            <div *ngIf="f['competitors'].touched && f['competitors'].errors" class="mt-1 text-red-500 text-xs font-medium">
              <span *ngIf="f['competitors'].errors?.['maxlength']">Must be 200 characters or fewer</span>
            </div>
          </div>

          <!-- Project Goals -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Goals *</label>
            <textarea
              id="intake-projectGoal"
              rows="3"
              formControlName="projectGoal"
              maxlength="1000"
              class="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What exactly do you want to achieve with this project? What does success look like?"
            ></textarea>
            <div *ngIf="f['projectGoal'].touched && f['projectGoal'].errors" class="mt-1 text-red-500 text-xs font-medium">
              <span *ngIf="f['projectGoal'].errors?.['required']">Project goals are required</span>
              <span *ngIf="f['projectGoal'].errors?.['maxlength']">Must be 1000 characters or fewer</span>
            </div>
          </div>

          <!-- Deadline -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deadline Expectations</label>
            <input
              id="intake-deadline"
              type="text"
              formControlName="deadline"
              maxlength="100"
              class="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Need it live before Christmas, or Flexible"
            />
            <div *ngIf="f['deadline'].touched && f['deadline'].errors" class="mt-1 text-red-500 text-xs font-medium">
              <span *ngIf="f['deadline'].errors?.['maxlength']">Must be 100 characters or fewer</span>
            </div>
          </div>

          <!-- Submit -->
          <div [style.paddingTop]="'24px'" [style.borderTop]="'1px solid var(--border)'" [style.display]="'flex'" [style.justifyContent]="'flex-end'">
            <button
              id="intake-submit"
              type="submit"
              [disabled]="loading || form.invalid"
              class="btn-primary"
              [class.btn-loading]="loading"
              [class.opacity-50]="loading || form.invalid"
              [style.padding]="'12px 28px'"
              [style.fontSize]="'15px'"
            >
              {{ loading ? 'Saving...' : 'Save & Continue →' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class IntakeFormComponent implements OnInit {
  onboarding = inject(OnboardingService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  // Reactive form for validation
  form = this.fb.nonNullable.group({
    businessName: ['', [Validators.required, Validators.maxLength(100)]],
    industry: ['', [Validators.required, Validators.maxLength(100)]],
    targetAudience: ['', Validators.maxLength(500)],
    competitors: ['', Validators.maxLength(200)],
    projectGoal: ['', [Validators.required, Validators.maxLength(1000)]],
    deadline: ['', Validators.maxLength(100)]
  });

  get f() { return this.form.controls; }

  // Brand personality (toggle-based, kept outside reactive form for simplicity)
  selectedPersonalities: string[] = [];
  personalities = ['Professional', 'Playful', 'Minimal', 'Bold', 'Friendly', 'Luxury', 'Tech-focused', 'Traditional'];

  // Brand colors (dynamic array, kept outside reactive form)
  brandColors: { name: string; hex: string }[] = [{ name: 'Primary', hex: '#000000' }];

  loading = false;

  ngOnInit() {}

  togglePersonality(p: string) {
    const idx = this.selectedPersonalities.indexOf(p);
    if (idx > -1) {
      this.selectedPersonalities.splice(idx, 1);
    } else {
      this.selectedPersonalities.push(p);
    }
  }

  addColor() {
    this.brandColors.push({ name: 'Secondary', hex: '#ffffff' });
  }

  removeColor(index: number) {
    this.brandColors.splice(index, 1);
  }

  async handleSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    // Combine reactive form values with dynamic fields
    const payload = {
      ...this.form.value,
      brandPersonality: this.selectedPersonalities,
      brandColors: this.brandColors
    };

    try {
      const token = this.onboarding.sessionData().token;
      const data = await this.http.post<any>(
        `${environment.apiUrl}/api/onboarding/${token}/intake`,
        { dataJson: JSON.stringify(payload, null, 2) }
      ).toPromise();

      if (data?.nextStep) {
        this.onboarding.updateStep(data.nextStep);
      }
    } catch (err: any) {
      alert(err?.error?.message || err?.message || 'Error submitting form');
    } finally {
      this.loading = false;
    }
  }

  get agencyBrandColor() {
    return this.onboarding.sessionData().agency?.brandColor || 'var(--brand)';
  }
}
