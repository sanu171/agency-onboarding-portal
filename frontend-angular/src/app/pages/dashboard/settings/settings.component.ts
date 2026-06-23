import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Save } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Agency Brand Settings</h2>
        
        <form [formGroup]="form" (ngSubmit)="handleSave()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
            <input
              id="settings-name"
              type="text"
              formControlName="name"
              maxlength="100"
              class="w-full border border-gray-300 rounded-md p-2"
            />
            <div *ngIf="f['name'].touched && f['name'].errors" class="mt-1 text-red-500 text-xs font-medium">
              <span *ngIf="f['name'].errors?.['required']">Agency name is required</span>
              <span *ngIf="f['name'].errors?.['maxlength']">Must be 100 characters or fewer</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Brand Logo</label>
            <label class="logo-upload-zone">
              <div *ngIf="f['logoUrl'].value">
                <img [src]="f['logoUrl'].value" alt="Agency Logo" class="logo-preview mx-auto" />
              </div>
              <div *ngIf="!f['logoUrl'].value" class="upload-placeholder">
                <span class="block mb-2">📁</span>
                <p>Click to upload logo</p>
                <small>PNG, SVG, JPG — max 2MB</small>
              </div>
              <input type="file" accept="image/*" (change)="handleFile($event)" hidden />
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
            <div class="flex items-center gap-3 mb-3">
              <button *ngFor="let c of presetColors"
                type="button"
                (click)="form.patchValue({ brandColor: c })"
                [class]="'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ' + (f['brandColor'].value?.toLowerCase() === c ? 'border-gray-900 shadow-sm' : 'border-transparent')"
                [style.backgroundColor]="c"
              ></button>
            </div>
            <div class="flex items-center gap-4">
              <input type="color" class="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer" formControlName="brandColor" />
              <input type="text" class="w-32 border border-gray-300 rounded-md p-2 font-mono text-center" formControlName="brandColor" placeholder="#2563eb" maxlength="20" />
            </div>
          </div>

          <div class="pt-4 border-t">
            <button type="submit" [disabled]="loading || form.invalid" class="btn-primary" [class.btn-loading]="loading">
              <lucide-icon name="Save" [size]="18"></lucide-icon> Save Changes
            </button>
          </div>
        </form>
      </div>

      <div class="pl-6 border-l" style="min-width: 0;">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Live preview</span>
          </div>
          
          <div class="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button type="button" (click)="previewTab = 'welcome'" [class]="'px-3 py-1.5 text-xs font-semibold rounded ' + (previewTab === 'welcome' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')">Welcome</button>
            <button type="button" (click)="previewTab = 'form'" [class]="'px-3 py-1.5 text-xs font-semibold rounded ' + (previewTab === 'form' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')">Form step</button>
            <button type="button" (click)="previewTab = 'complete'" [class]="'px-3 py-1.5 text-xs font-semibold rounded ' + (previewTab === 'complete' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')">Complete</button>
          </div>
        </div>

        <div class="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white w-full">
          <div class="flex items-center gap-3 p-4 border-b" [style.borderTopWidth]="'4px'" [style.borderTopStyle]="'solid'" [style.borderTopColor]="f['brandColor'].value || '#2563eb'">
            <img *ngIf="f['logoUrl'].value" [src]="f['logoUrl'].value" alt="Logo" class="h-6 object-contain max-w-[120px]" />
            <div *ngIf="!f['logoUrl'].value" class="h-6 w-6 bg-gray-100 rounded flex items-center justify-center font-bold text-xs" [style.color]="f['brandColor'].value || '#2563eb'">
              {{ (f['name'].value || '?').charAt(0).toUpperCase() }}
            </div>
            <span class="font-semibold text-gray-800 text-sm truncate">{{ f['name'].value || 'Agency Name' }} Onboarding</span>
          </div>
          
          <div class="p-8 pb-10 bg-[#F8FAFC] min-h-[360px] flex flex-col justify-center">
            <div *ngIf="previewTab === 'welcome'" class="text-center">
              <h2 class="text-xl font-bold text-gray-900 mb-2">Welcome, Client Name! 👋</h2>
              <p class="text-gray-500 text-sm mb-8">Let's get your project started.</p>
              <div class="flex items-center gap-2 mb-8 justify-center">
                <span class="h-2 w-12 rounded-full" [style.background]="f['brandColor'].value || '#2563eb'"></span>
                <span class="h-2 w-12 rounded-full bg-gray-200"></span>
                <span class="h-2 w-12 rounded-full bg-gray-200"></span>
              </div>
              <button type="button" class="w-full py-3 rounded-lg text-white font-semibold text-sm shadow-sm transition-opacity hover:opacity-90" [style.background]="f['brandColor'].value || '#2563eb'">
                Let's Begin →
              </button>
            </div>

            <div *ngIf="previewTab === 'form'" class="text-left">
              <div class="flex items-center gap-2 mb-6 justify-center">
                <span class="h-2 w-12 rounded-full bg-gray-200"></span>
                <span class="h-2 w-12 rounded-full" [style.background]="f['brandColor'].value || '#2563eb'"></span>
                <span class="h-2 w-12 rounded-full bg-gray-200"></span>
              </div>
              <h2 class="text-lg font-bold text-gray-800 mb-4">Step 2: Brand Intake</h2>
              <div class="space-y-4">
                <div><div class="h-3 w-24 bg-gray-300 rounded mb-2"></div><div class="h-10 bg-white border border-gray-200 rounded"></div></div>
                <div><div class="h-3 w-32 bg-gray-300 rounded mb-2"></div><div class="h-20 bg-white border border-gray-200 rounded"></div></div>
                <div class="pt-4 border-t flex justify-end">
                  <button type="button" class="px-6 py-2 rounded-lg text-white font-semibold text-sm shadow-sm" [style.background]="f['brandColor'].value || '#2563eb'">Save & Continue</button>
                </div>
              </div>
            </div>

            <div *ngIf="previewTab === 'complete'" class="text-center">
              <div class="text-5xl mb-6 inline-block animate-bounce">🎉</div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p class="text-gray-500 text-sm mb-6">We have everything we need to begin.</p>
              <div class="text-left bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3 mx-auto max-w-sm">
                <div class="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <span class="flex items-center justify-center w-5 h-5 rounded-full text-white text-xs" [style.background]="f['brandColor'].value || '#2563eb'">✓</span> Brand information received
                </div>
                <div class="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <span class="flex items-center justify-center w-5 h-5 rounded-full text-white text-xs" [style.background]="f['brandColor'].value || '#2563eb'">✓</span> Files uploaded
                </div>
                <div class="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <span class="flex items-center justify-center w-5 h-5 rounded-full text-white text-xs" [style.background]="f['brandColor'].value || '#2563eb'">✓</span> Contract signed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  auth = inject(AuthService);
  toast = inject(ToastService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    logoUrl: [''],
    brandColor: ['#2563eb']
  });

  get f() { return this.form.controls; }

  loading = false;
  previewTab = 'welcome';
  presetColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c'];

  ngOnInit() {
    this.fetchProfile();
  }

  async fetchProfile() {
    try {
      const data = await this.http.get<any>(`${environment.apiUrl}/api/auth/me`).toPromise();
      if (data) {
        this.form.patchValue({
          name: data.agencyName || '',
          logoUrl: data.logoUrl || '',
          brandColor: data.brandColor || '#2563eb'
        });
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  }

  handleFile(e: any) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  async handleSave() {
    if (this.form.invalid) return;
    this.loading = true;
    const user = this.auth.user();
    
    try {
      await this.http.put(`${environment.apiUrl}/api/auth/me`, this.form.value).toPromise();
      this.toast.add('Profile updated successfully!', 'success');
      if (user) {
        const updatedUser = { ...user, agencyName: this.f['name'].value };
        this.auth.login(updatedUser);
      }
    } catch (err) {
      this.toast.add('Failed to update profile.', 'error');
    } finally {
      this.loading = false;
    }
  }
}
