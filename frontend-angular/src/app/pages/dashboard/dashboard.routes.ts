import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent) },
      { path: 'templates', loadComponent: () => import('./templates/templates.component').then(m => m.TemplatesComponent) },
      { path: 'settings', loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'client/:id', loadComponent: () => import('./client-detail/client-detail.component').then(m => m.ClientDetailComponent) }
    ]
  }
];
