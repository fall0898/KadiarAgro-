import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Champ } from '../../core/models';

@Component({
  selector: 'app-liste-champs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-neutral-800">Champs</h1>
        @if (auth.isAdmin()) {
          <a routerLink="/app/champs/nouveau"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all">
            + Nouveau champ
          </a>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white rounded-lg p-5 shadow-sm animate-pulse">
              <div class="h-4 bg-neutral-200 rounded w-3/4 mb-3"></div>
              <div class="h-3 bg-neutral-200 rounded w-1/2"></div>
            </div>
          }
        </div>
      } @else if (champs().length === 0) {
        <div class="text-center py-20 bg-white rounded-lg shadow-sm">
          <div class="text-5xl mb-4">🌾</div>
          <h3 class="text-lg font-semibold text-neutral-700 mb-2">Aucun champ</h3>
          <p class="text-neutral-400 text-sm mb-4">Commencez par créer votre premier champ.</p>
          @if (auth.isAdmin()) {
            <a routerLink="/app/champs/nouveau" class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium">
              Créer un champ
            </a>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (champ of champs(); track champ.id) {
            <a [routerLink]="['/app/champs', champ.id]"
              class="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-150 border border-transparent hover:border-primary-200 cursor-pointer">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-neutral-800">{{ champ.nom }}</h3>
                <span class="text-xs px-2 py-0.5 rounded-full" [class]="champ.est_actif ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-neutral-500'">
                  {{ champ.est_actif ? 'Actif' : 'Inactif' }}
                </span>
              </div>
              <p class="text-sm text-neutral-500 mb-2">📐 {{ champ.superficie_ha }} ha</p>
              @if (champ.localisation) {
                <p class="text-xs text-neutral-400 mb-2">📍 {{ champ.localisation }}</p>
              }
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                <span class="text-xs text-neutral-500">{{ champ.cultures_count || 0 }} culture(s)</span>
                <span class="text-xs text-primary-600 font-medium">Voir le détail →</span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class ListeChampsComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  champs = signal<Champ[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.api.get<Champ[]>('champs').subscribe({
      next: data => { this.champs.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Erreur chargement champs'); }
    });
  }
}
