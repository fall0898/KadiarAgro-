import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { FinanceResume, Depense, CATEGORIES_DEPENSES } from '../../core/models';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';

@Component({
  selector: 'app-dashboard-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFcfaPipe, BaseChartDirective],
  template: `
    <div>
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-xl font-bold text-neutral-800">Finance</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Recettes = ventes agricoles + remboursements de financements</p>
        </div>
        <div class="flex flex-wrap gap-3 items-center">
          <input type="date" [(ngModel)]="dateDebut" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
          <input type="date" [(ngModel)]="dateFin" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
          <button (click)="charger()" class="px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">Appliquer</button>
          <button (click)="exporterExcel()" class="px-3 py-1.5 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">📊 Exporter Excel</button>
        </div>
      </div>

      @if (resume()) {
        <!-- KPI cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-neutral-200 p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-neutral-700">Total Recettes</p>
            </div>
            <p class="text-2xl font-bold text-primary-600">{{ resume()!.total_ventes_fcfa | currencyFcfa }}</p>
            <p class="text-xs text-neutral-400 mt-1">{{ resume()!.nombre_ventes }} recette(s)</p>
          </div>

          <div class="bg-white rounded-xl border border-neutral-200 p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-neutral-700">Total Dépenses</p>
            </div>
            <p class="text-2xl font-bold text-red-500">{{ resume()!.total_depenses_fcfa | currencyFcfa }}</p>
            <p class="text-xs text-neutral-400 mt-1">{{ resume()!.nombre_depenses }} dépense(s)</p>
          </div>

          <div class="rounded-xl border p-5" [class]="resume()!.solde_net_fcfa >= 0 ? 'bg-primary-50 border-primary-200' : 'bg-red-50 border-red-200'">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center" [class]="resume()!.solde_net_fcfa >= 0 ? 'bg-primary-100' : 'bg-red-100'">
                <svg class="w-5 h-5" [class]="resume()!.solde_net_fcfa >= 0 ? 'text-primary-700' : 'text-red-600'" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
              </div>
              <p class="text-sm font-semibold text-neutral-700">Solde Net</p>
            </div>
            <p class="text-2xl font-bold" [class]="resume()!.solde_net_fcfa >= 0 ? 'text-primary-700' : 'text-red-600'">
              {{ resume()!.solde_net_fcfa | currencyFcfa }}
            </p>
            <p class="text-xs text-neutral-400 mt-1">Recettes − Dépenses</p>
          </div>
        </div>
      }

      <!-- Doughnut chart + par champ côte à côte -->
      <div class="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">

        <!-- Doughnut dépenses par catégorie -->
        <div class="xl:col-span-2 bg-white rounded-xl border border-neutral-200 p-5">
          <h3 class="font-semibold text-neutral-800 mb-4">Répartition des dépenses</h3>
          @if (donutChartData.labels && donutChartData.labels.length > 0) {
            <div class="h-52">
              <canvas baseChart [data]="donutChartData" [options]="donutChartOptions" type="doughnut"></canvas>
            </div>
            <!-- Légende custom scrollable -->
            <div class="mt-3 space-y-1 max-h-32 overflow-y-auto">
              @for (item of donutLegende(); track item.label) {
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" [style.background]="item.color"></span>
                    <span class="text-neutral-600 truncate max-w-[140px]">{{ item.label }}</span>
                  </div>
                  <span class="font-semibold text-neutral-700 ml-2">{{ item.montant | currencyFcfa }}</span>
                </div>
              }
            </div>
          } @else {
            <div class="h-52 flex items-center justify-center">
              <div class="animate-pulse w-40 h-40 rounded-full bg-neutral-100"></div>
            </div>
          }
        </div>

        <!-- Par exploitation -->
        <div class="xl:col-span-3 bg-white rounded-xl border border-neutral-200">
          <div class="px-5 py-4 border-b border-neutral-100">
            <h3 class="font-semibold text-neutral-800">Recettes & Dépenses par exploitation</h3>
          </div>
          <table class="w-full">
            <thead>
              <tr class="bg-neutral-50">
                <th class="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Exploitation</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">Recettes</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">Dépenses</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">Solde</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              @for (row of parChamp(); track row.champ_id) {
                <tr class="hover:bg-neutral-50 transition-colors">
                  <td class="px-5 py-3 text-sm font-medium text-neutral-800">{{ row.champ_nom }}</td>
                  <td class="px-5 py-3 text-sm text-right text-primary-600 font-medium">{{ row.total_ventes_fcfa | currencyFcfa }}</td>
                  <td class="px-5 py-3 text-sm text-right text-red-500 font-medium">{{ row.total_depenses_fcfa | currencyFcfa }}</td>
                  <td class="px-5 py-3 text-sm font-bold text-right" [class]="row.solde_net_fcfa >= 0 ? 'text-primary-600' : 'text-red-500'">
                    {{ row.solde_net_fcfa | currencyFcfa }}
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="4" class="py-8 text-center text-sm text-neutral-400">Aucune exploitation</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Par culture -->
      <div class="bg-white rounded-xl border border-neutral-200">
        <div class="px-5 py-4 border-b border-neutral-100">
          <h3 class="font-semibold text-neutral-800">Recettes par culture</h3>
        </div>
        <table class="w-full">
          <thead>
            <tr class="bg-neutral-50">
              <th class="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Culture</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Exploitation</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">Recettes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            @for (row of parCulture(); track row.culture_id) {
              <tr class="hover:bg-neutral-50 transition-colors">
                <td class="px-5 py-3 text-sm font-medium text-neutral-800">{{ row.culture_nom }}</td>
                <td class="px-5 py-3 text-sm text-neutral-500 hidden md:table-cell">{{ row.champ_nom || '-' }}</td>
                <td class="px-5 py-3 text-sm font-bold text-right text-primary-600">{{ row.total_ventes_fcfa | currencyFcfa }}</td>
              </tr>
            }
            @empty {
              <tr><td colspan="3" class="py-8 text-center text-sm text-neutral-400">Aucune culture</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DashboardFinanceComponent implements OnInit {
  private api = inject(ApiService);

  resume = signal<FinanceResume | null>(null);
  parChamp = signal<any[]>([]);
  parCulture = signal<any[]>([]);

  private readonly PALETTE = [
    '#16a34a','#ef4444','#f59e0b','#3b82f6','#8b5cf6','#ec4899',
    '#14b8a6','#f97316','#84cc16','#06b6d4','#a78bfa','#fb7185',
  ];

  donutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  private _donutLegende: { label: string; color: string; montant: number }[] = [];

  donutLegende() { return this._donutLegende; }

  donutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${Number(ctx.raw).toLocaleString('fr-FR')} FCFA`,
        }
      }
    }
  };

  dateDebut: string;
  dateFin: string;

  constructor() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    if (month >= 10) {
      this.dateDebut = `${year}-10-01`;
      this.dateFin   = `${year + 1}-09-30`;
    } else {
      this.dateDebut = `${year - 1}-10-01`;
      this.dateFin   = `${year}-09-30`;
    }
  }

  ngOnInit(): void { this.charger(); }

  charger(): void {
    const params = { date_debut: this.dateDebut, date_fin: this.dateFin };
    this.api.get<FinanceResume>('finance/resume', params).subscribe(d => this.resume.set(d));
    this.api.get<any[]>('finance/par-champ', params).subscribe(d => this.parChamp.set(d));
    this.api.get<any[]>('finance/par-culture', params).subscribe(d => this.parCulture.set(d));

    // Dépenses pour doughnut
    this.api.get<Depense[]>('depenses', params as any).subscribe(depenses => {
      const totaux: Record<string, number> = {};
      for (const d of depenses) {
        totaux[d.categorie] = (totaux[d.categorie] || 0) + d.montant_fcfa;
      }
      const sorted = Object.entries(totaux).sort((a, b) => b[1] - a[1]);
      const labels = sorted.map(([cat]) => {
        const found = CATEGORIES_DEPENSES.find(c => c.value === cat);
        return found ? found.label : cat;
      });
      const data = sorted.map(([, v]) => v);
      const colors = sorted.map((_, i) => this.PALETTE[i % this.PALETTE.length]);

      this.donutChartData = {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }]
      };
      this._donutLegende = sorted.map(([cat, montant], i) => ({
        label: labels[i],
        color: colors[i],
        montant,
      }));
    });
  }

  exporterExcel(): void {
    const params = `?date_debut=${this.dateDebut}&date_fin=${this.dateFin}`;
    this.api.getBlob(`finance/export-excel${params}`).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-${this.dateDebut}-${this.dateFin}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
