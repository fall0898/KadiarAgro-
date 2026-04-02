import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Intrant, Stock } from '../../core/models';

@Component({
  selector: 'app-form-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/stocks" class="text-neutral-400 hover:text-neutral-600 text-sm">← Stocks</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ isEdit() ? 'Modifier le stock' : 'Nouveau stock' }}</h1>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nom *</label>
              <input type="text" formControlName="nom" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Catégorie *</label>
              <input type="text" formControlName="categorie" placeholder="Ex: Engrais" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Unité *</label>
              <input type="text" formControlName="unite" placeholder="kg, L, sac..." class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Seuil d'alerte</label>
              <input type="number" formControlName="seuil_alerte" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Intrant associé (optionnel)</label>
              <select formControlName="intrant_id" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                <option value="">Aucun</option>
                @for (i of intrants(); track i.id) { <option [value]="i.id">{{ i.nom }}</option> }
              </select>
            </div>
          </div>
          <div class="flex gap-3 justify-end pt-4 border-t border-neutral-100">
            <a routerLink="/app/stocks" class="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Annuler</a>
            <button type="submit" [disabled]="loading()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-md text-sm font-medium">
              {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FormStockComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  stockId: number | null = null;
  intrants = signal<Intrant[]>([]);

  form = this.fb.group({
    intrant_id: [''],
    nom: ['', Validators.required],
    categorie: ['', Validators.required],
    unite: ['', Validators.required],
    seuil_alerte: [null as number | null],
  });

  ngOnInit(): void {
    this.api.get<Intrant[]>('intrants').subscribe(d => this.intrants.set(d));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.stockId = +id;
      this.api.get<Stock>(`stocks/${id}`).subscribe(s => this.form.patchValue(s as any));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const req = this.isEdit()
      ? this.api.put(`stocks/${this.stockId}`, this.form.value)
      : this.api.post('stocks', this.form.value);
    req.subscribe({
      next: () => { this.toast.success(this.isEdit() ? 'Stock modifié.' : 'Stock créé.'); this.router.navigate(['/app/stocks']); },
      error: () => this.loading.set(false),
    });
  }
}
