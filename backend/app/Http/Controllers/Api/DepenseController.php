<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Depense;
use Illuminate\Http\Request;

class DepenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Depense::with('champ', 'user');

        if ($request->champ_id === 'sans') $query->whereNull('champ_id');
        elseif ($request->champ_id) $query->where('champ_id', $request->champ_id);
        if ($request->categorie) $query->where('categorie', $request->categorie);
        if ($request->date_debut) $query->where('date_depense', '>=', $request->date_debut);
        if ($request->date_fin) $query->where('date_depense', '<=', $request->date_fin);

        return response()->json($query->orderBy('date_depense', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'champ_id' => 'nullable|exists:champs,id',
            'categorie' => 'required|in:intrant,salaire,materiel,autre,carburant,main_oeuvre,traitement_phytosanitaire,transport,irrigation,entretien_materiel,alimentation_betail,frais_recolte',
            'description' => 'required|string|max:300',
            'montant_fcfa' => 'required|numeric|min:0',
            'date_depense' => 'required|date',
        ]);

        $data['user_id'] = $request->user()->id;
        $depense = Depense::create($data);

        return response()->json($depense->load('champ'), 201);
    }

    public function show(Depense $depense)
    {
        return response()->json($depense->load('champ', 'user'));
    }

    public function update(Request $request, Depense $depense)
    {
        if ($depense->est_auto_generee) {
            return response()->json(['message' => 'Cette dépense est auto-générée et ne peut pas être modifiée.'], 422);
        }

        $data = $request->validate([
            'champ_id' => 'sometimes|nullable|exists:champs,id',
            'categorie' => 'sometimes|in:intrant,salaire,materiel,autre,carburant,main_oeuvre,traitement_phytosanitaire,transport,irrigation,entretien_materiel,alimentation_betail,frais_recolte',
            'description' => 'sometimes|string|max:300',
            'montant_fcfa' => 'sometimes|numeric|min:0',
            'date_depense' => 'sometimes|date',
        ]);

        $depense->update($data);
        return response()->json($depense->fresh()->load('champ'));
    }

    public function destroy(Depense $depense)
    {
        if ($depense->est_auto_generee) {
            return response()->json(['message' => 'Cette dépense est auto-générée et ne peut pas être supprimée.'], 422);
        }

        $depense->delete();
        return response()->json(['message' => 'Dépense supprimée.']);
    }
}
