import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardKpis, Depense, Vente, Stock, Tache } from '../../core/models';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFcfaPipe, DateFrPipe],
  template: `
    <div>
      <h1 class="text-xl font-bold text-neutral-800 mb-6">Tableau de bord</h1>

      <!-- KPI Cards -->
      @if (kpis) {
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <p class="text-xs text-neutral-500 font-medium uppercase tracking-wide">Total Ventes</p>
            <p class="text-xl font-bold text-primary-600 mt-1">{{ kpis.total_ventes_fcfa | currencyFcfa }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <p class="text-xs text-neutral-500 font-medium uppercase tracking-wide">Total Dépenses</p>
            <p class="text-xl font-bold text-error mt-1">{{ kpis.total_depenses_fcfa | currencyFcfa }}</p>
          </div>
          <div class="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            [class]="kpis.solde_net_fcfa >= 0 ? 'bg-primary-50' : 'bg-red-50'">
            <p class="text-xs text-neutral-500 font-medium uppercase tracking-wide">Solde Net</p>
            <p class="text-xl font-bold mt-1" [class]="kpis.solde_net_fcfa >= 0 ? 'text-primary-700' : 'text-error'">
              {{ kpis.solde_net_fcfa | currencyFcfa }}
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <p class="text-xs text-neutral-500 font-medium uppercase tracking-wide">Champs</p>
            <p class="text-xl font-bold text-neutral-800 mt-1">{{ kpis.nombre_champs }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <p class="text-xs text-neutral-500 font-medium uppercase tracking-wide">Cultures en cours</p>
            <p class="text-xl font-bold text-accent-600 mt-1">{{ kpis.nombre_cultures_en_cours }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <p class="text-xs text-neutral-500 font-medium uppercase tracking-wide">Employés actifs</p>
            <p class="text-xl font-bold text-secondary-600 mt-1">{{ kpis.nombre_employes_actifs }}</p>
          </div>
        </div>
      }

      <!-- Stock Alerts -->
      @if (stocksAlertes.length > 0) {
        <div class="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-warning-dark mb-2">⚠️ Stocks en alerte ({{ stocksAlertes.length }})</h3>
          <div class="flex flex-wrap gap-2">
            @for (stock of stocksAlertes; track stock.id) {
              <span class="bg-warning/20 text-warning-dark px-2 py-0.5 rounded text-xs font-medium">
                {{ stock.nom }}: {{ stock.quantite_actuelle }} {{ stock.unite }}
              </span>
            }
          </div>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Dernières dépenses -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <h3 class="font-semibold text-neutral-700">Dernières dépenses</h3>
            <a routerLink="/app/depenses" class="text-xs text-primary-600 hover:underline">Voir tout</a>
          </div>
          <div class="divide-y divide-neutral-100">
            @for (d of depensesRecentes; track d.id) {
              <div class="px-4 py-3 flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-neutral-700">{{ d.description }}</p>
                  <p class="text-xs text-neutral-400">{{ d.date_depense | dateFr }} • {{ d.categorie }}</p>
                </div>
                <span class="text-sm font-semibold text-error">{{ d.montant_fcfa | currencyFcfa }}</span>
              </div>
            }
            @empty {
              <p class="px-4 py-8 text-center text-sm text-neutral-400">Aucune dépense</p>
            }
          </div>
        </div>

        <!-- Dernières ventes -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <h3 class="font-semibold text-neutral-700">Dernières ventes</h3>
            <a routerLink="/app/ventes" class="text-xs text-primary-600 hover:underline">Voir tout</a>
          </div>
          <div class="divide-y divide-neutral-100">
            @for (v of ventesRecentes; track v.id) {
              <div class="px-4 py-3 flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-neutral-700">{{ v.produit }}</p>
                  <p class="text-xs text-neutral-400">{{ v.date_vente | dateFr }} • {{ v.acheteur || '-' }}</p>
                </div>
                <span class="text-sm font-semibold text-primary-600">{{ v.montant_total_fcfa | currencyFcfa }}</span>
              </div>
            }
            @empty {
              <p class="px-4 py-8 text-center text-sm text-neutral-400">Aucune vente</p>
            }
          </div>
        </div>

        <!-- Tâches en cours -->
        <div class="bg-white rounded-lg shadow-sm lg:col-span-2">
          <div class="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <h3 class="font-semibold text-neutral-700">Tâches en cours</h3>
            <a routerLink="/app/taches" class="text-xs text-primary-600 hover:underline">Voir tout</a>
          </div>
          <div class="divide-y divide-neutral-100">
            @for (t of tachesEnCours.slice(0, 5); track t.id) {
              <div class="px-4 py-3 flex items-center gap-4">
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-700">{{ t.titre }}</p>
                  <p class="text-xs text-neutral-400">{{ t.employe?.nom }} • {{ t.date_debut | dateFr }}</p>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                  [class]="t.statut === 'en_cours' ? 'bg-primary-100 text-primary-700' : 'bg-accent-100 text-accent-700'">
                  {{ t.statut === 'a_faire' ? 'À faire' : 'En cours' }}
                </span>
              </div>
            }
            @empty {
              <p class="px-4 py-8 text-center text-sm text-neutral-400">Aucune tâche</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  kpis: DashboardKpis | null = null;
  depensesRecentes: Depense[] = [];
  ventesRecentes: Vente[] = [];
  stocksAlertes: Stock[] = [];
  tachesEnCours: Tache[] = [];

  ngOnInit(): void {
    this.api.get<DashboardKpis>('dashboard/kpis').subscribe(d => this.kpis = d);
    this.api.get<Depense[]>('dashboard/depenses-recentes').subscribe(d => this.depensesRecentes = d);
    this.api.get<Vente[]>('dashboard/ventes-recentes').subscribe(d => this.ventesRecentes = d);
    this.api.get<Stock[]>('dashboard/stocks-alertes').subscribe(d => this.stocksAlertes = d);
    this.api.get<Tache[]>('dashboard/taches-en-cours').subscribe(d => this.tachesEnCours = d);
  }
}
