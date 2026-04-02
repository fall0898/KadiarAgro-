import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Employe, Champ, Culture, Tache } from '../../core/models';

@Component({
  selector: 'app-form-tache',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/taches" class="text-neutral-400 hover:text-neutral-600 text-sm">← Tâches</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ isEdit() ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h1>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Employé *</label>
              <select formControlName="employe_id" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option value="">Sélectionner</option>
                @for (e of employes(); track e.id) { <option [value]="e.id">{{ e.nom }}</option> }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Champ</label>
              <select formControlName="champ_id" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option value="">Aucun</option>
                @for (c of champs(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Titre *</label>
              <input type="text" formControlName="titre" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea formControlName="description" rows="2" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm resize-none"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Date début *</label>
              <input type="date" formControlName="date_debut" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Date fin</label>
              <input type="date" formControlName="date_fin" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Statut</label>
              <select formControlName="statut" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Priorité</label>
              <select formControlName="priorite" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 justify-end pt-4 border-t border-neutral-100">
            <a routerLink="/app/taches" class="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Annuler</a>
            <button type="submit" [disabled]="loading()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-md text-sm font-medium">
              {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FormTacheComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  tacheId: number | null = null;
  employes = signal<Employe[]>([]);
  champs = signal<Champ[]>([]);

  form = this.fb.group({
    employe_id: ['', Validators.required],
    champ_id: [''],
    culture_id: [''],
    titre: ['', Validators.required],
    description: [''],
    date_debut: [new Date().toISOString().split('T')[0], Validators.required],
    date_fin: [''],
    statut: ['a_faire'],
    priorite: ['normale'],
  });

  ngOnInit(): void {
    this.api.get<Employe[]>('employes').subscribe(d => this.employes.set(d));
    this.api.get<Champ[]>('champs').subscribe(d => this.champs.set(d));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.tacheId = +id;
      this.api.get<Tache>(`taches/${id}`).subscribe(t => this.form.patchValue({ ...t, employe_id: String(t.employe_id), champ_id: t.champ_id ? String(t.champ_id) : '' } as any));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const req = this.isEdit() ? this.api.put(`taches/${this.tacheId}`, this.form.value) : this.api.post('taches', this.form.value);
    req.subscribe({
      next: () => { this.toast.success(this.isEdit() ? 'Tâche modifiée.' : 'Tâche créée.'); this.router.navigate(['/app/taches']); },
      error: () => this.loading.set(false),
    });
  }
}
