import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-securite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-xl font-bold text-neutral-800 mb-6">Paramètres — Sécurité</h1>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Ancien mot de passe *</label>
              <input type="password" formControlName="ancien_password" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nouveau mot de passe *</label>
              <input type="password" formControlName="nouveau_password" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Confirmer le nouveau mot de passe *</label>
              <input type="password" formControlName="nouveau_password_confirmation" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
          </div>
          <div class="flex justify-end pt-4 border-t border-neutral-100">
            <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium">Changer le mot de passe</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class SecuriteComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  form = this.fb.group({
    ancien_password: ['', Validators.required],
    nouveau_password: ['', [Validators.required, Validators.minLength(8)]],
    nouveau_password_confirmation: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.api.put('auth/password', this.form.value).subscribe({
      next: () => { this.toast.success('Mot de passe changé.'); this.form.reset(); },
    });
  }
}
