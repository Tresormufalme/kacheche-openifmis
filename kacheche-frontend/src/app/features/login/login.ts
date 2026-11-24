import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { describeError } from '../../core/utils/http-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly hidePassword = signal(true);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  // Affiché quand l'intercepteur a ramené l'utilisateur ici (session expirée).
  readonly infoMessage = signal(
    this.route.snapshot.queryParamMap.get('reason') === 'expired'
      ? 'Votre session a expiré. Veuillez vous reconnecter.'
      : ''
  );

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {

    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.infoMessage.set('');

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username.trim(), password).subscribe({

      next: (user) => {
        this.isLoading.set(false);

        // Mot de passe provisoire : changement obligatoire avant tout le reste.
        if (user.mustChangePassword) {
          this.router.navigate(['/change-password']);
          return;
        }

        this.router.navigateByUrl(this.destination());
      },

      error: (error) => {
        this.isLoading.set(false);

        // Le backend renvoie un message précis : identifiants incorrects,
        // compte verrouillé ou compte désactivé.
        this.errorMessage.set(
          describeError(error, 'Connexion impossible. Veuillez réessayer.')
        );
      }

    });
  }

  // Retour à la page demandée avant la connexion (adresse interne uniquement).
  private destination(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
      && !returnUrl.startsWith('/login')) {
      return returnUrl;
    }

    return this.authService.homeRoute();
  }
}
