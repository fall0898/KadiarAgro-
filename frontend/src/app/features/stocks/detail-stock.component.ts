import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Stock, MouvementStock, Culture } from '../../core/models';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';

@Component({
  selector: 'app-detail-stock',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFrPipe, CurrencyFcfaPipe, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/stocks" class="text-neutral-400 hover:text-neutral-600 text-sm">← Stocks</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ stock()?.nom }}</h1>
        @if (auth.isAdmin() && stock()) {
          <a [routerLink]="['/app/stocks', stock()!.id, 'modifier']" class="ml-auto text-sm border border-neutral-300 text-neutral-600 px-3 py-1.5 rounded-md hover:bg-neutral-50">Modifier</a>
        }
      </div>

      @if (stock()) {
        <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p class="text-xs text-neutral-500">Quantité actuelle</p>
              <p class="text-xl font-bold" [class]="stock()!.seuil_alerte != null && stock()!.quantite_actuelle <= stock()!.seuil_alerte! ? 'text-warning-dark' : 'text-neutral-800'">
                {{ stock()!.quantite_actuelle }} {{ stock()!.unite }}
              </p>
            </div>
            <div><p class="text-xs text-neutral-500">Seuil d'alerte</p><p class="font-semibold">{{ stock()!.seuil_alerte ? stock()!.seuil_alerte + ' ' + stock()!.unite : '-' }}</p></div>
            <div><p class="text-xs text-neutral-500">Catégorie</p><p class="font-semibold">{{ stock()!.categorie }}</p></div>
            <div><p class="text-xs text-neutral-500">Unité</p><p class="font-semibold">{{ stock()!.unite }}</p></div>
          </div>
        </div>

        @if (auth.isAdmin()) {
          <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
            <h3 class="font-semibold text-neutral-700 mb-4">Nouveau mouvement</h3>
            <form [formGroup]="mouvementForm" (ngSubmit)="ajouterMouvement()">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Type *</label>
                  <select formControlName="type" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm">
                    <option value="achat">Achat</option>
                    <option value="utilisation">Utilisation</option>
                    <option value="perte">Perte</option>
                    <option value="ajustement">Ajustement</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Quantité *</label>
                  <input type="number" formControlName="quantite" step="0.01" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                </div>
                @if (mouvementForm.get('type')?.value === 'achat') {
                  <div>
                    <label class="block text-xs text-neutral-500 mb-1">Prix unitaire (FCFA)</label>
                    <input type="number" formControlName="prix_unitaire_fcfa" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs text-neutral-500 mb-1">Fournisseur</label>
                    <input type="text" formControlName="fournisseur" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                  </div>
                }
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Date *</label>
                  <input type="date" formControlName="date_mouvement" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                </div>
                <div>
                  <label class="block text-xs text-neutral-500 mb-1">Motif/Notes</label>
                  <input type="text" formControlName="motif" class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm" />
                </div>
              </div>
              @if (mouvementForm.get('type')?.value === 'achat' && montantAchat() > 0) {
                <p class="text-sm text-warning-dark bg-warning/10 px-3 py-2 rounded-md mb-3">
                  ⚠️ Une dépense de {{ montantAchat() | currencyFcfa }} sera créée automatiquement.
                </p>
              }
              <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
                Enregistrer le mouvement
              </button>
            </form>
          </div>
        }

        <!-- Historique -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-neutral-100">
            <h3 class="font-semibold text-neutral-700">Historique des mouvements</h3>
          </div>
          <table class="w-full">
            <thead><tr class="bg-neutral-100"><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Date</th><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Type</th><th class="px-4 py-3 text-right text-xs text-neutral-500 uppercase">Quantité</th><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase hidden md:table-cell">Motif/Fournisseur</th><th class="px-4 py-3 text-right text-xs text-neutral-500 uppercase hidden sm:table-cell">Montant</th></tr></thead>
            <tbody class="divide-y divide-neutral-100">
              @for (m of mouvements(); track m.id) {
                <tr class="hover:bg-neutral-50">
                  <td class="px-4 py-3 text-sm">{{ m.date_mouvement | dateFr }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getTypeClass(m.type)">{{ m.type }}</span>
                  </td>
                  <td class="px-4 py-3 text-sm font-semibold text-right" [class]="m.type === 'achat' ? 'text-primary-600' : 'text-error'">
                    {{ m.type === 'achat' ? '+' : '-' }}{{ m.quantite }} {{ stock()!.unite }}
                  </td>
                  <td class="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">{{ m.fournisseur || m.motif || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-right hidden sm:table-cell">{{ m.montant_total_fcfa | currencyFcfa }}</td>
                </tr>
              }
              @empty { <tr><td colspan="5" class="py-8 text-center text-sm text-neutral-400">Aucun mouvement</td></tr> }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class DetailStockComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  stock = signal<Stock | null>(null);
  mouvements = signal<MouvementStock[]>([]);
  cultures = signal<Culture[]>([]);

  mouvementForm = this.fb.group({
    type: ['achat', Validators.required],
    quantite: [null as number | null, [Validators.required, Validators.min(0)]],
    prix_unitaire_fcfa: [null as number | null],
    fournisseur: [''],
    culture_id: [''],
    motif: [''],
    date_mouvement: [new Date().toISOString().split('T')[0], Validators.required],
  });

  montantAchat(): number {
    const q = this.mouvementForm.get('quantite')?.value ?? 0;
    const p = this.mouvementForm.get('prix_unitaire_fcfa')?.value ?? 0;
    return (q as number) * (p as number);
  }

  private stockId!: number;

  ngOnInit(): void {
    this.stockId = +this.route.snapshot.paramMap.get('id')!;
    this.charger();
    this.api.get<Culture[]>('cultures').subscribe(d => this.cultures.set(d));
  }

  charger(): void {
    this.api.get<Stock>(`stocks/${this.stockId}`).subscribe(d => this.stock.set(d));
    this.api.get<MouvementStock[]>(`stocks/${this.stockId}/mouvements`).subscribe(d => this.mouvements.set(d));
  }

  ajouterMouvement(): void {
    if (this.mouvementForm.invalid) { this.mouvementForm.markAllAsTouched(); return; }
    this.api.post(`stocks/${this.stockId}/mouvements`, this.mouvementForm.value).subscribe({
      next: () => { this.toast.success('Mouvement enregistré.'); this.mouvementForm.reset({ type: 'achat', date_mouvement: new Date().toISOString().split('T')[0] }); this.charger(); },
      error: () => {},
    });
  }

  getTypeClass(type: string): string {
    return { achat: 'bg-primary-100 text-primary-700', utilisation: 'bg-accent-100 text-accent-700', perte: 'bg-red-100 text-error', ajustement: 'bg-neutral-100 text-neutral-600' }[type] || '';
  }
}
