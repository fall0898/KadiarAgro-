import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Champ, Culture } from '../../core/models';

@Component({
  selector: 'app-form-culture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/cultures" class="text-neutral-400 hover:text-neutral-600 text-sm">← Cultures</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ isEdit() ? 'Modifier la culture' : 'Nouvelle culture' }}</h1>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Champ *</label>
              <select formControlName="champ_id" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="">Sélectionner un champ</option>
                @for (c of champs(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nom de la culture *</label>
              <input type="text" formControlName="nom" placeholder="Ex: Riz" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Variété</label>
              <input type="text" formControlName="variete" placeholder="Ex: IR64" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Saison *</label>
              <select formControlName="saison" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="normale">Normale</option>
                <option value="contre_saison">Contre-saison</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Année *</label>
              <input type="number" formControlName="annee" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Date de semis</label>
              <input type="date" formControlName="date_semis" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Date récolte prévue</label>
              <input type="date" formControlName="date_recolte_prevue" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Superficie cultivée (ha)</label>
              <input type="number" formControlName="superficie_cultivee_ha" step="0.0001" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Statut</label>
              <select formControlName="statut" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="en_cours">En cours</option>
                <option value="recolte">Récolte</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
              <textarea formControlName="notes" rows="3" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"></textarea>
            </div>
          </div>
          <div class="flex gap-3 justify-end pt-4 border-t border-neutral-100">
            <a routerLink="/app/cultures" class="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Annuler</a>
            <button type="submit" [disabled]="loading()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-md text-sm font-medium">
              {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FormCultureComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  cultureId: number | null = null;
  champs = signal<Champ[]>([]);

  form = this.fb.group({
    champ_id: ['', Validators.required],
    nom: ['', [Validators.required, Validators.maxLength(150)]],
    variete: [''],
    saison: ['normale', Validators.required],
    annee: [new Date().getFullYear(), [Validators.required]],
    date_semis: [''],
    date_recolte_prevue: [''],
    superficie_cultivee_ha: [null as number | null],
    statut: ['en_cours'],
    notes: [''],
  });

  ngOnInit(): void {
    this.api.get<Champ[]>('champs').subscribe(d => this.champs.set(d));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.cultureId = +id;
      this.api.get<Culture>(`cultures/${id}`).subscribe(c => this.form.patchValue({ ...c, champ_id: String(c.champ_id) } as any));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const req = this.isEdit()
      ? this.api.put(`cultures/${this.cultureId}`, this.form.value)
      : this.api.post('cultures', this.form.value);
    req.subscribe({
      next: () => { this.toast.success(this.isEdit() ? 'Culture modifiée.' : 'Culture créée.'); this.router.navigate(['/app/cultures']); },
      error: () => this.loading.set(false),
    });
  }
}
