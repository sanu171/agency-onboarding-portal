import { Injectable, signal, computed } from '@angular/core';

export interface SessionData {
  token: string;
  currentStep: string;
  clientName: string;
  clientEmail: string;
  agency: { name: string; email: string; logoUrl: string; brandColor: string };
  template: any;
  templateName: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private sessionSignal = signal<SessionData>({} as SessionData);
  private isLoadingSignal = signal<boolean>(true);
  private errorSignal = signal<string | null>(null);

  public readonly sessionData = computed(() => this.sessionSignal());
  public readonly isLoading = computed(() => this.isLoadingSignal());
  public readonly error = computed(() => this.errorSignal());

  setSessionConfig(data: SessionData) {
    this.sessionSignal.set(data);
  }

  updateStep(newStep: string) {
    this.sessionSignal.update(s => ({ ...s, currentStep: newStep }));
  }

  setLoading(state: boolean) {
    this.isLoadingSignal.set(state);
  }

  setError(err: string | null) {
    this.errorSignal.set(err);
  }
}
