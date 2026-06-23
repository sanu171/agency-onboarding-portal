import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OnboardingService } from '../../../services/onboarding.service';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule, Calendar as CalendarIcon, Clock } from 'lucide-angular';

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Step 5: Book a Kickoff Call</h2>
      <p class="text-gray-600 mb-8">Select a time that works best for you to chat with the {{ agencyName }} team.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div class="bg-white border border-gray-200 rounded-lg p-6 flex flex-col h-full shadow-sm">
            <div class="flex flex-col items-center flex-1 justify-center mb-8">
              <lucide-icon name="CalendarIcon" [size]="48" class="text-blue-500 mb-4"></lucide-icon>
              <p class="text-sm text-gray-500 font-medium">Duration: 30 minutes</p>
            </div>
            
            <div class="mt-auto border-t border-gray-100 pt-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Select a date</label>
              <input 
                type="date"
                [min]="todayIso"
                [(ngModel)]="selectedDate"
                (ngModelChange)="onDateChange()"
                style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-md); font-family: inherit; font-size: 15px; color: var(--text-primary); background: #F8FAFC; cursor: pointer;"
              />
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="font-medium text-gray-700 mb-2">Available times</h3>
          <button
            *ngFor="let slot of slots"
            (click)="selectedSlot = slot"
            [style.width]="'100%'" [style.display]="'flex'" [style.alignItems]="'center'" [style.justifyContent]="'center'" [style.gap]="'8px'" [style.padding]="'12px'" [style.border]="'1px solid ' + (selectedSlot?.id === slot.id ? 'var(--brand)' : 'var(--border)')" [style.borderRadius]="'var(--radius-md)'" [style.background]="selectedSlot?.id === slot.id ? 'var(--brand-light)' : 'var(--bg-card)'" [style.color]="selectedSlot?.id === slot.id ? 'var(--brand-dark)' : 'var(--text-primary)'" [style.fontWeight]="selectedSlot?.id === slot.id ? '600' : '500'" [style.transition]="'all 0.15s'" [style.cursor]="'pointer'"
          >
            <lucide-icon name="Clock" [size]="16"></lucide-icon>
            {{ slot.time }}
          </button>
        </div>
      </div>

      <div class="flex justify-end mt-8 border-t pt-6">
        <button
          (click)="handleBook()"
          [disabled]="loading || !selectedSlot"
          class="btn-primary"
          [class.btn-loading]="loading"
          [class.opacity-50]="loading || !selectedSlot"
          style="padding: 12px 28px; font-size: 15px;"
        >
          {{ loading ? 'Booking...' : 'Confirm Meeting →' }}
        </button>
      </div>
    </div>
  `
})
export class BookingCalendarComponent {
  onboarding = inject(OnboardingService);
  private http = inject(HttpClient);
  
  loading = false;
  selectedSlot: any = null;
  
  todayIso = new Date().toISOString().split('T')[0];
  
  tomorrow = new Date();
  constructor() {
    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
  }
  selectedDate = this.tomorrow.toISOString().split('T')[0];

  slots = [
    { id: 1, time: "09:00 AM", hours: 9, mins: 0 },
    { id: 2, time: "11:00 AM", hours: 11, mins: 0 },
    { id: 3, time: "02:00 PM", hours: 14, mins: 0 },
    { id: 4, time: "04:30 PM", hours: 16, mins: 30 },
  ];

  get agencyName() {
    return this.onboarding.sessionData()?.agency?.name || 'Agency';
  }

  onDateChange() {
    this.selectedSlot = null;
  }

  async handleBook() {
    if (!this.selectedSlot) return;
    this.loading = true;
    
    try {
      const d = new Date(this.selectedDate);
      d.setHours(this.selectedSlot.hours, this.selectedSlot.mins, 0, 0);
      const scheduledCallAt = d.toISOString();
      const token = this.onboarding.sessionData().token;
      
      const data = await this.http.post<any>(
        `${environment.apiUrl}/api/onboarding/${token}/booking`,
        { scheduledCallAt }
      ).toPromise();

      if (data?.nextStep) {
        this.onboarding.updateStep(data.nextStep);
      }
    } catch (err: any) {
      alert(err?.error?.message || err?.message || 'Failed to book meeting');
    } finally {
      this.loading = false;
    }
  }
}
