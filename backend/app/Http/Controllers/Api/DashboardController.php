<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Champ;
use App\Models\Culture;
use App\Models\Depense;
use App\Models\Employe;
use App\Models\Stock;
use App\Models\Tache;
use App\Models\Vente;

class DashboardController extends Controller
{
    public function kpis()
    {
        $annee = now()->year;
        $debut = "{$annee}-01-01";
        $fin = "{$annee}-12-31";

        $totalVentes = Vente::whereBetween('date_vente', [$debut, $fin])->sum('montant_total_fcfa');
        $totalDepenses = Depense::whereBetween('date_depense', [$debut, $fin])->sum('montant_fcfa');

        $stocksEnAlerte = Stock::whereNotNull('seuil_alerte')
            ->whereRaw('quantite_actuelle <= seuil_alerte')
            ->count();

        return response()->json([
            'total_ventes_fcfa' => $totalVentes,
            'total_depenses_fcfa' => $totalDepenses,
            'solde_net_fcfa' => $totalVentes - $totalDepenses,
            'nombre_champs' => Champ::where('est_actif', true)->count(),
            'nombre_cultures_en_cours' => Culture::where('statut', 'en_cours')->count(),
            'nombre_employes_actifs' => Employe::where('est_actif', true)->count(),
            'stocks_en_alerte' => $stocksEnAlerte,
        ]);
    }

    public function depensesRecentes()
    {
        return response()->json(
            Depense::with('champ')->orderBy('date_depense', 'desc')->limit(5)->get()
        );
    }

    public function ventesRecentes()
    {
        return response()->json(
            Vente::with('champ', 'culture')->orderBy('date_vente', 'desc')->limit(5)->get()
        );
    }

    public function stocksAlertes()
    {
        return response()->json(
            Stock::whereNotNull('seuil_alerte')
                ->whereRaw('quantite_actuelle <= seuil_alerte')
                ->with('intrant')
                ->get()
        );
    }

    public function tachesEnCours()
    {
        return response()->json(
            Tache::whereIn('statut', ['a_faire', 'en_cours'])
                ->with('employe', 'champ')
                ->orderBy('date_debut')
                ->get()
        );
    }
}
