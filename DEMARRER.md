# KadiarAgro — Guide de démarrage

## Prérequis
- XAMPP avec MySQL démarré
- PHP 8.2 + Composer
- Node 22 + npm

## 1. Base de données
Créer la base via phpMyAdmin ou MySQL CLI :
```sql
CREATE DATABASE kadiar_agro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Backend Laravel

```bash
cd c:/xampp/KadiarAgro/backend

# Lancer les migrations + seeder
php artisan migrate --seed

# Créer le lien symbolique pour les médias
php artisan storage:link

# Démarrer le serveur
php artisan serve --port=8000
```

## 3. Frontend Angular

```bash
cd c:/xampp/KadiarAgro/frontend
npm start
# L'application est accessible sur http://localhost:4200
```

## Comptes par défaut
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@kadiar-agro.com | password | Admin |
| lecteur@kadiar-agro.com | password | Lecteur |

## Architecture
```
KadiarAgro/
├── backend/     # Laravel 11 API REST (port 8000)
└── frontend/    # Angular 18 SPA (port 4200)
```
