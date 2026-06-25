import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, ArrowLeft, Download, CheckCircle, Clock, Bell, Pencil, X, Check } from 'lucide-angular';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div *ngIf="!client && !isError" class="p-8">Loading...</div>
    <div *ngIf="isError" class="p-8 text-red-500 font-bold border rounded m-4 bg-red-50">Error fetching client detail. Check backend terminal for 500 / Serialization errors.</div>

    <div *ngIf="client && !isError">
      <div class="flex items-center gap-4 mb-6">
        <button (click)="goBack()" class="text-gray-500 hover:text-gray-900 bg-white border p-2 rounded-full shadow-sm hover:shadow">
          <lucide-icon name="ArrowLeft" [size]="20"></lucide-icon>
        </button>
        <div style="flex: 1;">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">

            <!-- Client Name — inline editable -->
            <span *ngIf="!isEditingName" id="client-name-display">{{ client.clientName }}</span>
            <input
              *ngIf="isEditingName"
              id="client-name-input"
              type="text"
              [(ngModel)]="editingNameValue"
              maxlength="100"
              class="border border-blue-400 rounded px-2 py-0.5 text-xl font-bold focus:ring-2 focus:ring-blue-200 outline-none"
              (keyup.enter)="saveEdit('name', editingNameValue)"
              (keyup.escape)="cancelEdit('name')"
              #nameInputEl
            />

            <!-- Pen icon (shown when not editing name) -->
            <button
              *ngIf="!isEditingName"
              id="edit-name-btn"
              (click)="startEdit('name')"
              title="Edit client name"
              aria-label="Edit client name"
              class="text-gray-400 hover:text-blue-500 transition-colors"
              style="background: none; border: none; padding: 2px; cursor: pointer; flex-shrink: 0;"
            >
              <lucide-icon name="Pencil" [size]="15"></lucide-icon>
            </button>

            <!-- Save / Cancel when editing name -->
            <span *ngIf="isEditingName" class="flex items-center gap-1 ml-1">
              <button
                id="save-name-btn"
                (click)="saveEdit('name', editingNameValue)"
                title="Save"
                class="text-green-600 hover:text-green-800 bg-green-50 border border-green-200 rounded p-1 transition-colors"
                style="border: none; background: none; padding: 2px; cursor: pointer;"
              >
                <lucide-icon name="Check" [size]="16"></lucide-icon>
              </button>
              <button
                id="cancel-name-btn"
                (click)="cancelEdit('name')"
                title="Cancel"
                class="text-gray-400 hover:text-red-500 transition-colors"
                style="border: none; background: none; padding: 2px; cursor: pointer;"
              >
                <lucide-icon name="X" [size]="16"></lucide-icon>
              </button>
            </span>

            <!-- Send Reminder -->
            <button *ngIf="client.currentStep !== 'complete'"
              (click)="handleSendReminder()"
              class="text-white bg-blue-600 hover:bg-blue-700 font-medium text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition shadow-sm"
            >
              <lucide-icon name="Bell" [size]="14"></lucide-icon> Send Reminder
            </button>
          </h2>

          <!-- Client Email — inline editable -->
          <div class="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span *ngIf="!isEditingEmail" id="client-email-display">{{ client.clientEmail }}</span>
            <input
              *ngIf="isEditingEmail"
              id="client-email-input"
              type="email"
              [(ngModel)]="editingEmailValue"
              maxlength="100"
              class="border border-blue-400 rounded px-2 py-0.5 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
              (keyup.enter)="saveEdit('email', editingEmailValue)"
              (keyup.escape)="cancelEdit('email')"
              #emailInputEl
            />

            <!-- Pen icon for email -->
            <button
              *ngIf="!isEditingEmail"
              id="edit-email-btn"
              (click)="startEdit('email')"
              title="Edit client email"
              aria-label="Edit client email"
              class="text-gray-300 hover:text-blue-400 transition-colors"
              style="background: none; border: none; padding: 1px; cursor: pointer;"
            >
              <lucide-icon name="Pencil" [size]="12"></lucide-icon>
            </button>

            <!-- Save / Cancel for email -->
            <span *ngIf="isEditingEmail" class="flex items-center gap-1">
              <button id="save-email-btn" (click)="saveEdit('email', editingEmailValue)" style="border: none; background: none; padding: 1px; cursor: pointer;" class="text-green-600 hover:text-green-800">
                <lucide-icon name="Check" [size]="14"></lucide-icon>
              </button>
              <button id="cancel-email-btn" (click)="cancelEdit('email')" style="border: none; background: none; padding: 1px; cursor: pointer;" class="text-gray-400 hover:text-red-500">
                <lucide-icon name="X" [size]="14"></lucide-icon>
              </button>
            </span>

            <span>• Status: <span class="uppercase text-blue-600 font-semibold">{{ client.currentStep }}</span></span>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg overflow-hidden border">
        <div class="flex border-b overflow-x-auto bg-gray-50">
          <button *ngFor="let t of tabs"
            (click)="activeTab = t.id"
            class="px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors"
            [ngClass]="activeTab === t.id ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'"
          >
            {{ t.label }}
          </button>
        </div>

        <div class="p-6 min-h-[400px]">
          <!-- Brand Tab -->
          <div *ngIf="activeTab === 'brand'">
            <h3 class="font-semibold text-lg mb-4 text-gray-800">Intake Form Responses</h3>
            <div *ngIf="client.intakeForm; else noIntake" [innerHTML]="renderedIntakeHtml" class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 border rounded-xl shadow-sm"></div>
            <ng-template #noIntake><p class="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">Intake form not submitted yet.</p></ng-template>
          </div>

          <!-- Files Tab -->
          <div *ngIf="activeTab === 'files'">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-lg text-gray-800">Uploaded Files</h3>
              <button *ngIf="client.uploadedFiles?.length > 0" (click)="downloadZipViaFetch()" class="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                <lucide-icon name="Download" [size]="16"></lucide-icon> Download All (ZIP)
              </button>
            </div>
            <ul *ngIf="client.uploadedFiles?.length > 0; else noFiles" class="divide-y border rounded shadow-sm">
              <li *ngFor="let f of client.uploadedFiles" class="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <span class="font-medium text-gray-700 font-mono text-sm">{{ f.fileName }}</span>
                <a [href]="apiUrl + f.filePath" target="_blank" rel="noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">View Raw</a>
              </li>
            </ul>
            <ng-template #noFiles><p class="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">No files uploaded yet.</p></ng-template>
          </div>

          <!-- Contract Tab -->
          <div *ngIf="activeTab === 'contract'">
            <h3 class="font-semibold text-lg mb-4 text-gray-800">Signed Contract</h3>
            <div *ngIf="client.contractSignature; else noContract" class="bg-green-50 border border-green-200 p-8 rounded text-center max-w-lg shadow-sm">
              <div class="flex justify-center mb-3"><lucide-icon name="CheckCircle" class="text-green-500" [size]="40"></lucide-icon></div>
              <p class="font-bold text-lg text-green-800 mb-1">Contract Signed</p>
              <div class="bg-white border rounded p-4 mt-4 text-left">
                <p class="text-sm text-gray-600 mb-2">Signature applied by:</p>
                <p class="font-mono text-lg text-gray-800 border-b border-gray-200 inline-block pb-1 pr-8">{{ client.contractSignature.signatureDataUrl || client.contractSignature.signatureDataUrl || client.contractSignature.SignatureDataUrl || client.contractSignature.signatureDataURL }}</p>
                <div class="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div><strong>IP Address:</strong><br />{{ client.contractSignature.ipAddress || client.contractSignature.IpAddress }}</div>
                  <div><strong>Timestamp:</strong><br />{{ (client.contractSignature.signedAt || client.contractSignature.SignedAt) | date:'medium' }}</div>
                </div>
              </div>
            </div>
            <ng-template #noContract><p class="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">Contract not signed yet.</p></ng-template>
          </div>

          <!-- Payment Tab -->
          <div *ngIf="activeTab === 'payment'">
            <h3 class="font-semibold text-lg mb-4 text-gray-800">Payment Receipt</h3>
            <div *ngIf="client.payment; else noPayment" class="bg-white border shadow-sm p-6 rounded max-w-lg">
              <div class="flex justify-between items-center mb-6 pb-4 border-b">
                <span class="text-gray-500 text-sm uppercase tracking-wider font-semibold">Amount Paid</span>
                <span class="text-3xl font-bold text-gray-900">$ {{ client.payment.amount | number:'1.2-2' }}</span>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-600">Status</span>
                  <span class="uppercase bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">{{ client.payment.status }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-600">Date</span>
                  <span class="text-gray-900 font-medium">{{ client.payment.paidAt | date:'shortDate' }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-600">Transaction ID</span>
                  <span class="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{{ client.payment.stripePaymentIntentId }}</span>
                </div>
              </div>
            </div>
            <ng-template #noPayment><p class="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">No payment record.</p></ng-template>
          </div>

          <!-- Booking Tab -->
          <div *ngIf="activeTab === 'booking'">
            <h3 class="font-semibold text-lg mb-4 text-gray-800">Kickoff Call</h3>
            <div *ngIf="client.booking; else noBooking" class="bg-blue-50 border border-blue-200 p-8 rounded max-w-lg text-center shadow-sm">
              <div class="flex justify-center mb-3"><lucide-icon name="Clock" class="text-blue-500" [size]="40"></lucide-icon></div>
              <p class="font-bold text-xl text-blue-900 mb-1">Call Scheduled</p>
              <p class="text-gray-600 mb-6 font-medium">
                {{ client.booking.scheduledCallAt | date:'fullDate' }} at {{ client.booking.scheduledCallAt | date:'shortTime' }}
              </p>
              <div class="bg-white p-3 rounded border text-sm text-left">
                <span class="text-gray-500 block mb-1 text-xs uppercase font-semibold">Meeting Link (To Be Generated)</span>
                <a [href]="client.booking.meetingLink" class="text-blue-600 hover:underline font-mono" target="_blank" rel="noreferrer">
                  {{ client.booking.meetingLink || "Pending creation" }}
                </a>
              </div>
            </div>
            <ng-template #noBooking><p class="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">Kickoff call not booked yet.</p></ng-template>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientDetailComponent implements OnInit {
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private http = inject(HttpClient);

  client: any = null;
  isError = false;
  activeTab = 'brand';
  apiUrl = environment.apiUrl;
  renderedIntakeHtml = '';
  id: string | null = null;

  // Edit state for inline editing of clientName and clientEmail
  isEditingName = false;
  isEditingEmail = false;
  // Bound values for the edit inputs
  editingNameValue = '';
  editingEmailValue = '';

  // Reference to the name/email inputs for auto-focus
  @ViewChild('nameInputEl') nameInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInputEl') emailInputRef!: ElementRef<HTMLInputElement>;

  tabs = [
    { id: 'brand', label: 'Brand Intake' },
    { id: 'files', label: 'Files' },
    { id: 'contract', label: 'Contract' },
    { id: 'payment', label: 'Payment' },
    { id: 'booking', label: 'Kickoff Call' },
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) this.fetchClient();
    });
  }

  async fetchClient() {
    if (!this.id) return;
    try {
      this.isError = false;
      const data = await this.http.get<any>(
        `${environment.apiUrl}/api/onboarding/sessions/${this.id}`
      ).toPromise();

      this.client = data;
      if (this.client.intakeForm?.submittedDataJson) {
        this.renderIntakeResponses(this.client.intakeForm.submittedDataJson);
      }
    } catch (e) {
      console.error(e);
      this.isError = true;
    }
  }

  /**
   * Pen icon clicked — enable the edit input and auto-focus it.
   */
  startEdit(field: 'name' | 'email') {
    if (field === 'name') {
      this.editingNameValue = this.client.clientName || '';
      this.isEditingName = true;
      // Use setTimeout to allow Angular to render the input before focusing
      setTimeout(() => this.nameInputRef?.nativeElement?.focus(), 50);
    } else {
      this.editingEmailValue = this.client.clientEmail || '';
      this.isEditingEmail = true;
      setTimeout(() => this.emailInputRef?.nativeElement?.focus(), 50);
    }
  }

  cancelEdit(field: 'name' | 'email') {
    if (field === 'name') this.isEditingName = false;
    else this.isEditingEmail = false;
  }

  async saveEdit(field: 'name' | 'email', value: string) {
    if (!value?.trim()) return;
    const trimmed = value.trim();

    // Optimistically update the UI
    if (field === 'name') {
      this.client.clientName = trimmed;
      this.isEditingName = false;
    } else {
      this.client.clientEmail = trimmed;
      this.isEditingEmail = false;
    }

    // Persist to backend
    try {
      await this.http.patch(
        `${environment.apiUrl}/api/onboarding/sessions/${this.id}`,
        { clientName: this.client.clientName, clientEmail: this.client.clientEmail }
      ).toPromise();
    } catch (e) {
      console.error('Failed to update client field', e);
      // Re-fetch to restore correct state on error
      this.fetchClient();
    }
  }

  renderIntakeResponses(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);
      let html = '';
      
      Object.entries(data).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        if (key === 'brandColors' && Array.isArray(value)) {
          let cols = (value as any[]).map(color => `
            <div class="flex items-center gap-3 bg-gray-50 border rounded-lg p-2 pr-5 shadow-sm">
              <div class="w-8 h-8 rounded shadow-inner border border-gray-200" style="background-color: ${color.hex}"></div>
              <div>
                <div class="text-xs font-bold text-gray-800">${color.name}</div>
                <div class="text-xs text-gray-500 font-mono uppercase">${color.hex}</div>
              </div>
            </div>
          `).join('');
          
          html += `<div class="col-span-1 md:col-span-2">
            <span class="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">${formattedKey}</span>
            <div class="flex flex-wrap gap-4">${cols}</div>
          </div>`;
        } else if (Array.isArray(value)) {
          let vals = (value as any[]).map(val => `<span class="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium">${val}</span>`).join('');
          html += `<div class="col-span-1 md:col-span-2 border-t border-gray-100 pt-4 mt-2">
            <span class="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">${formattedKey}</span>
            <div class="flex flex-wrap gap-2">${vals}</div>
          </div>`;
        } else {
          const isLong = typeof value === 'string' && value.length > 50;
          const valHtml = value ? value : '<span class="text-gray-400 italic font-normal">None provided</span>';
          html += `<div class="${isLong ? 'col-span-1 md:col-span-2' : 'col-span-1'}">
            <span class="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">${formattedKey}</span>
            <div class="bg-gray-50 border border-gray-100 p-3.5 rounded-lg text-gray-800 whitespace-pre-wrap shadow-inner text-sm font-medium">${valHtml}</div>
          </div>`;
        }
      });
      this.renderedIntakeHtml = html;
    } catch {
      this.renderedIntakeHtml = '<div class="bg-red-50 text-red-600 p-4 rounded border border-red-200">Error parsing response data.</div>';
    }
  }

  async handleSendReminder() {
    if (!window.confirm(`Send an email reminder to ${this.client.clientEmail}?`)) return;

    try {
      await this.http.post(
        `${environment.apiUrl}/api/onboarding/sessions/${this.id}/remind`, {}
      ).toPromise();
      alert(`Reminder sent to ${this.client.clientEmail}!`);
    } catch {
      alert('Failed to send reminder.');
    }
  }

  async downloadZipViaFetch() {
    const user = this.auth.user();
    if (!user) return;

    // ZIP download requires blob response — use fetch() with token manually since HttpClient blob handling needs extra config
    const res = await fetch(`${environment.apiUrl}/api/onboarding/sessions/${this.id}/files/zip`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    
    if (!res.ok) {
      alert('Failed to download zip');
      return;
    }
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.client.clientName.replace(/\s+/g, '_')}_Files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
