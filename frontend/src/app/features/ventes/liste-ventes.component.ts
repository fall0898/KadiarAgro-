import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Vente, Champ } from '../../core/models';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';

@Component({
  selector: 'app-liste-ventes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyFcfaPipe, DateFrPipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-neutral-800">Ventes & Recettes</h1>
          <p class="text-sm text-neutral-500 mt-0.5">Ventes agricoles + remboursements de financements</p>
        </div>
        @if (auth.isAdmin()) {
          <a routerLink="/app/ventes/nouveau" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">+ Nouvelle vente</a>
        }
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-xl border border-neutral-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <select [(ngModel)]="filtres.champ_id" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Tous les champs</option>
          @for (c of champs(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
        </select>
        <select [(ngModel)]="filtreType" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Tous types</option>
          <option value="vente">Ventes agricoles</option>
          <option value="remboursement">Remboursements</option>
        </select>
        <input type="date" [(ngModel)]="filtres.date_debut" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
        <input type="date" [(ngModel)]="filtres.date_fin" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
        <button (click)="resetFiltres()" class="px-3 py-1.5 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Réinitialiser</button>
        <span class="ml-auto text-sm text-neutral-500 font-medium">
          {{ ventesFiltrees().length }} entrée(s) · Total : <span class="text-primary-600 font-semibold">{{ totalFiltrees() | currencyFcfa }}</span>
        </span>
      </div>

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="px-5 py-4 flex gap-4 border-b border-neutral-100 animate-pulse">
              <div class="h-4 bg-neutral-200 rounded w-24"></div>
              <div class="h-4 bg-neutral-200 rounded flex-1"></div>
              <div class="h-4 bg-neutral-200 rounded w-32"></div>
            </div>
          }
        </div>
      } @else {
        <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="bg-neutral-50 border-b border-neutral-200">
                <th class="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Date</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Champ</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Produit / Nature</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Acheteur</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide">Montant</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              @for (v of ventesFiltrees(); track v.id) {
                <tr class="hover:bg-neutral-50 transition-colors" [class]="v.est_auto_generee ? 'bg-blue-50/30' : ''">
                  <td class="px-5 py-3 text-sm text-neutral-600">{{ v.date_vente | dateFr }}</td>
                  <td class="px-5 py-3 text-sm text-neutral-600 hidden md:table-cell">{{ v.champ?.nom || '-' }}</td>
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-neutral-800">{{ v.est_auto_generee ? v.acheteur : v.produit }}</span>
                      @if (v.est_auto_generee) {
                        <span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex-shrink-0">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/></svg>
                          Remboursement
                        </span>
                      }
                    </div>
                    @if (!v.est_auto_generee && v.produit) {
                      <p class="text-xs text-neutral-400 mt-0.5">{{ v.quantite_kg }} kg · {{ v.prix_unitaire_fcfa | currencyFcfa }}/kg</p>
                    }
                  </td>
                  <td class="px-5 py-3 text-sm text-neutral-600 hidden sm:table-cell">{{ v.acheteur || '-' }}</td>
                  <td class="px-5 py-3 text-sm font-bold text-right text-primary-600">+{{ v.montant_total_fcfa | currencyFcfa }}</td>
                  <td class="px-5 py-3 text-right">
                    @if (!v.est_auto_generee) {
                      <button (click)="telechargerRecu(v.id)" class="text-xs text-accent-600 hover:underline mr-2">PDF</button>
                      @if (auth.isAdmin()) {
                        <a [routerLink]="['/app/ventes', v.id, 'modifier']" class="text-xs text-neutral-500 hover:underline mr-2">Modifier</a>
                        <button (click)="supprimer(v)" class="text-xs text-red-500 hover:underline">Suppr.</button>
                      }
                    } @else {
                      <span class="text-xs text-neutral-400 italic">auto</span>
                    }
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="6" class="py-12 text-center text-sm text-neutral-400">Aucune entrée pour ces filtres</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class ListeVentesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  ventes = signal<Vente[]>([]);
  champs = signal<Champ[]>([]);
  loading = signal(true);
  filtres = { champ_id: '', date_debut: '', date_fin: '' };
  filtreType = '';

  ventesFiltrees() {
    let v = this.ventes();
    if (this.filtreType === 'vente') v = v.filter(x => !x.est_auto_generee);
    if (this.filtreType === 'remboursement') v = v.filter(x => x.est_auto_generee);
    return v;
  }

  totalFiltrees() {
    return this.ventesFiltrees().reduce((s, v) => s + v.montant_total_fcfa, 0);
  }

  ngOnInit(): void {
    this.api.get<Champ[]>('champs').subscribe(d => this.champs.set(d));
    this.charger();
  }

  charger(): void {
    this.loading.set(true);
    this.api.get<Vente[]>('ventes', this.filtres as any).subscribe(d => {
      this.ventes.set(d);
      this.loading.set(false);
    });
  }

  resetFiltres(): void {
    this.filtres = { champ_id: '', date_debut: '', date_fin: '' };
    this.filtreType = '';
    this.charger();
  }

  telechargerRecu(id: number): void {
    this.api.getBlob(`ventes/${id}/recu-pdf`).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `recu-VNT-${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    });
  }

  supprimer(vente: Vente): void {
    if (vente.est_auto_generee) return;
    if (!confirm(`Supprimer la vente "${vente.produit}" de ${vente.montant_total_fcfa.toLocaleString('fr-FR')} FCFA ?`)) return;
    this.api.delete(`ventes/${vente.id}`).subscribe({
      next: () => { this.toast.success('Vente supprimée.'); this.charger(); },
    });
  }
}
