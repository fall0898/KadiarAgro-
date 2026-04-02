import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-xl font-bold text-neutral-800 mb-6">Paramètres — Profil</h1>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nom</label>
              <input type="text" formControlName="nom" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input type="email" formControlName="email" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Téléphone</label>
              <input type="tel" formControlName="telephone" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
          </div>
          <div class="flex justify-end pt-4 border-t border-neutral-100">
            <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium">Sauvegarder</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  form = this.fb.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) this.form.patchValue(user as any);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.api.put<any>('auth/user', this.form.value).subscribe({
      next: (res) => { this.auth.updateCurrentUser(res.user); this.toast.success('Profil mis à jour.'); },
    });
  }
}
