<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FinancementController;
use App\Http\Controllers\Api\ChampController;
use App\Http\Controllers\Api\CultureController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepenseController;
use App\Http\Controllers\Api\EmployeController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\IntrantController;
use App\Http\Controllers\Api\PaiementSalaireController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\VenteController;
use Illuminate\Support\Facades\Route;

// Health check (Railway)
Route::get('/health', fn() => response()->json(['status' => 'ok', 'app' => 'KadiarAgro']));

// Auth publique
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/user', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard/kpis', [DashboardController::class, 'kpis']);
    Route::get('/dashboard/depenses-recentes', [DashboardController::class, 'depensesRecentes']);
    Route::get('/dashboard/ventes-recentes', [DashboardController::class, 'ventesRecentes']);
    Route::get('/dashboard/stocks-alertes', [DashboardController::class, 'stocksAlertes']);
    Route::get('/dashboard/taches-en-cours', [DashboardController::class, 'tachesEnCours']);

    // Intrants (catalogue)
    Route::get('/intrants', [IntrantController::class, 'index']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/intrants', [IntrantController::class, 'store']);
        Route::put('/intrants/{intrant}', [IntrantController::class, 'update']);
        Route::delete('/intrants/{intrant}', [IntrantController::class, 'destroy']);
    });

    // Champs
    Route::get('/champs', [ChampController::class, 'index']);
    Route::get('/champs/{champ}', [ChampController::class, 'show']);
    Route::get('/champs/{champ}/cultures', [ChampController::class, 'cultures']);
    Route::get('/champs/{champ}/depenses', [ChampController::class, 'depenses']);
    Route::get('/champs/{champ}/ventes', [ChampController::class, 'ventes']);
    Route::get('/champs/{champ}/finance', [ChampController::class, 'finance']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/champs', [ChampController::class, 'store']);
        Route::put('/champs/{champ}', [ChampController::class, 'update']);
        Route::delete('/champs/{champ}', [ChampController::class, 'destroy']);
    });

    // Cultures
    Route::get('/cultures', [CultureController::class, 'index']);
    Route::get('/cultures/{culture}', [CultureController::class, 'show']);
    Route::get('/cultures/{culture}/intrants', [CultureController::class, 'intrants']);
    Route::get('/cultures/{culture}/medias', [CultureController::class, 'medias']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/cultures', [CultureController::class, 'store']);
        Route::put('/cultures/{culture}', [CultureController::class, 'update']);
        Route::delete('/cultures/{culture}', [CultureController::class, 'destroy']);
        Route::post('/cultures/{culture}/intrants', [CultureController::class, 'addIntrant']);
        Route::delete('/utilisations-intrants/{utilisationsIntrant}', [CultureController::class, 'deleteIntrant']);
        Route::post('/cultures/{culture}/medias', [CultureController::class, 'uploadMedia']);
        Route::delete('/medias/{media}', [CultureController::class, 'deleteMedia']);
    });

    // Dépenses
    Route::get('/depenses', [DepenseController::class, 'index']);
    Route::get('/depenses/{depense}', [DepenseController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/depenses', [DepenseController::class, 'store']);
        Route::put('/depenses/{depense}', [DepenseController::class, 'update']);
        Route::delete('/depenses/{depense}', [DepenseController::class, 'destroy']);
    });

    // Ventes
    Route::get('/ventes', [VenteController::class, 'index']);
    Route::get('/ventes/{vente}', [VenteController::class, 'show']);
    Route::get('/ventes/{vente}/recu-pdf', [VenteController::class, 'recuPdf']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/ventes', [VenteController::class, 'store']);
        Route::put('/ventes/{vente}', [VenteController::class, 'update']);
        Route::delete('/ventes/{vente}', [VenteController::class, 'destroy']);
    });

    // Stocks
    Route::get('/stocks/alertes', [StockController::class, 'alertes']);
    Route::get('/stocks', [StockController::class, 'index']);
    Route::get('/stocks/{stock}', [StockController::class, 'show']);
    Route::get('/stocks/{stock}/mouvements', [StockController::class, 'mouvements']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/stocks', [StockController::class, 'store']);
        Route::put('/stocks/{stock}', [StockController::class, 'update']);
        Route::delete('/stocks/{stock}', [StockController::class, 'destroy']);
        Route::post('/stocks/{stock}/mouvements', [StockController::class, 'ajouterMouvement']);
    });

    // Finance
    Route::get('/finance/resume', [FinanceController::class, 'resume']);
    Route::get('/finance/par-champ', [FinanceController::class, 'parChamp']);
    Route::get('/finance/par-culture', [FinanceController::class, 'parCulture']);
    Route::get('/finance/export-excel', [FinanceController::class, 'exportExcel']);

    // Employés
    Route::get('/employes', [EmployeController::class, 'index']);
    Route::get('/employes/{employe}', [EmployeController::class, 'show']);
    Route::get('/employes/{employe}/paiements', [EmployeController::class, 'paiements']);
    Route::get('/employes/{employe}/financements', [EmployeController::class, 'financements']);

    // Financements
    Route::get('/financements', [FinancementController::class, 'index']);
    Route::get('/financements/{financement}', [FinancementController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/employes', [EmployeController::class, 'store']);
        Route::put('/employes/{employe}', [EmployeController::class, 'update']);
        Route::delete('/employes/{employe}', [EmployeController::class, 'destroy']);
        Route::post('/financements', [FinancementController::class, 'store']);
        Route::post('/financements/{financement}/remboursements', [FinancementController::class, 'addRemboursement']);
        Route::delete('/financements/{financement}', [FinancementController::class, 'destroy']);
    });

    // Paiements Salaire
    Route::get('/salaires', [PaiementSalaireController::class, 'index']);
    Route::get('/salaires/{paiementSalaire}', [PaiementSalaireController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/salaires', [PaiementSalaireController::class, 'store']);
        Route::put('/salaires/{paiementSalaire}', [PaiementSalaireController::class, 'update']);
        Route::delete('/salaires/{paiementSalaire}', [PaiementSalaireController::class, 'destroy']);
    });

    // Utilisateurs (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
        Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
        Route::get('/utilisateurs/{utilisateur}', [UtilisateurController::class, 'show']);
        Route::put('/utilisateurs/{utilisateur}', [UtilisateurController::class, 'update']);
        Route::delete('/utilisateurs/{utilisateur}', [UtilisateurController::class, 'destroy']);
    });
});
