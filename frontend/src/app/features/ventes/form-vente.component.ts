import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Champ, Culture, Vente } from '../../core/models';

@Component({
  selector: 'app-form-vente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/ventes" class="text-neutral-400 hover:text-neutral-600 text-sm">← Ventes</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ isEdit() ? 'Modifier la vente' : 'Nouvelle vente' }}</h1>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Champ</label>
              <select formControlName="champ_id" (change)="onChampChange()" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option value="">Aucun champ</option>
                @for (c of champs(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Culture</label>
              <select formControlName="culture_id" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option value="">Aucune culture</option>
                @for (c of culturesFiltered(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Produit *</label>
              <input type="text" formControlName="produit" placeholder="Ex: Riz paddy" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Acheteur</label>
              <input type="text" formControlName="acheteur" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Quantité (kg) *</label>
              <input type="number" formControlName="quantite_kg" step="0.01" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Prix unitaire (FCFA/kg) *</label>
              <input type="number" formControlName="prix_unitaire_fcfa" step="1" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Montant total (calculé)</label>
              <div class="px-3 py-2 bg-primary-50 border border-primary-200 rounded-md text-sm font-semibold text-primary-700">
                {{ montantTotal() | number:'1.0-0' }} FCFA
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Date *</label>
              <input type="date" formControlName="date_vente" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
              <textarea formControlName="notes" rows="2" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm resize-none"></textarea>
            </div>
          </div>
          <div class="flex gap-3 justify-end pt-4 border-t border-neutral-100">
            <a routerLink="/app/ventes" class="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Annuler</a>
            <button type="submit" [disabled]="loading()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-md text-sm font-medium">
              {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FormVenteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  venteId: number | null = null;
  champs = signal<Champ[]>([]);
  cultures = signal<Culture[]>([]);
  culturesFiltered = signal<Culture[]>([]);

  form = this.fb.group({
    champ_id: [''],
    culture_id: [''],
    produit: ['', Validators.required],
    acheteur: [''],
    quantite_kg: [null as number | null, [Validators.required, Validators.min(0)]],
    prix_unitaire_fcfa: [null as number | null, [Validators.required, Validators.min(0)]],
    date_vente: [new Date().toISOString().split('T')[0], Validators.required],
    notes: [''],
  });

  montantTotal(): number {
    const q = this.form.get('quantite_kg')?.value ?? 0;
    const p = this.form.get('prix_unitaire_fcfa')?.value ?? 0;
    return (q as number) * (p as number);
  }

  ngOnInit(): void {
    this.api.get<Champ[]>('champs').subscribe(d => this.champs.set(d));
    this.api.get<Culture[]>('cultures').subscribe(d => this.cultures.set(d));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.venteId = +id;
      this.api.get<Vente>(`ventes/${id}`).subscribe(v => {
        this.form.patchValue({ ...v, champ_id: v.champ_id ? String(v.champ_id) : '', culture_id: v.culture_id ? String(v.culture_id) : '' } as any);
        this.onChampChange();
      });
    }
  }

  onChampChange(): void {
    const champId = this.form.get('champ_id')?.value;
    if (champId) {
      this.culturesFiltered.set(this.cultures().filter(c => String(c.champ_id) === champId));
    } else {
      this.culturesFiltered.set(this.cultures());
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const req = this.isEdit()
      ? this.api.put(`ventes/${this.venteId}`, this.form.value)
      : this.api.post('ventes', this.form.value);
    req.subscribe({
      next: () => { this.toast.success(this.isEdit() ? 'Vente modifiée.' : 'Vente créée.'); this.router.navigate(['/app/ventes']); },
      error: () => this.loading.set(false),
    });
  }
}
