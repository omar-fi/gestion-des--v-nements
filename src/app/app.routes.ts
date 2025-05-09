import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { OrganizerDashboardComponent } from './organizer-dashboard/organizer-dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  { 
    path: 'client-dashboard', 
    component: ClientDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['client'] }
  },
  {
    path: 'organizer-dashboard',
    component: OrganizerDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['organizer'] }
  }
];
