import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Tache, Employe, Champ } from '../../core/models';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';

@Component({
  selector: 'app-liste-taches',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DateFrPipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-neutral-800">Tâches</h1>
        @if (auth.isAdmin()) {
          <a routerLink="/app/taches/nouveau" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">+ Nouvelle tâche</a>
        }
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <select [(ngModel)]="filtres.employe_id" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Tous les employés</option>
          @for (e of employes(); track e.id) { <option [value]="e.id">{{ e.nom }}</option> }
        </select>
        <select [(ngModel)]="filtres.statut" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Tous statuts</option>
          <option value="a_faire">À faire</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
        <select [(ngModel)]="filtres.priorite" (change)="charger()" class="px-3 py-1.5 border border-neutral-300 rounded-md text-sm">
          <option value="">Toutes priorités</option>
          <option value="basse">Basse</option>
          <option value="normale">Normale</option>
          <option value="haute">Haute</option>
          <option value="urgente">Urgente</option>
        </select>
        <button (click)="resetFiltres()" class="px-3 py-1.5 border border-neutral-300 text-neutral-600 rounded-md text-sm hover:bg-neutral-50">Réinitialiser</button>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-neutral-100">
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Titre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Employé</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Champ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Statut</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Priorité</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Début</th>
              @if (auth.isAdmin()) { <th class="px-4 py-3"></th> }
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            @for (t of taches(); track t.id) {
              <tr class="hover:bg-neutral-50">
                <td class="px-4 py-3 text-sm font-medium text-neutral-800">{{ t.titre }}</td>
                <td class="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">{{ t.employe?.nom }}</td>
                <td class="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">{{ t.champ?.nom || '-' }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getStatutClass(t.statut)">{{ getStatutLabel(t.statut) }}</span>
                </td>
                <td class="px-4 py-3 hidden sm:table-cell">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getPrioriteClass(t.priorite)">{{ t.priorite }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-neutral-500 hidden sm:table-cell">{{ t.date_debut | dateFr }}</td>
                @if (auth.isAdmin()) {
                  <td class="px-4 py-3 text-right">
                    <a [routerLink]="['/app/taches', t.id, 'modifier']" class="text-xs text-neutral-500 hover:underline mr-2">Modifier</a>
                    <button (click)="supprimer(t.id)" class="text-xs text-error hover:underline">Suppr.</button>
                  </td>
                }
              </tr>
            }
            @empty { <tr><td [attr.colspan]="auth.isAdmin() ? 7 : 6" class="py-12 text-center text-sm text-neutral-400">Aucune tâche</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ListeTachesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  taches = signal<Tache[]>([]);
  employes = signal<Employe[]>([]);
  filtres = { employe_id: '', champ_id: '', statut: '', priorite: '' };

  ngOnInit(): void {
    this.api.get<Employe[]>('employes').subscribe(d => this.employes.set(d));
    this.charger();
  }

  charger(): void {
    this.api.get<Tache[]>('taches', this.filtres as any).subscribe(d => this.taches.set(d));
  }

  resetFiltres(): void {
    this.filtres = { employe_id: '', champ_id: '', statut: '', priorite: '' };
    this.charger();
  }

  supprimer(id: number): void {
    if (!confirm('Confirmer la suppression ?')) return;
    this.api.delete(`taches/${id}`).subscribe({ next: () => { this.toast.success('Tâche supprimée.'); this.charger(); } });
  }

  getStatutLabel(s: string): string {
    return { a_faire: 'À faire', en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé' }[s] || s;
  }

  getStatutClass(s: string): string {
    return { a_faire: 'bg-accent-100 text-accent-700', en_cours: 'bg-primary-100 text-primary-700', termine: 'bg-neutral-100 text-neutral-600', annule: 'bg-red-100 text-error' }[s] || '';
  }

  getPrioriteClass(p: string): string {
    return { basse: 'bg-neutral-100 text-neutral-600', normale: 'bg-accent-100 text-accent-700', haute: 'bg-secondary-100 text-secondary-700', urgente: 'bg-red-100 text-error' }[p] || '';
  }
}
