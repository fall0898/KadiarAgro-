import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Champ, Depense, CATEGORIES_DEPENSES } from '../../core/models';

@Component({
  selector: 'app-form-depense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/depenses" class="text-neutral-400 hover:text-neutral-600 text-sm">← Dépenses</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ isEdit() ? 'Modifier la dépense' : 'Nouvelle dépense' }}</h1>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Champ (optionnel)</label>
              <select formControlName="champ_id" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option value="">Aucun champ spécifique</option>
                @for (c of champs(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Catégorie *</label>
              <select formControlName="categorie" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                @for (cat of categories; track cat.value) { <option [value]="cat.value">{{ cat.label }}</option> }
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Description *</label>
              <input type="text" formControlName="description" placeholder="Description de la dépense" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Montant (FCFA) *</label>
              <input type="number" formControlName="montant_fcfa" placeholder="0" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Date *</label>
              <input type="date" formControlName="date_depense" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
          </div>
          <div class="flex gap-3 justify-end pt-4 border-t border-neutral-100">
            <a routerLink="/app/depenses" class="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Annuler</a>
            <button type="submit" [disabled]="loading()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-md text-sm font-medium">
              {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FormDepenseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  depenseId: number | null = null;
  champs = signal<Champ[]>([]);
  categories = CATEGORIES_DEPENSES;

  form = this.fb.group({
    champ_id: [''],
    categorie: ['autre', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(300)]],
    montant_fcfa: [null as number | null, [Validators.required, Validators.min(0)]],
    date_depense: [new Date().toISOString().split('T')[0], Validators.required],
  });

  ngOnInit(): void {
    this.api.get<Champ[]>('champs').subscribe(d => this.champs.set(d));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.depenseId = +id;
      this.api.get<Depense>(`depenses/${id}`).subscribe(d => this.form.patchValue({ ...d, champ_id: d.champ_id ? String(d.champ_id) : '' } as any));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const req = this.isEdit()
      ? this.api.put(`depenses/${this.depenseId}`, this.form.value)
      : this.api.post('depenses', this.form.value);
    req.subscribe({
      next: () => { this.toast.success(this.isEdit() ? 'Dépense modifiée.' : 'Dépense créée.'); this.router.navigate(['/app/depenses']); },
      error: () => this.loading.set(false),
    });
  }
}
