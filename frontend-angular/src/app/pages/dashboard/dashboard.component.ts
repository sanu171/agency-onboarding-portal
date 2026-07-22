import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, LayoutDashboard, FileText, Settings, LogOut } from 'lucide-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen">
      <!-- Sidebar -->
      <aside [ngStyle]="sidebarStyle" class="sidebar-override">
        <div style="padding: 0 8px 24px 8px; border-bottom: 1px solid var(--border); margin-bottom: 16px;">
          <!-- Agency name -->
          <div style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 180px; font-weight: 700; font-size: 15px; color: var(--text-primary);">
            {{ auth.user()?.agencyName || 'Agency' }}
          </div>
          <!-- Onvora brand label -->
          <p style="font-size: 11px; color: var(--text-muted); margin: 2px 0 0 0; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Onvora</p>
        </div>
        
        <nav style="flex: 1; display: flex; flex-direction: column;">
          <a *ngFor="let n of navs" 
             [routerLink]="n.path" 
             [ngStyle]="navItemStyle(isActive(n.path))"
             [style.background]="isActive(n.path) ? 'var(--brand-light)' : 'transparent'"
             [style.color]="isActive(n.path) ? 'var(--brand)' : 'var(--text-secondary)'"
             [style.font-weight]="isActive(n.path) ? '600' : '500'">
            <lucide-icon [name]="n.iconName" [size]="18"></lucide-icon>
            {{ n.label }}
          </a>
          
          <button 
            (click)="handleLogout()" 
            [ngStyle]="logoutStyle"
            (mouseenter)="isLogoutHovered = true"
            (mouseleave)="isLogoutHovered = false"
            [style.background]="isLogoutHovered ? 'var(--danger-light)' : 'transparent'"
          >
            <lucide-icon name="LogOut" [size]="18"></lucide-icon>
            Logout
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main style="margin-left: 240px; padding: 32px;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
  router = inject(Router);
  currentPath = '';
  isLogoutHovered = false;

  readonly LayoutDashboard = LayoutDashboard;
  readonly FileText = FileText;
  readonly SettingsIcon = Settings;
  readonly LogOut = LogOut;

  navs = [
    { path: '/dashboard', label: 'Overview', iconName: 'LayoutDashboard' },
    { path: '/dashboard/templates', label: 'Templates', iconName: 'FileText' },
    { path: '/dashboard/settings', label: 'Settings', iconName: 'Settings' },
  ];

  constructor() {
    this.currentPath = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.urlAfterRedirects;
    });
  }

  handleLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  isActive(path: string): boolean {
    if (path === '/dashboard') {
      return this.currentPath === '/dashboard' || this.currentPath.startsWith('/dashboard/client/');
    }
    return this.currentPath.startsWith(path);
  }

  navItemStyle(isActive: boolean): any {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '9px 12px',
      borderRadius: 'var(--radius-md)',
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'all 0.15s',
      marginBottom: '2px'
    };
  }

  get logoutStyle(): any {
    return {
      ...this.navItemStyle(false),
      marginTop: 'auto',
      color: 'var(--danger)',
      border: 'none',
    };
  }

  sidebarStyle = {
    width: '240px',
    background: 'var(--bg-card)',
    borderRight: '1px solid var(--border)',
    height: '100vh',
    position: 'fixed' as const,
    left: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '20px 16px'
  };
}
