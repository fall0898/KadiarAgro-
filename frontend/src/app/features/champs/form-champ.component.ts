import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Champ } from '../../core/models';

@Component({
  selector: 'app-form-champ',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/champs" class="text-neutral-400 hover:text-neutral-600 text-sm">← Champs</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ isEdit() ? 'Modifier le champ' : 'Nouveau champ' }}</h1>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nom du champ *</label>
              <input type="text" formControlName="nom" placeholder="Ex: Champ Nord"
                class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Superficie (ha) *</label>
              <input type="number" formControlName="superficie_ha" placeholder="0.5" step="0.0001"
                class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Localisation</label>
              <input type="text" formControlName="localisation" placeholder="Ex: Région de Thiès"
                class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Latitude</label>
              <input type="number" formControlName="latitude" placeholder="14.6928"
                class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Longitude</label>
              <input type="number" formControlName="longitude" placeholder="-17.4467"
                class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea formControlName="description" rows="3" placeholder="Description du champ..."
                class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"></textarea>
            </div>
          </div>

          <div class="flex gap-3 justify-end pt-4 border-t border-neutral-100">
            <a routerLink="/app/champs" class="px-4 py-2 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50 transition-colors">
              Annuler
            </a>
            <button type="submit" [disabled]="loading()"
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-md text-sm font-medium transition-colors">
              {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FormChampComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  champId: number | null = null;

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(150)]],
    superficie_ha: [null as number | null, [Validators.required, Validators.min(0)]],
    localisation: [''],
    latitude: [null as number | null],
    longitude: [null as number | null],
    description: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.champId = +id;
      this.api.get<Champ>(`champs/${id}`).subscribe(c => this.form.patchValue(c as any));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const req = this.isEdit()
      ? this.api.put(`champs/${this.champId}`, this.form.value)
      : this.api.post('champs', this.form.value);

    req.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Champ modifié.' : 'Champ créé.');
        this.router.navigate(['/app/champs']);
      },
      error: () => this.loading.set(false),
    });
  }
}
