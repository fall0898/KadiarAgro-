import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Culture, Media, UtilisationIntrant, Intrant, Stock } from '../../core/models';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';

@Component({
  selector: 'app-detail-culture',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFrPipe, CurrencyFcfaPipe, ReactiveFormsModule],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/cultures" class="text-neutral-400 hover:text-neutral-600 text-sm">← Cultures</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ culture()?.nom }}</h1>
        @if (auth.isAdmin() && culture()) {
          <a [routerLink]="['/app/cultures', culture()!.id, 'modifier']" class="ml-auto text-sm border border-neutral-300 text-neutral-600 px-3 py-1.5 rounded-md hover:bg-neutral-50">Modifier</a>
        }
      </div>

      @if (culture()) {
        <!-- Info -->
        <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p class="text-xs text-neutral-500">Champ</p><p class="font-semibold">{{ culture()!.champ?.nom }}</p></div>
            <div><p class="text-xs text-neutral-500">Saison / Année</p><p class="font-semibold">{{ culture()!.saison === 'normale' ? 'Normale' : 'Contre-saison' }} {{ culture()!.annee }}</p></div>
            <div><p class="text-xs text-neutral-500">Semis</p><p class="font-semibold">{{ culture()!.date_semis | dateFr }}</p></div>
            <div><p class="text-xs text-neutral-500">Statut</p>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getStatutClass(culture()!.statut)">{{ getStatutLabel(culture()!.statut) }}</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-neutral-200 mb-4">
          @for (t of tabs; track t.key) {
            <button (click)="activeTab.set(t.key)" class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
              [class]="activeTab() === t.key ? 'border-primary-500 text-primary-700' : 'border-transparent text-neutral-500 hover:text-neutral-700'">
              {{ t.label }}
            </button>
          }
        </div>

        <!-- Intrants -->
        @if (activeTab() === 'intrants') {
          @if (auth.isAdmin()) {
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 class="font-semibold text-sm text-neutral-700 mb-3">Ajouter un intrant</h3>
              <form [formGroup]="intrantForm" (ngSubmit)="ajouterIntrant()" class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input type="text" formControlName="nom_intrant" placeholder="Nom intrant *" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <input type="number" formControlName="quantite" placeholder="Quantité *" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <input type="text" formControlName="unite" placeholder="Unité (kg, L...)" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <input type="date" formControlName="date_utilisation" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <input type="number" formControlName="cout_total_fcfa" placeholder="Coût FCFA" class="px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                <select formControlName="stock_id" class="px-3 py-2 border border-neutral-300 rounded-md text-sm">
                  <option value="">Stock (optionnel)</option>
                  @for (s of stocks(); track s.id) { <option [value]="s.id">{{ s.nom }} ({{ s.quantite_actuelle }} {{ s.unite }})</option> }
                </select>
                <div class="md:col-span-2 flex justify-end">
                  <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">Ajouter</button>
                </div>
              </form>
            </div>
          }
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <table class="w-full">
              <thead><tr class="bg-neutral-100"><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Intrant</th><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Quantité</th><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Coût</th><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Date</th>@if(auth.isAdmin()){<th class="px-4 py-3"></th>}</tr></thead>
              <tbody class="divide-y divide-neutral-100">
                @for (u of intrants(); track u.id) {
                  <tr class="hover:bg-neutral-50">
                    <td class="px-4 py-3 text-sm">{{ u.nom_intrant }}</td>
                    <td class="px-4 py-3 text-sm">{{ u.quantite }} {{ u.unite }}</td>
                    <td class="px-4 py-3 text-sm">{{ u.cout_total_fcfa | currencyFcfa }}</td>
                    <td class="px-4 py-3 text-sm">{{ u.date_utilisation | dateFr }}</td>
                    @if (auth.isAdmin()) {
                      <td class="px-4 py-3 text-right"><button (click)="supprimerIntrant(u.id)" class="text-error text-xs hover:underline">Supprimer</button></td>
                    }
                  </tr>
                }
                @empty { <tr><td colspan="5" class="py-8 text-center text-sm text-neutral-400">Aucun intrant</td></tr> }
              </tbody>
            </table>
          </div>
        }

        <!-- Médias -->
        @if (activeTab() === 'medias') {
          @if (auth.isAdmin()) {
            <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
              <input type="file" #fileInput accept="image/*,video/*" (change)="uploadMedia($event)" class="hidden" />
              <button (click)="fileInput.click()" class="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                + Ajouter un média
              </button>
            </div>
          }
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            @for (m of medias(); track m.id) {
              <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                @if (m.type === 'photo') {
                  <img [src]="getMediaUrl(m.fichier_url)" [alt]="m.fichier_nom" class="w-full h-40 object-cover" />
                } @else {
                  <div class="w-full h-40 bg-neutral-200 flex items-center justify-center">
                    <span class="text-4xl">🎬</span>
                  </div>
                }
                <div class="p-2">
                  <p class="text-xs text-neutral-500 truncate">{{ m.fichier_nom }}</p>
                  @if (auth.isAdmin()) {
                    <button (click)="supprimerMedia(m.id)" class="text-error text-xs hover:underline mt-1">Supprimer</button>
                  }
                </div>
              </div>
            }
            @empty { <p class="col-span-3 py-8 text-center text-sm text-neutral-400">Aucun média</p> }
          </div>
        }
      }
    </div>
  `,
})
export class DetailCultureComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  culture = signal<Culture | null>(null);
  intrants = signal<UtilisationIntrant[]>([]);
  medias = signal<Media[]>([]);
  stocks = signal<Stock[]>([]);
  activeTab = signal<'intrants' | 'medias'>('intrants');

  tabs = [
    { key: 'intrants' as const, label: 'Intrants utilisés' },
    { key: 'medias' as const, label: 'Médias' },
  ];

  intrantForm = this.fb.group({
    nom_intrant: ['', Validators.required],
    quantite: [null as number | null, [Validators.required, Validators.min(0)]],
    unite: ['kg', Validators.required],
    cout_total_fcfa: [null as number | null],
    date_utilisation: [new Date().toISOString().split('T')[0], Validators.required],
    stock_id: [''],
  });

  private cultureId!: number;

  ngOnInit(): void {
    this.cultureId = +this.route.snapshot.paramMap.get('id')!;
    this.api.get<Culture>(`cultures/${this.cultureId}`).subscribe(c => this.culture.set(c));
    this.chargerIntrants();
    this.chargerMedias();
    this.api.get<Stock[]>('stocks').subscribe(d => this.stocks.set(d));
  }

  chargerIntrants(): void {
    this.api.get<UtilisationIntrant[]>(`cultures/${this.cultureId}/intrants`).subscribe(d => this.intrants.set(d));
  }

  chargerMedias(): void {
    this.api.get<Media[]>(`cultures/${this.cultureId}/medias`).subscribe(d => this.medias.set(d));
  }

  ajouterIntrant(): void {
    if (this.intrantForm.invalid) { this.intrantForm.markAllAsTouched(); return; }
    const val = this.intrantForm.value;
    const payload = { ...val, stock_id: val.stock_id || null };
    this.api.post(`cultures/${this.cultureId}/intrants`, payload).subscribe({
      next: () => { this.toast.success('Intrant ajouté.'); this.intrantForm.reset({ unite: 'kg', date_utilisation: new Date().toISOString().split('T')[0] }); this.chargerIntrants(); },
      error: () => {},
    });
  }

  supprimerIntrant(id: number): void {
    this.api.delete(`utilisations-intrants/${id}`).subscribe({ next: () => { this.toast.success('Intrant supprimé.'); this.chargerIntrants(); } });
  }

  uploadMedia(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('fichier', file);
    this.api.postFormData(`cultures/${this.cultureId}/medias`, fd).subscribe({
      next: () => { this.toast.success('Média ajouté.'); this.chargerMedias(); },
      error: () => {},
    });
  }

  supprimerMedia(id: number): void {
    this.api.delete(`medias/${id}`).subscribe({ next: () => { this.toast.success('Média supprimé.'); this.chargerMedias(); } });
  }

  getMediaUrl(url: string): string {
    return `http://localhost:8000${url}`;
  }

  getStatutLabel(s: string): string {
    return { en_cours: 'En cours', recolte: 'Récolte', termine: 'Terminé' }[s] || s;
  }

  getStatutClass(s: string): string {
    return { en_cours: 'bg-primary-100 text-primary-700', recolte: 'bg-secondary-100 text-secondary-700', termine: 'bg-neutral-100 text-neutral-600' }[s] || '';
  }
}
