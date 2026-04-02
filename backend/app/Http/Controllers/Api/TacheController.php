<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tache;
use Illuminate\Http\Request;

class TacheController extends Controller
{
    public function index(Request $request)
    {
        $query = Tache::with('employe', 'champ', 'culture');

        if ($request->employe_id) $query->where('employe_id', $request->employe_id);
        if ($request->champ_id) $query->where('champ_id', $request->champ_id);
        if ($request->statut) $query->where('statut', $request->statut);
        if ($request->priorite) $query->where('priorite', $request->priorite);

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'champ_id' => 'nullable|exists:champs,id',
            'culture_id' => 'nullable|exists:cultures,id',
            'titre' => 'required|string|max:200',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'statut' => 'sometimes|in:a_faire,en_cours,termine,annule',
            'priorite' => 'sometimes|in:basse,normale,haute,urgente',
        ]);

        $tache = Tache::create($data);
        return response()->json($tache->load('employe', 'champ', 'culture'), 201);
    }

    public function show(Tache $tache)
    {
        return response()->json($tache->load('employe', 'champ', 'culture'));
    }

    public function update(Request $request, Tache $tache)
    {
        $data = $request->validate([
            'employe_id' => 'sometimes|exists:employes,id',
            'champ_id' => 'sometimes|nullable|exists:champs,id',
            'culture_id' => 'sometimes|nullable|exists:cultures,id',
            'titre' => 'sometimes|string|max:200',
            'description' => 'sometimes|nullable|string',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'sometimes|nullable|date',
            'statut' => 'sometimes|in:a_faire,en_cours,termine,annule',
            'priorite' => 'sometimes|in:basse,normale,haute,urgente',
        ]);

        $tache->update($data);
        return response()->json($tache->fresh()->load('employe', 'champ', 'culture'));
    }

    public function destroy(Tache $tache)
    {
        $tache->delete();
        return response()->json(['message' => 'Tâche supprimée.']);
    }

    public function updateStatut(Request $request, Tache $tache)
    {
        $request->validate(['statut' => 'required|in:a_faire,en_cours,termine,annule']);
        $tache->update(['statut' => $request->statut]);
        return response()->json($tache->fresh());
    }
}
