import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🌿</div>
          <h1 class="text-2xl font-bold text-primary-700">KadiarAgro</h1>
          <p class="text-neutral-500 text-sm mt-1">Gestion agricole intelligente</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-neutral-700 mb-1">Adresse email</label>
            <input type="email" formControlName="email"
              class="w-full px-3 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              placeholder="votre@email.com" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-error text-xs mt-1">Email requis et valide</p>
            }
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-neutral-700 mb-1">Mot de passe</label>
            <input type="password" formControlName="password"
              class="w-full px-3 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              placeholder="••••••••" />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <p class="text-error text-xs mt-1">Mot de passe requis</p>
            }
          </div>

          <button type="submit" [disabled]="loading()"
            class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold py-2.5 px-4 rounded-md text-sm transition-all duration-150">
            @if (loading()) {
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Connexion...
              </span>
            } @else {
              Se connecter
            }
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.toast.success('Connexion réussie. Bienvenue !');
        this.router.navigate(['/app/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Identifiants incorrects.');
      }
    });
  }
}
