import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Culture, Champ } from '../../core/models';

@Component({
  selector: 'app-liste-cultures',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-neutral-800">Cultures</h1>
        @if (auth.isAdmin()) {
          <a routerLink="/app/cultures/nouveau" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            + Nouvelle culture
          </a>
        }
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <select [(ngModel)]="filtres.champ_id" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Tous les champs</option>
          @for (c of champs(); track c.id) {
            <option [value]="c.id">{{ c.nom }}</option>
          }
        </select>
        <select [(ngModel)]="filtres.saison" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Toutes saisons</option>
          <option value="normale">Normale</option>
          <option value="contre_saison">Contre-saison</option>
        </select>
        <select [(ngModel)]="filtres.statut" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Tous statuts</option>
          <option value="en_cours">En cours</option>
          <option value="recolte">Récolte</option>
          <option value="termine">Terminé</option>
        </select>
        <input type="number" [(ngModel)]="filtres.annee" (change)="charger()" placeholder="Année" class="w-24 px-3 py-1.5 border border-neutral-300 rounded-md text-sm" />
        <button (click)="resetFiltres()" class="px-3 py-1.5 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Réinitialiser</button>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-neutral-100 text-left">
              <th class="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Culture</th>
              <th class="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden md:table-cell">Champ</th>
              <th class="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Saison</th>
              <th class="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Année</th>
              <th class="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Statut</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            @for (c of cultures(); track c.id) {
              <tr class="hover:bg-neutral-50 transition-colors">
                <td class="px-4 py-3">
                  <p class="text-sm font-medium text-neutral-800">{{ c.nom }}</p>
                  @if (c.variete) { <p class="text-xs text-neutral-400">{{ c.variete }}</p> }
                </td>
                <td class="px-4 py-3 hidden md:table-cell text-sm text-neutral-600">{{ c.champ?.nom }}</td>
                <td class="px-4 py-3 hidden sm:table-cell text-sm text-neutral-600">{{ c.saison === 'normale' ? 'Normale' : 'Contre-saison' }}</td>
                <td class="px-4 py-3 hidden sm:table-cell text-sm text-neutral-600">{{ c.annee }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getStatutClass(c.statut)">{{ getStatutLabel(c.statut) }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <a [routerLink]="['/app/cultures', c.id]" class="text-xs text-primary-600 hover:underline">Voir</a>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="6" class="py-12 text-center text-sm text-neutral-400">Aucune culture trouvée</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ListeCulturesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  cultures = signal<Culture[]>([]);
  champs = signal<Champ[]>([]);
  filtres = { champ_id: '', saison: '', statut: '', annee: '' };

  ngOnInit(): void {
    this.api.get<Champ[]>('champs').subscribe(d => this.champs.set(d));
    this.charger();
  }

  charger(): void {
    this.api.get<Culture[]>('cultures', this.filtres as any).subscribe(d => this.cultures.set(d));
  }

  resetFiltres(): void {
    this.filtres = { champ_id: '', saison: '', statut: '', annee: '' };
    this.charger();
  }

  getStatutLabel(s: string): string {
    return { en_cours: 'En cours', recolte: 'Récolte', termine: 'Terminé' }[s] || s;
  }

  getStatutClass(s: string): string {
    return { en_cours: 'bg-primary-100 text-primary-700', recolte: 'bg-secondary-100 text-secondary-700', termine: 'bg-neutral-100 text-neutral-600' }[s] || '';
  }
}
