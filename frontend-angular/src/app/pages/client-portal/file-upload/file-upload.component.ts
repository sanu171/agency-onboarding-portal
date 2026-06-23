import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OnboardingService } from '../../../services/onboarding.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, File as FileIcon, X } from 'lucide-angular';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Step 2: File Uploads</h2>
      <p class="text-gray-600 mb-6">Please upload any requested documents or assets.</p>
      
      <div 
        (dragover)="handleDragOver($event)"
        (drop)="handleDrop($event)"
        [ngStyle]="dropzoneStyle"
        (mouseenter)="isHovering = true"
        (mouseleave)="isHovering = false"
      >
        <div style="font-size:40px; margin-bottom:12px;">📁</div>
        <div style="font-weight:600; font-size:15px; margin-bottom:6px;">Drag and drop your files here</div>
        <div style="color:var(--text-muted); font-size:13px; margin-bottom:20px;">
          Logos, brand guides, reference images — PNG, SVG, PDF, JPG up to 50MB
        </div>
        <label class="btn-secondary" style="display:inline-flex; gap:6px;">
          📂 Browse Files
          <input type="file" multiple class="hidden" (change)="handleFileSelect($event)" />
        </label>
      </div>

      <div *ngIf="files.length > 0" class="mt-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Selected Files</h3>
        <ul class="space-y-2">
          <li *ngFor="let file of files; let i = index" class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded shadow-sm">
            <div class="flex items-center gap-3 overflow-hidden">
              <lucide-icon name="FileIcon" class="text-gray-400 flex-shrink-0" [size]="20"></lucide-icon>
              <span class="truncate text-sm font-medium text-gray-700">{{ file.name }}</span>
            </div>
            <button (click)="removeFile(i)" class="text-red-500 hover:text-red-700 p-1">
              <lucide-icon name="X" [size]="18"></lucide-icon>
            </button>
          </li>
        </ul>
      </div>
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
        <button (click)="handleSkip()" style="background:none; border:none; color:var(--text-muted); font-size:13px; cursor:pointer; text-decoration:underline;">
          Skip this step
        </button>
        <button
          (click)="handleSubmit()"
          [disabled]="uploading || files.length === 0"
          class="btn-primary"
          [class.btn-loading]="uploading"
          [style.padding]="'12px 28px'"
        >
          {{ uploading ? 'Uploading...' : 'Save & Continue →' }}
        </button>
      </div>
    </div>
  `
})
export class FileUploadComponent {
  onboarding = inject(OnboardingService);
  private http = inject(HttpClient);
  
  files: File[] = [];
  uploading = false;
  isHovering = false;

  get dropzoneStyle() {
    return {
      border: '2px dashed var(--border-strong)',
      borderRadius: 'var(--radius-lg)',
      padding: '48px 32px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: this.isHovering ? 'var(--brand-light)' : 'var(--bg-surface)',
      borderColor: this.isHovering ? 'var(--brand)' : 'var(--border-strong)'
    };
  }

  handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  handleDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      this.files = [...this.files, ...droppedFiles];
    }
    this.isHovering = false;
  }

  handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      const selectedFiles = Array.from(target.files);
      this.files = [...this.files, ...selectedFiles];
    }
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
  }

  async handleSubmit() {
    if (this.files.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    this.uploading = true;
    const formData = new FormData();
    this.files.forEach(file => formData.append('files', file));

    try {
      const token = this.onboarding.sessionData().token;
      // Note: do NOT set Content-Type header — HttpClient sets it with boundary automatically for FormData
      const data = await this.http.post<any>(
        `${environment.apiUrl}/api/onboarding/${token}/files`,
        formData
      ).toPromise();
      if (data?.nextStep) {
        this.onboarding.updateStep(data.nextStep);
      }
    } catch (err: any) {
      alert(err?.error?.message || err?.message || 'Upload failed');
    } finally {
      this.uploading = false;
    }
  }

  async handleSkip() {
    const token = this.onboarding.sessionData().token;
    try {
      const data = await this.http.post<any>(
        `${environment.apiUrl}/api/onboarding/${token}/files/skip`, {}
      ).toPromise();
      if (data?.nextStep) {
        this.onboarding.updateStep(data.nextStep);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
