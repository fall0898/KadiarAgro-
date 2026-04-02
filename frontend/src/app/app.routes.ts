import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'connexion', pathMatch: 'full' },
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'app',
    loadComponent: () => import('./layouts/auth-layout.component').then(m => m.AuthLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Champs
      { path: 'champs', loadComponent: () => import('./features/champs/liste-champs.component').then(m => m.ListeChampsComponent) },
      { path: 'champs/nouveau', canActivate: [adminGuard], loadComponent: () => import('./features/champs/form-champ.component').then(m => m.FormChampComponent) },
      { path: 'champs/:id', loadComponent: () => import('./features/champs/detail-champ.component').then(m => m.DetailChampComponent) },
      { path: 'champs/:id/modifier', canActivate: [adminGuard], loadComponent: () => import('./features/champs/form-champ.component').then(m => m.FormChampComponent) },

      // Cultures
      { path: 'cultures', loadComponent: () => import('./features/cultures/liste-cultures.component').then(m => m.ListeCulturesComponent) },
      { path: 'cultures/nouveau', canActivate: [adminGuard], loadComponent: () => import('./features/cultures/form-culture.component').then(m => m.FormCultureComponent) },
      { path: 'cultures/:id', loadComponent: () => import('./features/cultures/detail-culture.component').then(m => m.DetailCultureComponent) },
      { path: 'cultures/:id/modifier', canActivate: [adminGuard], loadComponent: () => import('./features/cultures/form-culture.component').then(m => m.FormCultureComponent) },

      // Dépenses
      { path: 'depenses', loadComponent: () => import('./features/depenses/liste-depenses.component').then(m => m.ListeDepensesComponent) },
      { path: 'depenses/nouveau', canActivate: [adminGuard], loadComponent: () => import('./features/depenses/form-depense.component').then(m => m.FormDepenseComponent) },
      { path: 'depenses/:id/modifier', canActivate: [adminGuard], loadComponent: () => import('./features/depenses/form-depense.component').then(m => m.FormDepenseComponent) },

      // Ventes
      { path: 'ventes', loadComponent: () => import('./features/ventes/liste-ventes.component').then(m => m.ListeVentesComponent) },
      { path: 'ventes/nouveau', canActivate: [adminGuard], loadComponent: () => import('./features/ventes/form-vente.component').then(m => m.FormVenteComponent) },
      { path: 'ventes/:id/modifier', canActivate: [adminGuard], loadComponent: () => import('./features/ventes/form-vente.component').then(m => m.FormVenteComponent) },

      // Finance
      { path: 'finance', loadComponent: () => import('./features/finance/dashboard-finance.component').then(m => m.DashboardFinanceComponent) },

      // Stocks
      { path: 'stocks', loadComponent: () => import('./features/stocks/liste-stocks.component').then(m => m.ListeStocksComponent) },
      { path: 'stocks/nouveau', canActivate: [adminGuard], loadComponent: () => import('./features/stocks/form-stock.component').then(m => m.FormStockComponent) },
      { path: 'stocks/:id', loadComponent: () => import('./features/stocks/detail-stock.component').then(m => m.DetailStockComponent) },
      { path: 'stocks/:id/modifier', canActivate: [adminGuard], loadComponent: () => import('./features/stocks/form-stock.component').then(m => m.FormStockComponent) },

      // Employés
      { path: 'employes', loadComponent: () => import('./features/employes/liste-employes.component').then(m => m.ListeEmployesComponent) },
      { path: 'employes/nouveau', canActivate: [adminGuard], loadComponent: () => import('./features/employes/form-employe.component').then(m => m.FormEmployeComponent) },
      { path: 'employes/:id', loadComponent: () => import('./features/employes/fiche-employe.component').then(m => m.FicheEmployeComponent) },
      { path: 'employes/:id/modifier', canActivate: [adminGuard], loadComponent: () => import('./features/employes/form-employe.component').then(m => m.FormEmployeComponent) },

      // Tâches
      { path: 'taches', loadComponent: () => import('./features/taches/liste-taches.component').then(m => m.ListeTachesComponent) },
      { path: 'taches/nouveau', canActivate: [adminGuard], loadComponent: () => import('./features/taches/form-tache.component').then(m => m.FormTacheComponent) },
      { path: 'taches/:id/modifier', canActivate: [adminGuard], loadComponent: () => import('./features/taches/form-tache.component').then(m => m.FormTacheComponent) },

      // Utilisateurs (admin only)
      { path: 'utilisateurs', canActivate: [adminGuard], loadComponent: () => import('./features/utilisateurs/liste-utilisateurs.component').then(m => m.ListeUtilisateursComponent) },
      { path: 'utilisateurs/nouveau', canActivate: [adminGuard], loadComponent: () => import('./features/utilisateurs/form-utilisateur.component').then(m => m.FormUtilisateurComponent) },
      { path: 'utilisateurs/:id/modifier', canActivate: [adminGuard], loadComponent: () => import('./features/utilisateurs/form-utilisateur.component').then(m => m.FormUtilisateurComponent) },

      // Paramètres
      { path: 'parametres/profil', loadComponent: () => import('./features/parametres/profil.component').then(m => m.ProfilComponent) },
      { path: 'parametres/securite', loadComponent: () => import('./features/parametres/securite.component').then(m => m.SecuriteComponent) },
    ],
  },
  { path: '**', redirectTo: 'connexion' },
];
