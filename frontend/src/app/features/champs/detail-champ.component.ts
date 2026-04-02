import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Champ, Culture, Depense, Vente } from '../../core/models';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';

@Component({
  selector: 'app-detail-champ',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFcfaPipe, DateFrPipe],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/app/champs" class="text-neutral-400 hover:text-neutral-600 text-sm">← Champs</a>
        <span class="text-neutral-300">/</span>
        <h1 class="text-xl font-bold text-neutral-800">{{ champ()?.nom }}</h1>
        @if (auth.isAdmin() && champ()) {
          <a [routerLink]="['/app/champs', champ()!.id, 'modifier']"
            class="ml-auto text-sm border border-neutral-300 text-neutral-600 px-3 py-1.5 rounded-md hover:bg-neutral-50">
            Modifier
          </a>
        }
      </div>

      @if (champ()) {
        <!-- Info card -->
        <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p class="text-xs text-neutral-500">Superficie</p><p class="font-semibold">{{ champ()!.superficie_ha }} ha</p></div>
            <div><p class="text-xs text-neutral-500">Localisation</p><p class="font-semibold">{{ champ()!.localisation || '-' }}</p></div>
            <div><p class="text-xs text-neutral-500">Statut</p>
              <span class="text-xs px-2 py-0.5 rounded-full" [class]="champ()!.est_actif ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-neutral-500'">
                {{ champ()!.est_actif ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            <div><p class="text-xs text-neutral-500">Résumé financier</p>
              <p class="font-semibold" [class]="(finance()?.solde_net_fcfa ?? 0) >= 0 ? 'text-primary-600' : 'text-error'">
                {{ finance()?.solde_net_fcfa | currencyFcfa }}
              </p>
            </div>
          </div>
          @if (champ()!.description) {
            <p class="text-sm text-neutral-500 mt-3 border-t border-neutral-100 pt-3">{{ champ()!.description }}</p>
          }
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-neutral-200 mb-4">
          @for (tab of tabs; track tab.key) {
            <button (click)="activeTab.set(tab.key)"
              class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
              [class]="activeTab() === tab.key ? 'border-primary-500 text-primary-700' : 'border-transparent text-neutral-500 hover:text-neutral-700'">
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- Cultures tab -->
        @if (activeTab() === 'cultures') {
          <div class="bg-white rounded-lg shadow-sm divide-y divide-neutral-100">
            @for (culture of cultures(); track culture.id) {
              <a [routerLink]="['/app/cultures', culture.id]" class="flex items-center px-4 py-3 hover:bg-neutral-50 transition-colors">
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-800">{{ culture.nom }}</p>
                  <p class="text-xs text-neutral-400">{{ culture.saison === 'normale' ? 'Normale' : 'Contre-saison' }} {{ culture.annee }}</p>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full" [class]="getStatutClass(culture.statut)">{{ getStatutLabel(culture.statut) }}</span>
              </a>
            }
            @empty { <p class="py-8 text-center text-sm text-neutral-400">Aucune culture</p> }
          </div>
        }

        <!-- Dépenses tab -->
        @if (activeTab() === 'depenses') {
          <div class="bg-white rounded-lg shadow-sm divide-y divide-neutral-100">
            @for (d of depenses(); track d.id) {
              <div class="flex items-center px-4 py-3">
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-800">{{ d.description }}</p>
                  <p class="text-xs text-neutral-400">{{ d.date_depense | dateFr }} • {{ d.categorie }}</p>
                </div>
                <span class="text-sm font-semibold text-error">{{ d.montant_fcfa | currencyFcfa }}</span>
              </div>
            }
            @empty { <p class="py-8 text-center text-sm text-neutral-400">Aucune dépense</p> }
          </div>
        }

        <!-- Ventes tab -->
        @if (activeTab() === 'ventes') {
          <div class="bg-white rounded-lg shadow-sm divide-y divide-neutral-100">
            @for (v of ventes(); track v.id) {
              <div class="flex items-center px-4 py-3">
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-800">{{ v.produit }}</p>
                  <p class="text-xs text-neutral-400">{{ v.date_vente | dateFr }} • {{ v.acheteur || '-' }}</p>
                </div>
                <span class="text-sm font-semibold text-primary-600">{{ v.montant_total_fcfa | currencyFcfa }}</span>
              </div>
            }
            @empty { <p class="py-8 text-center text-sm text-neutral-400">Aucune vente</p> }
          </div>
        }
      }
    </div>
  `,
})
export class DetailChampComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  champ = signal<Champ | null>(null);
  cultures = signal<Culture[]>([]);
  depenses = signal<Depense[]>([]);
  ventes = signal<Vente[]>([]);
  finance = signal<any>(null);
  activeTab = signal<'cultures' | 'depenses' | 'ventes'>('cultures');

  tabs = [
    { key: 'cultures' as const, label: 'Cultures' },
    { key: 'depenses' as const, label: 'Dépenses' },
    { key: 'ventes' as const, label: 'Ventes' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.get<Champ>(`champs/${id}`).subscribe(c => this.champ.set(c));
    this.api.get<Culture[]>(`champs/${id}/cultures`).subscribe(d => this.cultures.set(d));
    this.api.get<Depense[]>(`champs/${id}/depenses`).subscribe(d => this.depenses.set(d));
    this.api.get<Vente[]>(`champs/${id}/ventes`).subscribe(d => this.ventes.set(d));
    this.api.get<any>(`champs/${id}/finance`).subscribe(d => this.finance.set(d));
  }

  getStatutLabel(statut: string): string {
    return { en_cours: 'En cours', recolte: 'Récolte', termine: 'Terminé' }[statut] || statut;
  }

  getStatutClass(statut: string): string {
    return { en_cours: 'bg-primary-100 text-primary-700', recolte: 'bg-secondary-100 text-secondary-700', termine: 'bg-neutral-100 text-neutral-600' }[statut] || '';
  }
}
