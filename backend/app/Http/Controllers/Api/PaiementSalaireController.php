<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Depense;
use App\Models\Employe;
use App\Models\PaiementSalaire;
use Illuminate\Http\Request;

class PaiementSalaireController extends Controller
{
    public function index()
    {
        return response()->json(PaiementSalaire::with('employe')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'montant_fcfa' => 'required|numeric|min:0',
            'mois' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'date_paiement' => 'required|date',
            'mode_paiement' => 'sometimes|in:especes,mobile_money,virement,autre',
            'notes' => 'nullable|string',
        ]);

        $employe = Employe::findOrFail($data['employe_id']);

        // Créer la dépense auto
        $depense = Depense::create([
            'user_id' => $request->user()->id,
            'categorie' => 'salaire',
            'description' => "Salaire {$data['mois']} - {$employe->nom}",
            'montant_fcfa' => $data['montant_fcfa'],
            'date_depense' => $data['date_paiement'],
            'est_auto_generee' => true,
            'source_type' => 'paiement_salaire',
        ]);

        $data['depense_id'] = $depense->id;
        $paiement = PaiementSalaire::create($data);

        $depense->update(['source_id' => $paiement->id]);

        return response()->json($paiement->load('employe', 'depense'), 201);
    }

    public function show(PaiementSalaire $paiementSalaire)
    {
        return response()->json($paiementSalaire->load('employe', 'depense'));
    }

    public function update(Request $request, PaiementSalaire $paiementSalaire)
    {
        $data = $request->validate([
            'montant_fcfa' => 'sometimes|numeric|min:0',
            'mois' => 'sometimes|string|regex:/^\d{4}-\d{2}$/',
            'date_paiement' => 'sometimes|date',
            'mode_paiement' => 'sometimes|in:especes,mobile_money,virement,autre',
            'notes' => 'sometimes|nullable|string',
        ]);

        $paiementSalaire->update($data);
        return response()->json($paiementSalaire->fresh()->load('employe'));
    }

    public function destroy(PaiementSalaire $paiementSalaire)
    {
        $paiementSalaire->delete();
        return response()->json(['message' => 'Paiement supprimé.']);
    }
}
