import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="k-page">
      <div class="k-panel">
        <div class="k-state">
          <mat-icon>lock</mat-icon>
          <h3>Accès non autorisé</h3>
          <p>
            Votre compte n’a pas les permissions nécessaires pour voir cette page.
            Contactez un administrateur si vous pensez qu’il s’agit d’une erreur.
          </p>

          <button mat-flat-button type="button" (click)="leave()">
            {{ hasHome ? 'Retour à l’accueil' : 'Se déconnecter' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class Forbidden {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get hasHome(): boolean {
    return this.authService.homeRoute() !== '/forbidden';
  }

  leave(): void {

    if (this.hasHome) {
      this.router.navigate([this.authService.homeRoute()]);
      return;
    }

    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
