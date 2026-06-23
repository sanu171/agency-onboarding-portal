import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">My Templates</h2>
        <button 
          id="new-template-btn"
          (click)="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2 hover:bg-blue-700"
        >
          <lucide-icon name="Plus" [size]="20"></lucide-icon> New Template
        </button>
      </div>

      <div>
        <div *ngIf="templates.length === 0" class="p-6 text-center text-gray-500">No templates found. Create one to get started!</div>
        
        <div *ngFor="let tpl of templates" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight:600; font-size:16px; margin-bottom:10px;">{{ tpl.name }}</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <span *ngFor="let step of steps" 
                [style.padding]="'3px 10px'" 
                [style.borderRadius]="'20px'" 
                [style.fontSize]="'12px'" 
                [style.fontWeight]="'600'" 
                [style.background]="getReq(tpl, step.prop) ? 'var(--success-light)' : '#F1F5F9'" 
                [style.color]="getReq(tpl, step.prop) ? 'var(--success)' : 'var(--text-muted)'" 
                [style.border]="'1px solid ' + (getReq(tpl, step.prop) ? 'var(--success-border)' : 'var(--border)')" 
              >
                {{ getReq(tpl, step.prop) ? '✓' : '○' }} {{ step.label }}
              </span>
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button id="edit-template-{{tpl.id}}" (click)="openModal(tpl)" class="btn-secondary" style="padding:8px 16px; font-size:13px;">Edit</button>
            <button (click)="handleDelete(tpl.id)" style="padding:8px 16px; font-size:13px; background:var(--danger-light); color:var(--danger); border:1px solid #FECACA; border-radius:var(--radius-md); font-weight:600;">Delete</button>
          </div>
        </div>
      </div>

      <!-- Template Modal -->
      <div *ngIf="isModalOpen" class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingId ? 'Edit Template' : 'Create Template' }}</h2>
          <form [formGroup]="templateForm" (ngSubmit)="handleSubmit()" class="space-y-4 text-left">
            
            <!-- Template Name -->
            <div>
              <label>Template Name</label>
              <input
                id="template-name"
                type="text"
                formControlName="name"
                maxlength="100"
                placeholder="e.g. Website Redesign"
              />
              <div *ngIf="tf['name'].touched && tf['name'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="tf['name'].errors?.['required']">Template name is required</span>
                <span *ngIf="tf['name'].errors?.['maxlength']">Name must be 100 characters or fewer</span>
              </div>
            </div>
            
            <!-- Step checkboxes -->
            <div class="checkbox-group">
              <label class="checkbox-item" [class.checked]="tf['requireIntake'].value">
                <input type="checkbox" class="hidden" formControlName="requireIntake" />
                Intake Form
              </label>
              <label class="checkbox-item" [class.checked]="tf['requireFileUpload'].value">
                <input type="checkbox" class="hidden" formControlName="requireFileUpload" />
                File Uploads
              </label>
              <label class="checkbox-item" [class.checked]="tf['requireContract'].value">
                <input type="checkbox" class="hidden" formControlName="requireContract" />
                Contract
              </label>
              <label class="checkbox-item" [class.checked]="tf['requirePayment'].value">
                <input type="checkbox" class="hidden" formControlName="requirePayment" />
                Payment
              </label>
              <label class="checkbox-item" [class.checked]="tf['requireBooking'].value">
                <input type="checkbox" class="hidden" formControlName="requireBooking" />
                Booking
              </label>
            </div>

            <!-- Payment Amount — shown only when Payment is enabled -->
            <div *ngIf="tf['requirePayment'].value">
              <label>Payment Amount ($)</label>
              <input
                id="template-payment-amount"
                type="number"
                formControlName="paymentAmount"
                placeholder="Enter amount"
                step="0.01"
              />
              <div *ngIf="tf['paymentAmount'].touched && tf['paymentAmount'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="tf['paymentAmount'].errors?.['required']">Payment amount is required</span>
                <span *ngIf="tf['paymentAmount'].errors?.['min']">Amount must be greater than 0</span>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-8">
              <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-600 font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                id="save-template-btn"
                type="submit"
                [disabled]="loading || templateForm.invalid"
                class="btn-primary"
                [class.btn-loading]="loading"
                [class.opacity-50]="loading || templateForm.invalid"
              >
                {{ loading ? 'Saving...' : 'Save Template' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TemplatesComponent implements OnInit {
  auth = inject(AuthService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  
  templates: any[] = [];
  isModalOpen = false;
  editingId: number | null = null;
  loading = false;

  // Reactive form for template creation/editing
  templateForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    requireIntake: [true],
    requireFileUpload: [true],
    requireContract: [true],
    requirePayment: [true],
    requireBooking: [true],
    // null default = no pre-filled 0; required + min when payment is enabled
    paymentAmount: [null as number | null, [Validators.required, Validators.min(0.01)]]
  });

  get tf() { return this.templateForm.controls; }

  steps = [
    { label: 'Intake', prop: 'requireIntake' },
    { label: 'Files', prop: 'requireFileUpload' },
    { label: 'Contract', prop: 'requireContract' },
    { label: 'Payment', prop: 'requirePayment' },
    { label: 'Booking', prop: 'requireBooking' }
  ];

  ngOnInit() {
    this.fetchTemplates();

    // Dynamically toggle validation on paymentAmount based on requirePayment
    this.tf['requirePayment'].valueChanges.subscribe((required: boolean) => {
      const amountCtrl = this.tf['paymentAmount'];
      if (required) {
        amountCtrl.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        amountCtrl.clearValidators();
        amountCtrl.setValue(null);
      }
      amountCtrl.updateValueAndValidity();
    });
  }

  async fetchTemplates() {
    const user = this.auth.user();
    if (!user) return;
    try {
      const data = await this.http.get<any[]>(`${environment.apiUrl}/api/templates`).toPromise();
      this.templates = data || [];
    } catch (e) {
      console.error('Failed to fetch templates', e);
    }
  }

  async handleSubmit() {
    if (this.templateForm.invalid) return;
    this.loading = true;

    const payload = { ...this.templateForm.value };
    // If payment not required, ensure amount is null/0
    if (!payload.requirePayment) {
      payload.paymentAmount = 0;
    }

    const url = this.editingId 
      ? `${environment.apiUrl}/api/templates/${this.editingId}`
      : `${environment.apiUrl}/api/templates`;
      
    try {
      await this.http.request(this.editingId ? 'put' : 'post', url, { body: payload }).toPromise();
      this.isModalOpen = false;
      this.editingId = null;
      this.fetchTemplates();
    } catch (e) {
      console.error('Failed to save template', e);
    } finally {
      this.loading = false;
    }
  }

  async handleDelete(id: number) {
    if (!confirm('Are you sure?')) return;
    try {
      await this.http.delete(`${environment.apiUrl}/api/templates/${id}`).toPromise();
      this.fetchTemplates();
    } catch (e) {
      console.error('Failed to delete template', e);
    }
  }

  openModal(template: any = null) {
    if (template) {
      this.editingId = template.id;
      this.templateForm.patchValue({
        name: template.name,
        requireIntake: template.requireIntake,
        requireFileUpload: template.requireFileUpload,
        requireContract: template.requireContract,
        requirePayment: template.requirePayment,
        requireBooking: template.requireBooking,
        paymentAmount: template.paymentAmount || null
      });
    } else {
      this.editingId = null;
      this.templateForm.reset({
        name: '',
        requireIntake: true,
        requireFileUpload: true,
        requireContract: true,
        requirePayment: true,
        requireBooking: true,
        paymentAmount: null
      });
    }
    // Reset validation state
    this.templateForm.markAsUntouched();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  getReq(tpl: any, prop: string): boolean {
    return !!tpl[prop];
  }
}
