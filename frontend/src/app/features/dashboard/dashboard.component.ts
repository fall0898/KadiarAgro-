import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { DashboardKpis, Depense, Vente, Stock, Financement } from '../../core/models';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';

interface FinanceParChamp {
  champ_nom: string;
  total_ventes_fcfa: number;
  total_depenses_fcfa: number;
  solde_net_fcfa: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFcfaPipe, DateFrPipe, BaseChartDirective],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-neutral-800">Tableau de bord</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Campagne agricole en cours</p>
        </div>
      </div>

      <!-- KPI Cards -->
      @if (kpis) {
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">

          <div class="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
            <div class="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/>
              </svg>
            </div>
            <p class="text-xs text-neutral-500 font-medium">Total Recettes</p>
            <p class="text-lg font-bold text-primary-600 mt-0.5 leading-tight">{{ kpis.total_ventes_fcfa | currencyFcfa }}</p>
          </div>

          <div class="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
            <div class="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/>
              </svg>
            </div>
            <p class="text-xs text-neutral-500 font-medium">Total Dépenses</p>
            <p class="text-lg font-bold text-red-500 mt-0.5 leading-tight">{{ kpis.total_depenses_fcfa | currencyFcfa }}</p>
          </div>

          <div class="rounded-xl border p-4 hover:shadow-md transition-shadow"
            [class]="kpis.solde_net_fcfa >= 0 ? 'bg-primary-50 border-primary-200' : 'bg-red-50 border-red-200'">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3" [class]="kpis.solde_net_fcfa >= 0 ? 'bg-primary-100' : 'bg-red-100'">
              <svg class="w-5 h-5" [class]="kpis.solde_net_fcfa >= 0 ? 'text-primary-700' : 'text-red-600'" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
            </div>
            <p class="text-xs text-neutral-500 font-medium">Solde Net</p>
            <p class="text-lg font-bold mt-0.5 leading-tight" [class]="kpis.solde_net_fcfa >= 0 ? 'text-primary-700' : 'text-red-600'">
              {{ kpis.solde_net_fcfa | currencyFcfa }}
            </p>
          </div>

          <div class="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
            <div class="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/>
              </svg>
            </div>
            <p class="text-xs text-neutral-500 font-medium">Champs</p>
            <p class="text-2xl font-bold text-neutral-800 mt-0.5">{{ kpis.nombre_champs }}</p>
          </div>

          <div class="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
            <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
              </svg>
            </div>
            <p class="text-xs text-neutral-500 font-medium">Cultures actives</p>
            <p class="text-2xl font-bold text-blue-600 mt-0.5">{{ kpis.nombre_cultures_en_cours }}</p>
          </div>

          <div class="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
            <div class="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"/>
              </svg>
            </div>
            <p class="text-xs text-neutral-500 font-medium">Employés actifs</p>
            <p class="text-2xl font-bold text-purple-600 mt-0.5">{{ kpis.nombre_employes_actifs }}</p>
          </div>
        </div>
      }

      <!-- Stock Alerts -->
      @if (stocksAlertes.length > 0) {
        <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
          </svg>
          <div>
            <p class="text-sm font-semibold text-amber-800">{{ stocksAlertes.length }} stock(s) en alerte</p>
            <div class="flex flex-wrap gap-1.5 mt-1.5">
              @for (stock of stocksAlertes; track stock.id) {
                <span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-xs font-medium border border-amber-200">
                  {{ stock.nom }}: {{ stock.quantite_actuelle }} {{ stock.unite }}
                </span>
              }
            </div>
          </div>
        </div>
      }

      <!-- Alerte financements en cours -->
      @if (financementsEnCours.length > 0) {
        <div class="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6">
          <svg class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-orange-800">
                {{ financementsEnCours.length }} financement(s) en attente de remboursement
              </p>
              <a routerLink="/app/employes" class="text-xs text-orange-700 underline font-medium">Gérer →</a>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-1.5">
              @for (f of financementsEnCours; track f.id) {
                <span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md text-xs font-medium border border-orange-200">
                  {{ f.employe?.nom }} : {{ (f.montant_fcfa - f.montant_rembourse_fcfa) | currencyFcfa }} restant
                </span>
              }
            </div>
            <p class="text-xs text-orange-600 mt-1.5 font-semibold">
              Total restant dû : {{ totalRestantDu() | currencyFcfa }}
            </p>
          </div>
        </div>
      }

      <!-- Chart + Synthèse -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        <!-- Bar Chart par champ -->
        <div class="xl:col-span-2 bg-white rounded-xl border border-neutral-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-neutral-800">Recettes vs Dépenses par exploitation</h3>
            <a routerLink="/app/finance" class="text-xs text-primary-600 hover:underline font-medium">Détail →</a>
          </div>
          @if (barChartData.labels && barChartData.labels.length > 0) {
            <div class="h-56">
              <canvas baseChart [data]="barChartData" [options]="barChartOptions" type="bar"></canvas>
            </div>
          } @else {
            <div class="h-56 flex items-center justify-center">
              <div class="animate-pulse flex flex-col items-center gap-2">
                <div class="h-40 w-full bg-neutral-100 rounded"></div>
              </div>
            </div>
          }
        </div>

        <!-- Synthèse financière -->
        <div class="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col">
          <h3 class="font-semibold text-neutral-800 mb-4">Synthèse financière</h3>
          @if (kpis) {
            <div class="space-y-2 flex-1">
              <div class="flex items-center justify-between py-2 border-b border-neutral-100">
                <span class="text-sm text-neutral-600">Recettes</span>
                <span class="text-sm font-semibold text-primary-600">{{ kpis.total_ventes_fcfa | currencyFcfa }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-neutral-100">
                <span class="text-sm text-neutral-600">Charges</span>
                <span class="text-sm font-semibold text-red-500">{{ kpis.total_depenses_fcfa | currencyFcfa }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-neutral-100">
                <span class="text-sm text-neutral-600">Financements en cours</span>
                <span class="text-sm font-semibold text-orange-500">{{ totalRestantDu() | currencyFcfa }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm font-semibold text-neutral-800">Résultat net</span>
                <span class="text-sm font-bold" [class]="kpis.solde_net_fcfa >= 0 ? 'text-primary-700' : 'text-red-600'">
                  {{ kpis.solde_net_fcfa | currencyFcfa }}
                </span>
              </div>
            </div>
            @if (kpis.total_ventes_fcfa > 0) {
              <div class="mt-4">
                <div class="flex justify-between text-xs text-neutral-500 mb-1">
                  <span>Taux de charges</span>
                  <span>{{ tauxCharges() }}%</span>
                </div>
                <div class="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                    [style.width.%]="tauxCharges()"
                    [class]="tauxCharges() > 80 ? 'bg-red-400' : tauxCharges() > 60 ? 'bg-amber-400' : 'bg-primary-500'">
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Dernières dépenses + ventes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div class="bg-white rounded-xl border border-neutral-200">
          <div class="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 class="font-semibold text-neutral-800">Dernières dépenses</h3>
            <a routerLink="/app/depenses" class="text-xs text-primary-600 hover:underline font-medium">Voir tout →</a>
          </div>
          <div class="divide-y divide-neutral-50">
            @for (d of depensesRecentes; track d.id) {
              <div class="px-5 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-neutral-700 truncate">{{ d.description }}</p>
                  <p class="text-xs text-neutral-400 mt-0.5">{{ d.date_depense | dateFr }} · <span class="capitalize">{{ d.categorie }}</span></p>
                </div>
                <span class="text-sm font-semibold text-red-500 ml-3 flex-shrink-0">-{{ d.montant_fcfa | currencyFcfa }}</span>
              </div>
            }
            @empty { <p class="px-5 py-10 text-center text-sm text-neutral-400">Aucune dépense récente</p> }
          </div>
        </div>

        <div class="bg-white rounded-xl border border-neutral-200">
          <div class="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 class="font-semibold text-neutral-800">Dernières recettes</h3>
            <a routerLink="/app/ventes" class="text-xs text-primary-600 hover:underline font-medium">Voir tout →</a>
          </div>
          <div class="divide-y divide-neutral-50">
            @for (v of ventesRecentes; track v.id) {
              <div class="px-5 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-neutral-700 truncate">{{ v.est_auto_generee ? v.acheteur : v.produit }}</p>
                  <p class="text-xs text-neutral-400 mt-0.5">
                    {{ v.date_vente | dateFr }}
                    @if (v.est_auto_generee) { · <span class="text-blue-500">Remboursement</span> }
                    @else { · {{ v.acheteur || '-' }} }
                  </p>
                </div>
                <span class="text-sm font-semibold text-primary-600 ml-3 flex-shrink-0">+{{ v.montant_total_fcfa | currencyFcfa }}</span>
              </div>
            }
            @empty { <p class="px-5 py-10 text-center text-sm text-neutral-400">Aucune recette récente</p> }
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
  financementsEnCours: Financement[] = [];

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, usePointStyle: true, padding: 16 } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('fr-FR')} FCFA`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        grid: { color: '#f5f5f4' },
        ticks: { font: { size: 10 }, callback: (v) => `${Number(v).toLocaleString('fr-FR')}` }
      }
    }
  };

  tauxCharges(): number {
    if (!this.kpis || this.kpis.total_ventes_fcfa === 0) return 0;
    return Math.min(100, Math.round((this.kpis.total_depenses_fcfa / this.kpis.total_ventes_fcfa) * 100));
  }

  totalRestantDu(): number {
    return this.financementsEnCours.reduce((s, f) => s + (f.montant_fcfa - f.montant_rembourse_fcfa), 0);
  }

  ngOnInit(): void {
    this.api.get<DashboardKpis>('dashboard/kpis').subscribe(d => this.kpis = d);
    this.api.get<Depense[]>('dashboard/depenses-recentes').subscribe(d => this.depensesRecentes = d);
    this.api.get<Vente[]>('dashboard/ventes-recentes').subscribe(d => this.ventesRecentes = d);
    this.api.get<Stock[]>('dashboard/stocks-alertes').subscribe(d => this.stocksAlertes = d);
    this.api.get<Financement[]>('financements').subscribe(d => {
      this.financementsEnCours = d.filter(f => f.statut !== 'rembourse');
    });
    this.api.get<FinanceParChamp[]>('finance/par-champ').subscribe(data => {
      this.barChartData = {
        labels: data.map(d => d.champ_nom),
        datasets: [
          { label: 'Recettes', data: data.map(d => d.total_ventes_fcfa), backgroundColor: 'rgba(34,197,94,0.75)', borderRadius: 6, borderSkipped: false },
          { label: 'Dépenses', data: data.map(d => d.total_depenses_fcfa), backgroundColor: 'rgba(239,68,68,0.65)', borderRadius: 6, borderSkipped: false },
        ]
      };
    });
  }
}
