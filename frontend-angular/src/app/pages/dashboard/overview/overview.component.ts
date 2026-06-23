import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Plus, Copy, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, DatePipe],
  template: `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px;">
        <div>
          <h1 style="font-size:22px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">Client Overview</h1>
          <p style="font-size:14px; color:var(--text-muted);">
            {{ todayDate | date:'fullDate' }}
          </p>
        </div>
        <button 
          id="new-client-btn"
          (click)="openModal()"
          class="btn-primary" 
          style="display:flex; align-items:center; gap:6px;"
        >
          <span style="font-size:18px; line-height:1;">+</span> New Client
        </button>
      </div>

      <!-- Stats cards -->
      <div class="flex flex-col md:flex-row gap-6 mb-8">
        <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px 24px; flex:1; border-top:3px solid #2563EB;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <span style="font-size:13px; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em;">Total Clients</span>
            <span style="font-size:18px;">👥</span>
          </div>
          <div style="font-size:36px; font-weight:700; color:var(--text-primary); line-height:1;">{{ sessions.length }}</div>
        </div>

        <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px 24px; flex:1; border-top:3px solid #D97706;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <span style="font-size:13px; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em;">In Progress</span>
            <span style="font-size:18px;">⏳</span>
          </div>
          <div style="font-size:36px; font-weight:700; color:var(--text-primary); line-height:1;">{{ getInProgressCount() }}</div>
        </div>

        <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px 24px; flex:1; border-top:3px solid #16A34A;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <span style="font-size:13px; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em;">Complete</span>
            <span style="font-size:18px;">✅</span>
          </div>
          <div style="font-size:36px; font-weight:700; color:var(--text-primary); line-height:1;">{{ getCompleteCount() }}</div>
        </div>
      </div>

      <!-- Client list -->
      <div>
        <div *ngIf="sessions.length === 0" class="empty-state bg-white border border-gray-200 rounded-xl max-w-2xl mx-auto">
          <div class="icon">📋</div>
          <h3>No clients yet</h3>
          <p>Generate your first magic link to start onboarding a client.</p>
          <button (click)="openModal()" class="btn-primary mx-auto mt-4">
            <lucide-icon name="Plus" [size]="18"></lucide-icon> New Client
          </button>
        </div>

        <div *ngIf="sessions.length > 0">
          <div *ngFor="let s of sessions"
            style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; cursor: pointer; transition: all 0.15s;"
            (click)="goToClient(s.id)"
            (mouseenter)="onRowHover($event, true)"
            (mouseleave)="onRowHover($event, false)"
          >
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:40px; height:40px; border-radius:50%; background:var(--brand-light); color:var(--brand); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0;">
                {{ getInitial(s.clientName) }}
              </div>
              <div>
                <div style="font-weight:600; font-size:15px; color:var(--text-primary); margin-bottom:2px;">
                  {{ formatName(s.clientName) }}
                </div>
                <div style="font-size:13px; color:var(--text-muted);">{{ s.clientEmail }}</div>
                <div style="display:flex; gap:12px; margin-top:4px;">
                  <span style="font-size:12px; color:var(--text-muted);">📋 {{ s.templateName }}</span>
                  <span style="font-size:12px; color:var(--text-muted);">🕐 Expires {{ s.expiresAt | date:'shortDate' }}</span>
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <span class="badge" [ngClass]="s.currentStep === 'complete' ? 'badge-complete' : 'badge-in-progress'">
                {{ s.currentStep === 'complete' ? '✓ Complete' : '● ' + s.currentStep.toUpperCase() }}
              </span>
              <span style="color:var(--text-muted); font-size:18px;">›</span>
            </div>
          </div>
        </div>
      </div>

      <!-- New Client Modal -->
      <div *ngIf="isModalOpen" class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2 class="text-xl font-bold mb-4">Generate Magic Link</h2>
          
          <!-- Success state -->
          <div *ngIf="generatedLink">
            <div class="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <p class="text-green-800 font-semibold mb-2">Link Created Successfully!</p>
              <div class="flex items-center gap-2 bg-white border rounded p-2 mb-4">
                <input id="generated-link-input" type="text" readonly [value]="generatedLink" class="flex-1 bg-transparent outline-none text-sm text-gray-600" />
                <button (click)="handleCopy()" class="text-gray-500 hover:text-blue-600">
                  <lucide-icon *ngIf="!copied" name="Copy" [size]="20"></lucide-icon>
                  <lucide-icon *ngIf="copied" name="CheckCircle" class="text-green-500" [size]="20"></lucide-icon>
                </button>
              </div>
              <button (click)="closeModal()" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">Close</button>
            </div>
          </div>

          <!-- Form state -->
          <form *ngIf="!generatedLink" [formGroup]="clientForm" (ngSubmit)="handleCreate()" class="space-y-4 text-left">
            <div>
              <label>Template</label>
              <select id="client-template-select" formControlName="templateId">
                <option *ngFor="let t of templates" [value]="t.id">{{ t.name }}</option>
              </select>
            </div>

            <div>
              <label>Client Name</label>
              <input
                id="client-name-input"
                type="text"
                formControlName="clientName"
                maxlength="100"
                placeholder="e.g. John Smith"
              />
              <div *ngIf="cf['clientName'].touched && cf['clientName'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="cf['clientName'].errors?.['required']">Client name is required</span>
                <span *ngIf="cf['clientName'].errors?.['maxlength']">Name must be 100 characters or fewer</span>
              </div>
            </div>

            <div>
              <label>Client Email</label>
              <input
                id="client-email-input"
                type="email"
                formControlName="clientEmail"
                maxlength="100"
                placeholder="john@example.com"
              />
              <div *ngIf="cf['clientEmail'].touched && cf['clientEmail'].errors" class="mt-1 text-red-500 text-xs font-medium">
                <span *ngIf="cf['clientEmail'].errors?.['required']">Email is required</span>
                <span *ngIf="cf['clientEmail'].errors?.['email']">Please enter a valid email address</span>
                <span *ngIf="cf['clientEmail'].errors?.['maxlength']">Email must be 100 characters or fewer</span>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-8">
              <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-600 font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                id="generate-link-btn"
                type="submit"
                [disabled]="templates.length === 0 || loading || clientForm.invalid"
                class="btn-primary"
                [class.btn-loading]="loading"
                [class.opacity-50]="loading || templates.length === 0 || clientForm.invalid"
              >
                {{ loading ? 'Generating...' : 'Generate Link' }}
              </button>
            </div>
            <p *ngIf="templates.length === 0" class="text-red-500 text-sm mt-2">Please create a Template first.</p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class OverviewComponent implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  sessions: any[] = [];
  templates: any[] = [];
  
  isModalOpen = false;
  generatedLink = '';
  copied = false;
  loading = false;
  todayDate = new Date();

  // Reactive form for new client modal
  clientForm = this.fb.nonNullable.group({
    templateId: ['', Validators.required],
    clientName: ['', [Validators.required, Validators.maxLength(100)]],
    clientEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]]
  });

  get cf() { return this.clientForm.controls; }

  readonly Plus = Plus;
  readonly Copy = Copy;
  readonly CheckCircle = CheckCircle;

  ngOnInit() {
    this.fetchData();
  }

  async fetchData() {
    try {
      const [sessions, templates] = await Promise.all([
        this.http.get<any[]>(`${environment.apiUrl}/api/onboarding/sessions`).toPromise(),
        this.http.get<any[]>(`${environment.apiUrl}/api/templates`).toPromise()
      ]);

      this.sessions = sessions || [];
      this.templates = templates || [];
      if (this.templates.length > 0) {
        this.clientForm.patchValue({ templateId: this.templates[0].id });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async handleCreate() {
    if (this.clientForm.invalid) return;
    this.loading = true;
    
    try {
      const formVal = this.clientForm.value;
      const data = await this.http.post<any>(`${environment.apiUrl}/api/onboarding/session`, {
        templateId: Number(formVal.templateId),
        clientName: formVal.clientName,
        clientEmail: formVal.clientEmail
      }).toPromise();
      
      this.generatedLink = data.link;
      this.fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  handleCopy() {
    navigator.clipboard.writeText(this.generatedLink);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  openModal() {
    this.isModalOpen = true;
    this.generatedLink = '';
    this.clientForm.reset();
    if (this.templates.length > 0) {
      this.clientForm.patchValue({ templateId: this.templates[0].id });
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  goToClient(id: number) {
    this.router.navigate(['/dashboard/client', id]);
  }

  getInProgressCount(): number {
    return this.sessions.filter(s => s.currentStep !== 'complete').length;
  }

  getCompleteCount(): number {
    return this.sessions.filter(s => s.currentStep === 'complete').length;
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  formatName(name: string): string {
    const n = name || 'Unnamed Client';
    return n.charAt(0).toUpperCase() + n.slice(1);
  }

  onRowHover(e: any, isHovering: boolean) {
    const el = e.currentTarget;
    if (isHovering) {
      el.style.borderColor = '#93C5FD';
      el.style.boxShadow = '0 4px 16px rgba(37,99,235,0.08)';
      el.style.transform = 'translateY(-1px)';
    } else {
      el.style.borderColor = 'var(--border)';
      el.style.boxShadow = 'none';
      el.style.transform = 'translateY(0)';
    }
  }
}
