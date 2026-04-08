import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Depense, Champ, CATEGORIES_DEPENSES } from '../../core/models';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';

@Component({
  selector: 'app-liste-depenses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyFcfaPipe, DateFrPipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-neutral-800">Dépenses</h1>
        @if (auth.isAdmin()) {
          <a routerLink="/app/depenses/nouveau" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            + Nouvelle dépense
          </a>
        }
      </div>

      <!-- Total en évidence -->
      @if (depenses().length > 0) {
        <div class="bg-error/10 border border-error/30 rounded-lg px-5 py-4 mb-4 flex items-center justify-between">
          <div>
            <p class="text-sm text-neutral-600">Total des dépenses affichées</p>
            <p class="text-2xl font-bold text-error mt-0.5">{{ total() | currencyFcfa }}</p>
          </div>
          <span class="text-3xl opacity-20">💸</span>
        </div>
      }

      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <select [(ngModel)]="filtres.champ_id" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Toutes les exploitations</option>
          <option value="sans">Sans exploitation</option>
          @for (c of champs(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
        </select>
        <select [(ngModel)]="filtres.categorie" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Toutes catégories</option>
          @for (cat of categories; track cat.value) { <option [value]="cat.value">{{ cat.label }}</option> }
        </select>
        <input type="date" [(ngModel)]="filtres.date_debut" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" placeholder="Du" />
        <input type="date" [(ngModel)]="filtres.date_fin" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" placeholder="Au" />
        <button (click)="resetFiltres()" class="px-3 py-1.5 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Réinitialiser</button>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-neutral-100">
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Champ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Catégorie</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Description</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Montant</th>
              @if (auth.isAdmin()) { <th class="px-4 py-3"></th> }
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            @for (d of depenses(); track d.id) {
              <tr class="hover:bg-neutral-50 transition-colors" [class]="d.est_auto_generee ? 'opacity-75' : ''">
                <td class="px-4 py-3 text-sm text-neutral-600">{{ d.date_depense | dateFr }}</td>
                <td class="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">{{ d.champ?.nom || '-' }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">{{ getCatLabel(d.categorie) }}</span>
                  @if (d.est_auto_generee) { <span class="text-xs text-neutral-400 ml-1">⚙ auto</span> }
                </td>
                <td class="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">{{ d.description }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-error text-right">{{ d.montant_fcfa | currencyFcfa }}</td>
                @if (auth.isAdmin()) {
                  <td class="px-4 py-3 text-right">
                    @if (!d.est_auto_generee) {
                      <a [routerLink]="['/app/depenses', d.id, 'modifier']" class="text-xs text-accent-600 hover:underline mr-2">Modifier</a>
                      <button (click)="supprimer(d)" class="text-xs text-error hover:underline">Suppr.</button>
                    }
                  </td>
                }
              </tr>
            }
            @empty { <tr><td [attr.colspan]="auth.isAdmin() ? 6 : 5" class="py-12 text-center text-sm text-neutral-400">Aucune dépense</td></tr> }
          </tbody>
          <tfoot class="bg-neutral-50 border-t-2 border-neutral-200">
            <tr>
              <td [attr.colspan]="auth.isAdmin() ? 4 : 4" class="px-4 py-3 text-sm font-semibold text-neutral-700">Total</td>
              <td class="px-4 py-3 text-sm font-bold text-error text-right">{{ total() | currencyFcfa }}</td>
              @if (auth.isAdmin()) { <td></td> }
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
})
export class ListeDepensesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  depenses = signal<Depense[]>([]);
  champs = signal<Champ[]>([]);
  categories = CATEGORIES_DEPENSES;
  filtres = { champ_id: '', categorie: '', date_debut: '', date_fin: '' };

  total = computed(() => this.depenses().reduce((sum, d) => sum + d.montant_fcfa, 0));

  ngOnInit(): void {
    this.api.get<Champ[]>('champs').subscribe(d => this.champs.set(d));
    this.charger();
  }

  charger(): void {
    this.api.get<Depense[]>('depenses', this.filtres as any).subscribe(d => this.depenses.set(d));
  }

  resetFiltres(): void {
    this.filtres = { champ_id: '', categorie: '', date_debut: '', date_fin: '' };
    this.charger();
  }

  supprimer(d: Depense): void {
    const msg = `Supprimer "${d.description}" (${d.montant_fcfa.toLocaleString('fr-FR')} FCFA) ?`;
    if (!confirm(msg)) return;
    this.api.delete(`depenses/${d.id}`).subscribe({
      next: () => { this.toast.success('Dépense supprimée.'); this.charger(); },
    });
  }

  getCatLabel(val: string): string {
    return CATEGORIES_DEPENSES.find(c => c.value === val)?.label ?? val;
  }
}
