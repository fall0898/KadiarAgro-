<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Depense;
use App\Models\MouvementStock;
use App\Models\Stock;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Stock::with('intrant')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'intrant_id' => 'nullable|exists:intrants,id',
            'nom' => 'required|string|max:200',
            'categorie' => 'required|string|max:100',
            'quantite_actuelle' => 'sometimes|numeric|min:0',
            'unite' => 'required|string|max:20',
            'seuil_alerte' => 'nullable|numeric|min:0',
        ]);

        $data['user_id'] = $request->user()->id;
        $stock = Stock::create($data);

        return response()->json($stock, 201);
    }

    public function show(Stock $stock)
    {
        return response()->json($stock->load('intrant', 'mouvementsStock'));
    }

    public function update(Request $request, Stock $stock)
    {
        $data = $request->validate([
            'nom' => 'sometimes|string|max:200',
            'categorie' => 'sometimes|string|max:100',
            'unite' => 'sometimes|string|max:20',
            'seuil_alerte' => 'sometimes|nullable|numeric|min:0',
            'est_actif' => 'sometimes|boolean',
        ]);

        $stock->update($data);
        return response()->json($stock->fresh());
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();
        return response()->json(['message' => 'Stock supprimé.']);
    }

    public function mouvements(Stock $stock)
    {
        return response()->json($stock->mouvementsStock()->with('culture', 'depense')->orderBy('date_mouvement', 'desc')->get());
    }

    public function ajouterMouvement(Request $request, Stock $stock)
    {
        $data = $request->validate([
            'type' => 'required|in:achat,utilisation,perte,ajustement',
            'quantite' => 'required|numeric|min:0',
            'prix_unitaire_fcfa' => 'nullable|numeric|min:0',
            'fournisseur' => 'nullable|string|max:200',
            'culture_id' => 'nullable|exists:cultures,id',
            'motif' => 'nullable|string|max:300',
            'date_mouvement' => 'required|date',
        ]);

        $data['stock_id'] = $stock->id;
        $depenseId = null;

        if ($data['type'] === 'achat') {
            // Incrémenter le stock
            $stock->increment('quantite_actuelle', $data['quantite']);

            // Calculer le montant
            $montant = isset($data['prix_unitaire_fcfa']) ? $data['quantite'] * $data['prix_unitaire_fcfa'] : null;
            $data['montant_total_fcfa'] = $montant;

            // Créer la dépense auto
            $depense = Depense::create([
                'user_id' => $request->user()->id,
                'categorie' => 'intrant',
                'description' => "Achat {$data['quantite']}{$stock->unite} {$stock->nom}",
                'montant_fcfa' => $montant ?? 0,
                'date_depense' => $data['date_mouvement'],
                'est_auto_generee' => true,
                'source_type' => 'mouvement_stock',
            ]);

            $depenseId = $depense->id;
        } else {
            // Décrémenter ou ajuster
            if (in_array($data['type'], ['utilisation', 'perte'])) {
                $stock->decrement('quantite_actuelle', $data['quantite']);
            }
        }

        $data['depense_id'] = $depenseId;
        $mouvement = MouvementStock::create($data);

        // Lier la dépense au mouvement
        if ($depenseId) {
            $depense->update(['source_id' => $mouvement->id]);
        }

        return response()->json($mouvement->load('depense'), 201);
    }

    public function alertes()
    {
        $stocks = Stock::whereNotNull('seuil_alerte')
            ->whereRaw('quantite_actuelle <= seuil_alerte')
            ->with('intrant')
            ->get();

        return response()->json($stocks);
    }
}
