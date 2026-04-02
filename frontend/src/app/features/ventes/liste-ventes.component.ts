import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Vente, Champ, Culture } from '../../core/models';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';

@Component({
  selector: 'app-liste-ventes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyFcfaPipe, DateFrPipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-neutral-800">Ventes</h1>
        @if (auth.isAdmin()) {
          <a routerLink="/app/ventes/nouveau" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">+ Nouvelle vente</a>
        }
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <select [(ngModel)]="filtres.champ_id" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Tous les champs</option>
          @for (c of champs(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
        </select>
        <input type="date" [(ngModel)]="filtres.date_debut" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
        <input type="date" [(ngModel)]="filtres.date_fin" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
        <button (click)="resetFiltres()" class="px-3 py-1.5 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Réinitialiser</button>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-neutral-100">
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Champ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Produit</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Acheteur</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Quantité</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Montant</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            @for (v of ventes(); track v.id) {
              <tr class="hover:bg-neutral-50">
                <td class="px-4 py-3 text-sm text-neutral-600">{{ v.date_vente | dateFr }}</td>
                <td class="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">{{ v.champ?.nom || '-' }}</td>
                <td class="px-4 py-3 text-sm font-medium text-neutral-800">{{ v.produit }}</td>
                <td class="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">{{ v.acheteur || '-' }}</td>
                <td class="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">{{ v.quantite_kg }} kg</td>
                <td class="px-4 py-3 text-sm font-semibold text-primary-600 text-right">{{ v.montant_total_fcfa | currencyFcfa }}</td>
                <td class="px-4 py-3 text-right">
                  <button (click)="telechargerRecu(v.id)" class="text-xs text-accent-600 hover:underline mr-2">PDF</button>
                  @if (auth.isAdmin()) {
                    <a [routerLink]="['/app/ventes', v.id, 'modifier']" class="text-xs text-neutral-500 hover:underline mr-2">Modifier</a>
                    <button (click)="supprimer(v.id)" class="text-xs text-error hover:underline">Suppr.</button>
                  }
                </td>
              </tr>
            }
            @empty { <tr><td colspan="7" class="py-12 text-center text-sm text-neutral-400">Aucune vente</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ListeVentesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  ventes = signal<Vente[]>([]);
  champs = signal<Champ[]>([]);
  filtres = { champ_id: '', date_debut: '', date_fin: '' };

  ngOnInit(): void {
    this.api.get<Champ[]>('champs').subscribe(d => this.champs.set(d));
    this.charger();
  }

  charger(): void {
    this.api.get<Vente[]>('ventes', this.filtres as any).subscribe(d => this.ventes.set(d));
  }

  resetFiltres(): void {
    this.filtres = { champ_id: '', date_debut: '', date_fin: '' };
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

  supprimer(id: number): void {
    if (!confirm('Confirmer la suppression ?')) return;
    this.api.delete(`ventes/${id}`).subscribe({
      next: () => { this.toast.success('Vente supprimée.'); this.charger(); },
    });
  }
}
