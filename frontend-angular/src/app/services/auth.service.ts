import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  agencyName: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // sessionStorage keeps the token tab-local and clears it when the tab/browser is closed.
  private readonly STORAGE_KEY = 'agencyUser';
  private readonly LOGIN_TIME_KEY = 'agencyLoginTime';

  // BroadcastChannel: used to propagate logout events to all other open tabs
  // so that duplicated/sibling tabs are also signed out immediately.
  private readonly logoutChannel = new BroadcastChannel('Onvora_logout');

  private userSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(true);

  public readonly user = computed(() => this.userSignal());
  public readonly isLoading = computed(() => this.loadingSignal());
  public readonly isAuthenticated = computed(() => !!this.userSignal());

  constructor() {
    this.initAuth();
    this.listenForCrossTabLogout();
  }

  // ---------------------------------------------------------------------------
  // Cross-tab logout sync via BroadcastChannel
  // ---------------------------------------------------------------------------
  /**
   * Listen for LOGOUT messages posted by other tabs.
   * BroadcastChannel messages are received by ALL OTHER tabs on the same origin —
   * the tab that called postMessage() does NOT receive its own message.
   * Therefore the originating tab is handled directly in logout(), while sibling
   * tabs (duplicates, other open tabs) are handled here.
   */
  private listenForCrossTabLogout() {
    this.logoutChannel.onmessage = (event: MessageEvent) => {
      if (event.data === 'LOGOUT') {
        // Clear this tab's session storage
        sessionStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.LOGIN_TIME_KEY);
        // Reset the in-memory signal
        this.userSignal.set(null);
        // Force a full-page redirect to login with a "session_expired" reason.
        // We use window.location.href instead of Angular Router to avoid circular
        // injection issues and to guarantee a clean app restart in the other tab.
        window.location.href = '/login?reason=session_expired';
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------
  private async initAuth() {
    // Clear any legacy localStorage entry from older versions of the app
    localStorage.removeItem('agencyUser');

    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.userSignal.set(null);
        this.loadingSignal.set(false);
        return;
      }

      // --- Session Timeout Check (8-hour TTL) ---
      const loginTime = Number(sessionStorage.getItem(this.LOGIN_TIME_KEY) || '0');
      if (loginTime && Date.now() - loginTime > environment.sessionTtlMs) {
        // Session has expired — clear everything and treat as unauthenticated
        sessionStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.LOGIN_TIME_KEY);
        this.userSignal.set(null);
        this.loadingSignal.set(false);
        return;
      }

      const parsed: User = JSON.parse(stored);

      // Validate the stored token is still accepted by the server.
      // Only clear on an explicit 401. Network errors are tolerated so the
      // app continues to work in offline / slow-network situations.
      try {
        await firstValueFrom(
          this.http.get<any>(`${environment.apiUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${parsed.token}` }
          })
        );
        this.userSignal.set(parsed);
      } catch (err: any) {
        if (err?.status === 401) {
          // Token explicitly rejected by the server
          sessionStorage.removeItem(this.STORAGE_KEY);
          sessionStorage.removeItem(this.LOGIN_TIME_KEY);
          this.userSignal.set(null);
        } else {
          // Network error — keep local session so the app still works offline
          this.userSignal.set(parsed);
        }
      } finally {
        this.loadingSignal.set(false);
      }
    } catch {
      sessionStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.LOGIN_TIME_KEY);
      this.userSignal.set(null);
      this.loadingSignal.set(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  login(userData: User) {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
    // Record login time for the 8-hour TTL check
    sessionStorage.setItem(this.LOGIN_TIME_KEY, String(Date.now()));
    this.userSignal.set(userData);
  }

  /**
   * Logs the current tab out and broadcasts a LOGOUT message to all other
   * tabs so they also clear their session immediately.
   */
  logout() {
    // 1. Clear this tab's storage and in-memory state
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.LOGIN_TIME_KEY);
    this.userSignal.set(null);

    // 2. Notify every other open tab to log out too.
    //    BroadcastChannel.postMessage() does NOT fire in the sending tab —
    //    so this only affects sibling tabs (e.g. duplicated tabs).
    this.logoutChannel.postMessage('LOGOUT');
  }
}
