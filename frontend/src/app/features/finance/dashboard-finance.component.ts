import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FinanceResume } from '../../core/models';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';

@Component({
  selector: 'app-dashboard-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFcfaPipe],
  template: `
    <div>
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 class="text-xl font-bold text-neutral-800">Finance</h1>
        <div class="flex flex-wrap gap-3 items-center">
          <input type="date" [(ngModel)]="dateDebut" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
          <input type="date" [(ngModel)]="dateFin" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
          <button (click)="charger()" class="px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">Appliquer</button>
          <button (click)="exporterExcel()" class="px-3 py-1.5 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">📊 Exporter Excel</button>
        </div>
      </div>

      @if (resume()) {
        <!-- KPI grands -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-5 text-center">
            <p class="text-sm text-neutral-500 mb-1">Total Ventes</p>
            <p class="text-2xl font-bold text-primary-600">{{ resume()!.total_ventes_fcfa | currencyFcfa }}</p>
            <p class="text-xs text-neutral-400 mt-1">{{ resume()!.nombre_ventes }} vente(s)</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-5 text-center">
            <p class="text-sm text-neutral-500 mb-1">Total Dépenses</p>
            <p class="text-2xl font-bold text-error">{{ resume()!.total_depenses_fcfa | currencyFcfa }}</p>
            <p class="text-xs text-neutral-400 mt-1">{{ resume()!.nombre_depenses }} dépense(s)</p>
          </div>
          <div class="rounded-lg shadow-sm p-5 text-center" [class]="resume()!.solde_net_fcfa >= 0 ? 'bg-primary-50' : 'bg-red-50'">
            <p class="text-sm text-neutral-500 mb-1">Solde Net</p>
            <p class="text-3xl font-bold" [class]="resume()!.solde_net_fcfa >= 0 ? 'text-primary-700' : 'text-error'">
              {{ resume()!.solde_net_fcfa | currencyFcfa }}
            </p>
          </div>
        </div>
      }

      <!-- Par champ -->
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <div class="px-4 py-3 border-b border-neutral-100">
          <h3 class="font-semibold text-neutral-700">Solde par champ</h3>
        </div>
        <table class="w-full">
          <thead><tr class="bg-neutral-50"><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Champ</th><th class="px-4 py-3 text-right text-xs text-neutral-500 uppercase">Ventes</th><th class="px-4 py-3 text-right text-xs text-neutral-500 uppercase">Dépenses</th><th class="px-4 py-3 text-right text-xs text-neutral-500 uppercase">Solde</th></tr></thead>
          <tbody class="divide-y divide-neutral-100">
            @for (row of parChamp(); track row.champ_id) {
              <tr class="hover:bg-neutral-50">
                <td class="px-4 py-3 text-sm font-medium">{{ row.champ_nom }}</td>
                <td class="px-4 py-3 text-sm text-right text-primary-600">{{ row.total_ventes_fcfa | currencyFcfa }}</td>
                <td class="px-4 py-3 text-sm text-right text-error">{{ row.total_depenses_fcfa | currencyFcfa }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-right" [class]="row.solde_net_fcfa >= 0 ? 'text-primary-600' : 'text-error'">{{ row.solde_net_fcfa | currencyFcfa }}</td>
              </tr>
            }
            @empty { <tr><td colspan="4" class="py-8 text-center text-sm text-neutral-400">Aucun champ</td></tr> }
          </tbody>
        </table>
      </div>

      <!-- Par culture -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-4 py-3 border-b border-neutral-100">
          <h3 class="font-semibold text-neutral-700">Ventes par culture</h3>
        </div>
        <table class="w-full">
          <thead><tr class="bg-neutral-50"><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase">Culture</th><th class="px-4 py-3 text-left text-xs text-neutral-500 uppercase hidden md:table-cell">Champ</th><th class="px-4 py-3 text-right text-xs text-neutral-500 uppercase">Ventes</th></tr></thead>
          <tbody class="divide-y divide-neutral-100">
            @for (row of parCulture(); track row.culture_id) {
              <tr class="hover:bg-neutral-50">
                <td class="px-4 py-3 text-sm font-medium">{{ row.culture_nom }}</td>
                <td class="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">{{ row.champ_nom || '-' }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-right text-primary-600">{{ row.total_ventes_fcfa | currencyFcfa }}</td>
              </tr>
            }
            @empty { <tr><td colspan="3" class="py-8 text-center text-sm text-neutral-400">Aucune culture</td></tr> }
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

  dateDebut: string;
  dateFin: string;

  constructor() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();
    // Campagne agricole : octobre → septembre
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
  }

  exporterExcel(): void {
    const params = `?date_debut=${this.dateDebut}&date_fin=${this.dateFin}`;
    this.api.getBlob(`finance/export-excel${params}`).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `finance-${this.dateDebut}-${this.dateFin}.xlsx`; a.click();
      URL.revokeObjectURL(url);
    });
  }
}
