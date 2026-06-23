import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-completion-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      style="
        position: relative;
        overflow: visible;
        text-align: center;
        max-width: 480px;
        margin: 40px auto;
        padding: 24px;
      "
    >

      <!-- Close (X) button -->
      <button
        id="close-onboarding-btn"
        type="button"
        (click)="closeWindow()"
        aria-label="Close onboarding window"
        title="Close"
        style="
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          line-height: 1;
          font-weight: 700;
          z-index: 1000;
        "
        (mouseenter)="closeHovered = true"
        (mouseleave)="closeHovered = false"
        [style.background]="closeHovered ? 'var(--danger-light)' : 'var(--bg-surface)'"
        [style.color]="closeHovered ? 'var(--danger)' : 'var(--text-secondary)'"
        [style.borderColor]="closeHovered ? '#FECACA' : 'var(--border)'"
      >
        ✕
      </button>

      <!-- Success icon -->
      <div
        style="
          width: 80px;
          height: 80px;
          background: var(--success-light);
          border: 4px solid var(--success-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 24px auto;
          box-shadow: 0 0 0 10px rgba(22, 163, 74, 0.05);
        "
      >
        🎉
      </div>

      <h1
        style="
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 12px;
        "
      >
        You're all set, {{ firstName }}!
      </h1>

      <p
        style="
          font-size: 16px;
          color: var(--text-secondary);
          margin-bottom: 32px;
        "
      >
        We have everything we need to begin working on your project.
      </p>

      <!-- Completion summary -->
      <div
        style="
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-align: left;
          margin-bottom: 24px;
        "
      >
        <h3
          style="
            font-size: 14px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
          "
        >
          Completion Summary
        </h3>

        <div
          *ngIf="template?.requireIntake !== false"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          "
        >
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--success-light);
              color: var(--success);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              flex-shrink: 0;
            "
          >
            ✓
          </div>

          <span
            style="
              font-size: 15px;
              color: var(--text-primary);
              font-weight: 500;
            "
          >
            Brand information received
          </span>
        </div>

        <div
          *ngIf="template?.requireFileUpload !== false"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          "
        >
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--success-light);
              color: var(--success);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              flex-shrink: 0;
            "
          >
            ✓
          </div>

          <span
            style="
              font-size: 15px;
              color: var(--text-primary);
              font-weight: 500;
            "
          >
            Files uploaded
          </span>
        </div>

        <div
          *ngIf="template?.requireContract !== false"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          "
        >
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--success-light);
              color: var(--success);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              flex-shrink: 0;
            "
          >
            ✓
          </div>

          <span
            style="
              font-size: 15px;
              color: var(--text-primary);
              font-weight: 500;
            "
          >
            Contract signed
          </span>
        </div>

        <div
          *ngIf="template?.requirePayment !== false"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          "
        >
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--success-light);
              color: var(--success);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              flex-shrink: 0;
            "
          >
            ✓
          </div>

          <span
            style="
              font-size: 15px;
              color: var(--text-primary);
              font-weight: 500;
            "
          >
            Deposit paid
          </span>
        </div>

        <div
          *ngIf="template?.requireBooking !== false"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          "
        >
          <div
            style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--success-light);
              color: var(--success);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              flex-shrink: 0;
            "
          >
            ✓
          </div>

          <span
            style="
              font-size: 15px;
              color: var(--text-primary);
              font-weight: 500;
            "
          >
            Kickoff call booked
          </span>
        </div>
      </div>

      <div
        style="
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 28px;
        "
      >
        Questions? Contact us at
        <strong>{{ agency?.email || 'your agency' }}</strong>
      </div>

      <!-- Done button -->
      <button
        id="done-onboarding-btn"
        type="button"
        (click)="closeWindow()"
        aria-label="Done — close onboarding window"
        style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 32px;
          background: var(--brand);
          color: #fff;
          border: none;
          border-radius: var(--radius-lg);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
          outline-offset: 3px;
        "
        (mouseenter)="doneHovered = true"
        (mouseleave)="doneHovered = false"
        [style.opacity]="doneHovered ? '0.88' : '1'"
      >
        ✓ All Done — Close Window
      </button>

      <!-- Tab close fallback message (shown only when window.close() is blocked by browser) -->
      <div
        *ngIf="windowCloseBlocked"
        style="
          margin-top: 24px;
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 12px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          color: #166534;
          font-weight: 500;
        "
      >
        <span style="font-size: 22px;">✅</span>
        <span>You're all done! You can safely <strong>close this browser tab</strong> now.</span>
      </div>

    </div>
  `
})
export class CompletionScreenComponent {
  onboarding = inject(OnboardingService);

  closeHovered = false;
  doneHovered = false;
  // True when browser blocks window.close() (user-opened tab)
  // Shows a friendly "you can close this tab" message instead of redirecting
  windowCloseBlocked = false;

  get firstName(): string {
    const clientName = this.onboarding.sessionData()?.clientName;
    return clientName ? clientName.split(' ')[0] : 'there';
  }

  get template() {
    return this.onboarding.sessionData()?.template;
  }

  get agency() {
    return this.onboarding.sessionData()?.agency;
  }

  closeWindow(): void {
    // Attempt programmatic close (works when the tab was opened via window.open())
    window.close();

    // Give the browser 300ms to process the close.
    // If the tab is still open after that, the browser blocked it —
    // show the fallback message. Never redirect to an agency page.
    setTimeout(() => {
      if (!window.closed) {
        this.windowCloseBlocked = true;
      }
    }, 300);
  }
}