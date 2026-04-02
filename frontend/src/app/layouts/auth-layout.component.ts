import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen bg-neutral-50 overflow-hidden">
      <!-- Sidebar Desktop -->
      <aside class="hidden lg:flex flex-col w-60 bg-neutral-100 border-r border-neutral-200 flex-shrink-0">
        <div class="p-5 border-b border-neutral-200">
          <h1 class="text-lg font-bold text-primary-700">🌿 KadiarAgro</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Gestion agricole</p>
        </div>
        <nav class="flex-1 overflow-y-auto p-3">
          <ng-container *ngTemplateOutlet="navLinks"></ng-container>
        </nav>
        <div class="p-3 border-t border-neutral-200">
          <div class="flex items-center gap-2 px-2 py-1 mb-2">
            <div class="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
              {{ auth.currentUser()?.nom?.charAt(0) | uppercase }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-neutral-700 truncate">{{ auth.currentUser()?.nom }}</p>
              <p class="text-xs text-neutral-400 capitalize">{{ auth.currentUser()?.role }}</p>
            </div>
          </div>
          <button (click)="auth.logout()" class="w-full text-left px-3 py-1.5 text-sm text-neutral-500 hover:text-error hover:bg-red-50 rounded-md transition-colors">
            Déconnexion
          </button>
        </div>
      </aside>

      <!-- Mobile Drawer Overlay -->
      @if (drawerOpen()) {
        <div class="fixed inset-0 z-40 bg-black/50 lg:hidden" (click)="drawerOpen.set(false)"></div>
        <div class="fixed inset-y-0 left-0 z-50 w-64 bg-neutral-100 flex flex-col lg:hidden transform transition-transform">
          <div class="p-5 border-b border-neutral-200 flex items-center justify-between">
            <h1 class="text-lg font-bold text-primary-700">🌿 KadiarAgro</h1>
            <button (click)="drawerOpen.set(false)" class="text-neutral-400 hover:text-neutral-600 text-2xl leading-none">&times;</button>
          </div>
          <nav class="flex-1 overflow-y-auto p-3" (click)="drawerOpen.set(false)">
            <ng-container *ngTemplateOutlet="navLinks"></ng-container>
          </nav>
        </div>
      }

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- TopBar -->
        <header class="h-16 bg-white border-b border-neutral-200 flex items-center px-4 gap-4 flex-shrink-0">
          <button (click)="drawerOpen.set(true)" class="lg:hidden text-neutral-500 hover:text-neutral-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h2 class="flex-1 text-sm font-semibold text-neutral-700">{{ currentTitle() }}</h2>
          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center gap-2">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
                {{ auth.currentUser()?.nom?.charAt(0) | uppercase }}
              </div>
              <span class="text-sm font-medium text-neutral-700">{{ auth.currentUser()?.nom }}</span>
            </div>
            <button (click)="auth.logout()" class="text-sm text-neutral-500 hover:text-error transition-colors">
              Déconnexion
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <ng-template #navLinks>
      @for (item of navItems; track item.path) {
        @if (!item.adminOnly || auth.isAdmin()) {
          <a [routerLink]="item.path" routerLinkActive="bg-primary-100 text-primary-700 border-l-[3px] border-primary-500"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 mb-0.5 transition-all duration-150 border-l-[3px] border-transparent">
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      }
      <div class="border-t border-neutral-200 my-2"></div>
      @if (auth.isAdmin()) {
        <a routerLink="/app/utilisateurs" routerLinkActive="bg-primary-100 text-primary-700 border-l-[3px] border-primary-500"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 mb-0.5 transition-all duration-150 border-l-[3px] border-transparent">
          <span class="text-base">👥</span><span>Utilisateurs</span>
        </a>
      }
      <a routerLink="/app/parametres/profil" routerLinkActive="bg-primary-100 text-primary-700 border-l-[3px] border-primary-500"
        class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 mb-0.5 transition-all duration-150 border-l-[3px] border-transparent">
        <span class="text-base">⚙️</span><span>Paramètres</span>
      </a>
    </ng-template>
  `,
})
export class AuthLayoutComponent {
  auth = inject(AuthService);
  drawerOpen = signal(false);

  navItems: NavItem[] = [
    { path: '/app/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/app/champs', label: 'Champs', icon: '🌾' },
    { path: '/app/cultures', label: 'Cultures', icon: '🌱' },
    { path: '/app/depenses', label: 'Dépenses', icon: '💸' },
    { path: '/app/ventes', label: 'Ventes', icon: '💰' },
    { path: '/app/finance', label: 'Finance', icon: '📈' },
    { path: '/app/stocks', label: 'Stocks', icon: '📦' },
    { path: '/app/employes', label: 'Employés', icon: '👷' },
    { path: '/app/taches', label: 'Tâches', icon: '✅' },
  ];

  currentTitle(): string {
    const path = window.location.pathname;
    const item = this.navItems.find(n => path.startsWith(n.path));
    if (path.includes('/utilisateurs')) return 'Utilisateurs';
    if (path.includes('/parametres')) return 'Paramètres';
    return item?.label ?? 'KadiarAgro';
  }
}
