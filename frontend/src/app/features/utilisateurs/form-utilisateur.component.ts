import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-form-utilisateur',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/utilisateurs" class="text-neutral-400 hover:text-neutral-600 text-sm">← Utilisateurs</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ isEdit() ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</h1>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nom *</label>
              <input type="text" formControlName="nom" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
              <input type="email" formControlName="email" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Téléphone</label>
              <input type="tel" formControlName="telephone" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Rôle *</label>
              <select formControlName="role" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option value="lecteur">Lecteur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Mot de passe {{ isEdit() ? '(laisser vide pour ne pas changer)' : '*' }}</label>
              <input type="password" formControlName="password" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            @if (isEdit()) {
              <div class="flex items-center gap-2 pt-6">
                <input type="checkbox" formControlName="est_actif" id="est_actif" class="rounded" />
                <label for="est_actif" class="text-sm text-neutral-700">Compte actif</label>
              </div>
            }
          </div>
          <div class="flex gap-3 justify-end pt-4 border-t border-neutral-100">
            <a routerLink="/app/utilisateurs" class="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Annuler</a>
            <button type="submit" [disabled]="loading()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-md text-sm font-medium">
              {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FormUtilisateurComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  userId: number | null = null;

  form = this.fb.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    role: ['lecteur', Validators.required],
    password: [''],
    est_actif: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.userId = +id;
      this.api.get<User>(`utilisateurs/${id}`).subscribe(u => this.form.patchValue(u as any));
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    const payload = { ...this.form.value };
    if (!payload.password) delete (payload as any).password;
    const req = this.isEdit() ? this.api.put(`utilisateurs/${this.userId}`, payload) : this.api.post('utilisateurs', payload);
    req.subscribe({
      next: () => { this.toast.success(this.isEdit() ? 'Utilisateur modifié.' : 'Utilisateur créé.'); this.router.navigate(['/app/utilisateurs']); },
      error: () => this.loading.set(false),
    });
  }
}
