import { Injectable, signal, computed } from '@angular/core';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  public readonly toasts = computed(() => this.toastsSignal());

  add(message: string, type: 'success' | 'error' | 'info' = 'success', durationMs = 3000) {
    const id = Date.now().toString() + Math.random().toString();
    this.toastsSignal.update(ts => [...ts, { id, message, type }]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  remove(id: string) {
    this.toastsSignal.update(ts => ts.filter(t => t.id !== id));
  }
}
