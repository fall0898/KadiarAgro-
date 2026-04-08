# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KadiarAgro is an agricultural management SPA — Laravel 11 REST API (`/backend`) + Angular 18 frontend (`/frontend`), MySQL 8, Tailwind CSS 3. Two roles: **admin** (full CRUD) and **lecteur** (read-only). Deployed on Railway (backend) + Netlify (frontend).

## Commands

### Backend
```bash
cd backend
php artisan serve --port=8000          # Dev server
php artisan migrate --seed             # Reset + seed (local)
php artisan migrate:fresh --force && php artisan db:seed --force  # Production reset
php artisan tinker                     # REPL
composer install --ignore-platform-req=ext-gd  # Install deps (gd missing on Windows)
```

### Frontend
```bash
cd frontend
npm start          # Dev server at :4200
npm run build      # Production build → dist/frontend/browser/
```

### Local credentials
- `admin@kadiar-agro.com` / `password`
- `lecteur@kadiar-agro.com` / `password`

## Architecture

### Backend

**Auth**: Sanctum token-based (not cookie). Token stored in `localStorage` on frontend, sent as `Authorization: Bearer`. `CheckRole` middleware guards admin routes.

**Route structure** (`routes/api.php`):
- `GET /api/health` — Railway healthcheck (public)
- `POST /api/auth/login` — Returns `{ token, user }`
- All others: `auth:sanctum` middleware
- Write operations: nested `role:admin` group

**Notable routes** (non-obvious):
- `GET /stocks/alertes` — must be declared **before** `GET /stocks/{stock}` to avoid "alertes" being matched as an ID
- `GET /ventes/{vente}/recu-pdf` — returns a PDF blob (sales receipt)
- `GET /finance/export-excel` — returns an Excel blob (3-sheet report)
- `PATCH /taches/{tache}/statut` — dedicated status-only update
- `/utilisateurs` — entire resource is admin-only (no lecteur access at all)

**Key business logic**:
- **Campaign year**: Oct 1 → Sep 30 (not calendar year). Computed dynamically in `DashboardController::kpis()` and `FinanceController::getDateRange()`. Always use this pattern for any date-range default.
- **Auto-generated expenses**: Stock purchases (`type=achat`) and salary payments auto-create a `Depense` with `est_auto_generee=true`. These cannot be edited/deleted via UI.
- **Null champ expenses**: Many expenses have `champ_id=null` (general/multi-field costs). The `DepenseController` handles `champ_id='sans'` as a special filter value → `whereNull('champ_id')`.

**Finance export** (`app/Exports/FinanceExport.php`): 3-sheet Excel with full PhpSpreadsheet styling via `AfterSheet` events — Tableau de Bord, Dépenses par Exploitation, Ventes.

### Frontend

**All components are standalone** (Angular 18). Lazy-loaded per feature module.

**Feature module convention** (`features/<domain>/`): each domain follows the pattern `liste-*.component.ts` (list view) + `form-*.component.ts` (create/edit, route-param `id` determines mode) + optionally `detail-*.component.ts` or `fiche-*.component.ts` (read-only detail). Salary payments (`/salaires`) have no dedicated feature page — they are managed from within `fiche-employe.component.ts`.

**HTTP layer**: All API calls go through `ApiService` (`core/services/api.service.ts`) — a thin typed wrapper around `HttpClient`. Use `apiService.getBlob()` for binary responses (Excel export, PDF receipt). Never inject `HttpClient` directly in feature components.

**State**: No state management library. `AuthService` uses Angular Signals. Token/user persisted in `localStorage` as `kadiar_token` / `kadiar_user`.

**Interceptors** (`core/interceptors/`):
- `tokenInterceptor` — Injects Bearer token on every request
- `errorInterceptor` — 401 → logout+redirect, 403 → toast, 422 → validation toast, 5xx → generic toast

**Guards** (`core/guards/`):
- `authGuard` — Requires `isLoggedIn()`
- `adminGuard` — Requires `isAdmin()`, redirects to dashboard if not

**Environment files**:
- `environment.ts` — `apiUrl: 'http://localhost:8000/api'` (dev)
- `environment.prod.ts` — `apiUrl: 'https://kadiaragro-production.up.railway.app/api'` (prod)
- `angular.json` has `fileReplacements` configured for production build

**TypeScript models** (`core/models/index.ts`): single file exports all interfaces (`User`, `Champ`, `Culture`, `Depense`, `Vente`, `Stock`, `MouvementStock`, `Employe`, `Tache`, `PaiementSalaire`, `UtilisationIntrant`, `Intrant`, `Media`, `DashboardKpis`, `FinanceResume`) plus `CATEGORIES_DEPENSES`. Keep `CATEGORIES_DEPENSES` in sync with the backend enum in migrations and `DepenseController` validation.

## Deployment

**Railway** (backend, root dir = `backend/`):
- `nixpacks.toml` handles PHP 8.2 + composer install, disables npm build phase
- Start command runs `migrate --force`, `config:cache`, `route:cache`, then `serve`
- Env vars: `DB_*` reference MySQL service variables via `${{MYSQLHOST}}` etc., `FRONTEND_URL` for CORS

**Netlify** (frontend):
- `netlify.toml` at repo root sets base=`frontend`, publishes `dist/frontend/browser`
- `frontend/.npmrc` has `legacy-peer-deps=true` (required for ng2-charts peer conflict)
- SPA routing: all `/*` → `/index.html`

**Push to deploy**:
```bash
git push https://fall0898:TOKEN@github.com/fall0898/KadiarAgro-.git master:main
```

## Seeding

`DatabaseSeeder` runs in order: Users → Intrants → Champs (Yokh=1, Ablaye Fall=2, Razel=3, Projet=4) → `DepenseSeeder` (201 campaign expenses Oct 2025–Mar 2026, 3 147 750 FCFA total). `DepenseSeeder` is idempotent — skips if non-auto expenses already exist.
