import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Employe } from '../../core/models';

@Component({
  selector: 'app-form-employe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/employes" class="text-neutral-400 hover:text-neutral-600 text-sm">← Employés</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ isEdit() ? 'Modifier l\'employé' : 'Nouvel employé' }}</h1>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nom *</label>
              <input type="text" formControlName="nom" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Téléphone</label>
              <input type="tel" formControlName="telephone" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Poste</label>
              <input type="text" formControlName="poste" placeholder="Ex: Manoeuvre" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Date d'embauche</label>
              <input type="date" formControlName="date_embauche" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Salaire mensuel (FCFA)</label>
              <input type="number" formControlName="salaire_mensuel_fcfa" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
              <textarea formControlName="notes" rows="2" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm resize-none"></textarea>
            </div>
          </div>
          <div class="flex gap-3 justify-end pt-4 border-t border-neutral-100">
            <a routerLink="/app/employes" class="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Annuler</a>
            <button type="submit" [disabled]="loading()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-md text-sm font-medium">
              {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FormEmployeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  employeId: number | null = null;

  form = this.fb.group({
    nom: ['', Validators.required],
    telephone: [''],
    poste: [''],
    date_embauche: [''],
    salaire_mensuel_fcfa: [null as number | null],
    notes: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.employeId = +id;
      this.api.get<Employe>(`employes/${id}`).subscribe(e => this.form.patchValue(e as any));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const req = this.isEdit() ? this.api.put(`employes/${this.employeId}`, this.form.value) : this.api.post('employes', this.form.value);
    req.subscribe({
      next: () => { this.toast.success(this.isEdit() ? 'Employé modifié.' : 'Employé créé.'); this.router.navigate(['/app/employes']); },
      error: () => this.loading.set(false),
    });
  }
}
