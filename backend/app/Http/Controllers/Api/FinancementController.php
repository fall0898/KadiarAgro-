<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Depense;
use App\Models\Employe;
use App\Models\Financement;
use App\Models\RemboursementFinancement;
use App\Models\Vente;
use Illuminate\Http\Request;

class FinancementController extends Controller
{
    public function index()
    {
        return response()->json(Financement::with('employe')->orderBy('date_financement', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employe_id'       => 'required|exists:employes,id',
            'montant_fcfa'     => 'required|numeric|min:1',
            'motif'            => 'nullable|string|max:255',
            'date_financement' => 'required|date',
            'mode_paiement'    => 'sometimes|in:especes,mobile_money,virement,autre',
            'notes'            => 'nullable|string',
        ]);

        $employe = Employe::findOrFail($data['employe_id']);

        $description = "Financement - {$employe->nom}";
        if (!empty($data['motif'])) {
            $description .= " : {$data['motif']}";
        }

        // Créer la dépense auto
        $depense = Depense::create([
            'user_id'          => $request->user()->id,
            'categorie'        => 'financement_individuel',
            'description'      => $description,
            'montant_fcfa'     => $data['montant_fcfa'],
            'date_depense'     => $data['date_financement'],
            'est_auto_generee' => true,
            'source_type'      => 'financement',
        ]);

        $data['user_id']    = $request->user()->id;
        $data['depense_id'] = $depense->id;
        $financement = Financement::create($data);

        $depense->update(['source_id' => $financement->id]);

        return response()->json($financement->load('employe', 'depense'), 201);
    }

    public function show(Financement $financement)
    {
        return response()->json($financement->load('employe', 'depense', 'remboursements'));
    }

    public function addRemboursement(Request $request, Financement $financement)
    {
        $data = $request->validate([
            'montant_fcfa'       => 'required|numeric|min:1',
            'date_remboursement' => 'required|date',
            'mode_paiement'      => 'sometimes|in:especes,mobile_money,virement,autre',
            'notes'              => 'nullable|string',
        ]);

        $restant = $financement->montant_fcfa - $financement->montant_rembourse_fcfa;
        if ($data['montant_fcfa'] > $restant) {
            return response()->json([
                'message' => "Le montant dépasse le solde restant dû ({$restant} FCFA).",
            ], 422);
        }

        $employe = $financement->employe;

        // Créer la vente auto (recette de remboursement)
        $vente = Vente::create([
            'user_id'           => $request->user()->id,
            'produit'           => "Remboursement financement - {$employe->nom}",
            'acheteur'          => $employe->nom,
            'quantite_kg'       => 1,
            'prix_unitaire_fcfa'=> $data['montant_fcfa'],
            'montant_total_fcfa'=> $data['montant_fcfa'],
            'date_vente'        => $data['date_remboursement'],
            'est_auto_generee'  => true,
            'source_type'       => 'remboursement_financement',
        ]);

        $data['financement_id'] = $financement->id;
        $data['vente_id']       = $vente->id;
        $remboursement = RemboursementFinancement::create($data);

        $vente->update(['source_id' => $remboursement->id]);

        // Mettre à jour le montant remboursé et le statut
        $financement->increment('montant_rembourse_fcfa', $data['montant_fcfa']);
        $financement->refresh();

        $statut = $financement->montant_rembourse_fcfa >= $financement->montant_fcfa
            ? 'rembourse'
            : 'partiel';
        $financement->update(['statut' => $statut]);

        return response()->json($remboursement, 201);
    }

    public function destroy(Financement $financement)
    {
        if ($financement->remboursements()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer un financement avec des remboursements enregistrés.',
            ], 422);
        }

        // Supprimer la dépense auto associée
        if ($financement->depense_id) {
            Depense::find($financement->depense_id)?->forceDelete();
        }

        $financement->delete();
        return response()->json(['message' => 'Financement supprimé.']);
    }
}
