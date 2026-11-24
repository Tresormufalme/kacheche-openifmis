import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from './core/services/auth.service';
import { NAV_ITEMS, NavItem } from './core/security/navigation';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,

    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule
  ],

  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  // Menu : uniquement les entrées que l'utilisateur a le droit de voir.
  menu(section: NavItem['section']): NavItem[] {
    return NAV_ITEMS.filter(item =>
      item.section === section && this.authService.hasPermission(item.permission)
    );
  }

  // Le menu et la barre du haut sont masqués sur la connexion et sur
  // l'écran obligatoire de changement de mot de passe.
  showShell(): boolean {

    if (!this.authService.isAuthenticated()) {
      return false;
    }

    const url = this.router.url;

    if (url.startsWith('/login')) {
      return false;
    }

    return !(url.startsWith('/change-password') && this.authService.mustChangePassword());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
