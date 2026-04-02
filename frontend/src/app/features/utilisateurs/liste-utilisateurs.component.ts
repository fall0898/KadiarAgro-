import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models';
import { DateFrPipe } from '../../core/pipes/date-fr.pipe';

@Component({
  selector: 'app-liste-utilisateurs',
  standalone: true,
  imports: [CommonModule, RouterLink, DateFrPipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-neutral-800">Utilisateurs</h1>
        <a routerLink="/app/utilisateurs/nouveau" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">+ Nouvel utilisateur</a>
      </div>
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-neutral-100">
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Nom</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Email</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Rôle</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Statut</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Dernière connexion</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            @for (u of utilisateurs(); track u.id) {
              <tr class="hover:bg-neutral-50">
                <td class="px-4 py-3 text-sm font-medium text-neutral-800">{{ u.nom }}</td>
                <td class="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">{{ u.email }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full" [class]="u.role === 'admin' ? 'bg-secondary-100 text-secondary-700' : 'bg-accent-100 text-accent-700'">{{ u.role }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full" [class]="u.est_actif ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-neutral-500'">{{ u.est_actif ? 'Actif' : 'Inactif' }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-neutral-400 hidden sm:table-cell">{{ u.derniere_connexion_at | dateFr }}</td>
                <td class="px-4 py-3 text-right">
                  <a [routerLink]="['/app/utilisateurs', u.id, 'modifier']" class="text-xs text-neutral-500 hover:underline">Modifier</a>
                </td>
              </tr>
            }
            @empty { <tr><td colspan="6" class="py-12 text-center text-sm text-neutral-400">Aucun utilisateur</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ListeUtilisateursComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  utilisateurs = signal<User[]>([]);

  ngOnInit(): void {
    this.api.get<User[]>('utilisateurs').subscribe(d => this.utilisateurs.set(d));
  }
}
