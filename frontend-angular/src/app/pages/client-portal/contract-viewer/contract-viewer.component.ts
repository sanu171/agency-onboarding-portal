import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OnboardingService } from '../../../services/onboarding.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-contract-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        Step 3: Review & Sign Contract
      </h2>

      <p class="text-gray-600 mb-6">
        Please review the agreement below carefully before signing.
      </p>

      <div class="contract-box whitespace-pre-wrap">
        {{ contractText }}
      </div>

      <form (ngSubmit)="handleSign($event)" class="border-t pt-6">

        <!-- Signature Field -->
        <div class="mb-4">

          <label class="block text-sm font-medium text-gray-700 mb-2">
            Electronic Signature (Type your full name)
          </label>

          <div class="signature-input-wrapper">

            <!-- Pen icon disappears while typing -->
            <div
              class="signature-icon"
              [class.hidden]="signature.trim().length > 0"
            >
              <lucide-icon
                name="PenTool"
                [size]="18"
                class="text-gray-400"
              ></lucide-icon>
            </div>

            <input
              type="text"
              required
              class="signature-input"
              placeholder="e.g. John Doe"
              [(ngModel)]="signature"
              name="signature"
              autocomplete="off"
            />

          </div>

          <!-- Live signature preview -->
          <div
            *ngIf="signature.trim()"
            style="
              margin-top: 16px;
              background: #F8FAFC;
              padding: 16px 20px;
              border-left: 3px solid var(--brand);
              border-top-right-radius: var(--radius-md);
              border-bottom-right-radius: var(--radius-md);
            "
          >
            <div
              style="
                font-family: 'Brush Script MT', cursive;
                font-size: 28px;
                color: var(--brand-dark);
                margin-bottom: 4px;
              "
            >
              {{ signature }}
            </div>

            <div
              style="
                font-size: 11px;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.05em;
              "
            >
              Digitally signed on {{ today | date:'mediumDate' }}
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-500 mb-6">
          By clicking "Sign & Continue", you acknowledge that this electronic
          signature is fully binding and holds the same legal validity as a
          physical signature.
        </p>

        <div class="flex justify-end pt-4">
          <button
            type="submit"
            [disabled]="loading || !signature.trim()"
            class="btn-primary"
            [class.btn-loading]="loading"
            [class.opacity-50]="loading || !signature.trim()"
            style="
              padding: 12px 28px;
              background: var(--brand);
              color: #fff;
            "
          >
            {{ loading ? 'Processing...' : 'Sign & Continue →' }}
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .signature-input-wrapper {
      position: relative;
    }

    .signature-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 2;
    }

    .signature-icon.hidden {
      opacity: 0;
    }

    .signature-input {
      width: 100%;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      padding: 14px 16px 14px 42px;
      font-family: serif;
      font-size: 18px;
      color: #1F2937;
      transition: all 0.2s ease;
      background: #fff;
    }

    .signature-input:focus {
      outline: none;
      border-color: #3B82F6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    /* Remove extra left padding while typing */
    .signature-input:not(:placeholder-shown) {
      padding-left: 16px;
    }
  `]
})
export class ContractViewerComponent {

  onboarding = inject(OnboardingService);
  private http = inject(HttpClient);

  signature = '';
  loading = false;
  today = new Date();

  get contractText(): string {
    const template = this.onboarding.sessionData()?.template;

    return (
      template?.contractText ||
      'This is a standard service agreement. By typing your name below, you agree to the terms and conditions set forth by the Agency.'
    );
  }

  async handleSign(e: Event) {
    e.preventDefault();

    if (!this.signature.trim()) {
      alert('Please type your signature to agree.');
      return;
    }

    this.loading = true;

    try {
      const token = this.onboarding.sessionData().token;

      const data = await this.http.post<any>(
        `${environment.apiUrl}/api/onboarding/${token}/sign`,
        {
          signatureData: this.signature
        }
      ).toPromise();

      if (data?.nextStep) {
        this.onboarding.updateStep(data.nextStep);
      }

    } catch (err: any) {

      alert(
        err?.error?.message ||
        err?.message ||
        'Failed to sign contract'
      );

    } finally {
      this.loading = false;
    }
  }
}