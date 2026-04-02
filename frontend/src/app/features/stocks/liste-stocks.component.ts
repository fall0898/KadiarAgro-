import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Stock } from '../../core/models';

@Component({
  selector: 'app-liste-stocks',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-neutral-800">Stocks</h1>
        @if (auth.isAdmin()) {
          <a routerLink="/app/stocks/nouveau" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">+ Nouveau stock</a>
        }
      </div>

      @if (alertes().length > 0) {
        <div class="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4 flex items-center gap-2">
          <span>⚠️</span>
          <p class="text-sm text-warning-dark font-medium">{{ alertes().length }} stock(s) en alerte de seuil</p>
        </div>
      }

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-neutral-100">
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Produit</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Catégorie</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Quantité</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Seuil</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Statut</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            @for (s of stocks(); track s.id) {
              <tr class="hover:bg-neutral-50">
                <td class="px-4 py-3 text-sm font-medium text-neutral-800">{{ s.nom }}</td>
                <td class="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">{{ s.categorie }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-right">{{ s.quantite_actuelle }} {{ s.unite }}</td>
                <td class="px-4 py-3 text-sm text-neutral-500 hidden sm:table-cell">{{ s.seuil_alerte ? s.seuil_alerte + ' ' + s.unite : '-' }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getStatutClass(s)">{{ getStatutLabel(s) }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <a [routerLink]="['/app/stocks', s.id]" class="text-xs text-primary-600 hover:underline mr-2">Détail</a>
                  @if (auth.isAdmin()) {
                    <a [routerLink]="['/app/stocks', s.id, 'modifier']" class="text-xs text-neutral-500 hover:underline">Modifier</a>
                  }
                </td>
              </tr>
            }
            @empty { <tr><td colspan="6" class="py-12 text-center text-sm text-neutral-400">Aucun stock</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ListeStocksComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  stocks = signal<Stock[]>([]);
  alertes = signal<Stock[]>([]);

  ngOnInit(): void {
    this.api.get<Stock[]>('stocks').subscribe(d => this.stocks.set(d));
    this.api.get<Stock[]>('stocks/alertes').subscribe(d => this.alertes.set(d));
  }

  getStatutLabel(s: Stock): string {
    if (!s.seuil_alerte) return 'Normal';
    if (s.quantite_actuelle === 0) return 'Vide';
    if (s.quantite_actuelle <= s.seuil_alerte) return 'Alerte';
    return 'OK';
  }

  getStatutClass(s: Stock): string {
    if (!s.seuil_alerte) return 'bg-neutral-100 text-neutral-600';
    if (s.quantite_actuelle === 0) return 'bg-red-100 text-error';
    if (s.quantite_actuelle <= s.seuil_alerte) return 'bg-warning/20 text-warning-dark';
    return 'bg-primary-100 text-primary-700';
  }
}
