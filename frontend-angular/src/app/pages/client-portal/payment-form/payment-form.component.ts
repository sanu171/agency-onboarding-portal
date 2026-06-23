import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OnboardingService } from '../../../services/onboarding.service';
import { environment } from '../../../../environments/environment';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { LucideAngularModule, CreditCard } from 'lucide-angular';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="max-w-md mx-auto p-4 md:p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">Step 4: Deposit</h2>
      <p class="text-gray-600 text-center mb-8 pb-4 border-b">
        Please submit your project deposit of <strong class="text-gray-900">$ {{ paymentAmount | number:'1.2-2' }}</strong>.
      </p>

      <div *ngIf="clientSecret === 'mock_secret_for_local_dev'" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; text-align: center;">
        <div style="font-size:32px; margin-bottom:12px;">💳</div>
        <p style="color:var(--text-secondary); font-size:14px; margin-bottom:20px;">
          Secure payment powered by Stripe
        </p>
        <div style="background:#F1F5F9; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px 20px; color:var(--text-muted); font-size:13px; margin-bottom:20px;">
          Payment form will appear here
        </div>
        <button (click)="handleSuccess('pi_mock_bypass')" class="btn-primary" style="width:100%; padding:13px; display:flex; justify-content:center;">
          Pay $ {{ paymentAmount | number:'1.2-2' }}
        </button>
      </div>

      <div *ngIf="clientSecret && clientSecret !== 'mock_secret_for_local_dev'">
        <div class="flex justify-between items-center mb-4 text-sm font-medium text-gray-500">
          <span>Payable To:</span>
          <span>{{ agencyName }}</span>
        </div>
        
        <form (ngSubmit)="handleSubmit($event)" class="space-y-6">
          <div class="p-4 border rounded-md shadow-sm bg-white">
            <label class="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
            <div #cardElement></div>
          </div>
          <div *ngIf="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
          <button type="submit" [disabled]="!stripe || loading" class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition shadow">
            <lucide-icon name="CreditCard" [size]="20"></lucide-icon>
            {{ loading ? 'Processing...' : 'Pay $' + (paymentAmount | number:'1.2-2') }}
          </button>
        </form>
      </div>

      <div *ngIf="!clientSecret" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500">Loading secure checkout...</p>
      </div>
    </div>
  `
})
export class PaymentFormComponent implements OnInit, OnDestroy {
  @ViewChild('cardElement') cardElementRef!: ElementRef;
  
  onboarding = inject(OnboardingService);
  private http = inject(HttpClient);
  
  clientSecret = '';
  loading = false;
  error = '';
  
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;

  ngOnInit() {
    this.fetchIntent();
  }

  async fetchIntent() {
    const token = this.onboarding.sessionData().token;
    try {
      const data = await this.http.post<any>(
        `${environment.apiUrl}/api/onboarding/${token}/payment/intent`, {}
      ).toPromise();
      this.clientSecret = data.clientSecret;
      if (this.clientSecret !== 'mock_secret_for_local_dev') {
        this.initStripe();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async initStripe() {
    this.stripe = await loadStripe(environment.stripePublishableKey || 'pk_test_TYooMQauvdEDq54NiTphI7jx');
    if (this.stripe) {
      this.elements = this.stripe.elements({ clientSecret: this.clientSecret });
      
      setTimeout(() => {
        if (this.cardElementRef && this.elements) {
          const style = { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } } };
          this.card = this.elements.create('card', { style });
          this.card.mount(this.cardElementRef.nativeElement);
        }
      }, 0);
    }
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    if (!this.stripe || !this.elements || !this.card) return;
    
    this.loading = true;
    this.error = '';

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: { card: this.card }
    });

    if (error) {
      this.error = error.message || 'Payment failed';
      this.loading = false;
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      this.handleSuccess(paymentIntent.id);
    }
  }

  async handleSuccess(paymentIntentId: string) {
    const token = this.onboarding.sessionData().token;
    try {
      const data = await this.http.post<any>(
        `${environment.apiUrl}/api/onboarding/${token}/payment/confirm`,
        { paymentIntentId }
      ).toPromise();
      if (data?.nextStep) {
        this.onboarding.updateStep(data.nextStep);
      }
    } catch (e) {
      console.error(e);
    }
  }

  get paymentAmount() {
    return this.onboarding.sessionData()?.template?.paymentAmount || 0;
  }

  get agencyName() {
    return this.onboarding.sessionData()?.agency?.name || 'Agency';
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.destroy();
    }
  }
}
