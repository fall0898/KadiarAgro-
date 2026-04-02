import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Employe } from '../../core/models';
import { CurrencyFcfaPipe } from '../../core/pipes/currency-fcfa.pipe';

@Component({
  selector: 'app-liste-employes',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFcfaPipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-neutral-800">Employés</h1>
        @if (auth.isAdmin()) {
          <a routerLink="/app/employes/nouveau" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">+ Nouvel employé</a>
        }
      </div>
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-neutral-100">
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Nom</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Poste</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">Téléphone</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">Salaire mensuel</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Statut</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            @for (e of employes(); track e.id) {
              <tr class="hover:bg-neutral-50">
                <td class="px-4 py-3 text-sm font-medium text-neutral-800">{{ e.nom }}</td>
                <td class="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">{{ e.poste || '-' }}</td>
                <td class="px-4 py-3 text-sm text-neutral-500 hidden sm:table-cell">{{ e.telephone || '-' }}</td>
                <td class="px-4 py-3 text-sm text-right hidden md:table-cell">{{ e.salaire_mensuel_fcfa | currencyFcfa }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full" [class]="e.est_actif ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-neutral-500'">
                    {{ e.est_actif ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <a [routerLink]="['/app/employes', e.id]" class="text-xs text-primary-600 hover:underline mr-2">Fiche</a>
                  @if (auth.isAdmin()) {
                    <a [routerLink]="['/app/employes', e.id, 'modifier']" class="text-xs text-neutral-500 hover:underline">Modifier</a>
                  }
                </td>
              </tr>
            }
            @empty { <tr><td colspan="6" class="py-12 text-center text-sm text-neutral-400">Aucun employé</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ListeEmployesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  employes = signal<Employe[]>([]);

  ngOnInit(): void {
    this.api.get<Employe[]>('employes').subscribe(d => this.employes.set(d));
  }
}
