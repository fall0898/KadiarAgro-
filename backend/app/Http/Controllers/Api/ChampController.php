<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Champ;
use Illuminate\Http\Request;

class ChampController extends Controller
{
    public function index()
    {
        $champs = Champ::with('user')->withCount('cultures')->get();
        return response()->json($champs);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:150',
            'superficie_ha' => 'required|numeric|min:0',
            'localisation' => 'nullable|string|max:300',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'description' => 'nullable|string',
        ]);

        $data['user_id'] = $request->user()->id;
        $champ = Champ::create($data);

        return response()->json($champ, 201);
    }

    public function show(Champ $champ)
    {
        return response()->json($champ->load('user', 'cultures'));
    }

    public function update(Request $request, Champ $champ)
    {
        $data = $request->validate([
            'nom' => 'sometimes|string|max:150',
            'superficie_ha' => 'sometimes|numeric|min:0',
            'localisation' => 'sometimes|nullable|string|max:300',
            'latitude' => 'sometimes|nullable|numeric',
            'longitude' => 'sometimes|nullable|numeric',
            'description' => 'sometimes|nullable|string',
            'est_actif' => 'sometimes|boolean',
        ]);

        $champ->update($data);
        return response()->json($champ->fresh());
    }

    public function destroy(Champ $champ)
    {
        $champ->delete();
        return response()->json(['message' => 'Champ supprimé.']);
    }

    public function cultures(Champ $champ)
    {
        return response()->json($champ->cultures()->get());
    }

    public function depenses(Champ $champ)
    {
        return response()->json($champ->depenses()->get());
    }

    public function ventes(Champ $champ)
    {
        return response()->json($champ->ventes()->get());
    }

    public function finance(Champ $champ)
    {
        $totalVentes = $champ->ventes()->sum('montant_total_fcfa');
        $totalDepenses = $champ->depenses()->sum('montant_fcfa');

        return response()->json([
            'champ_id' => $champ->id,
            'champ_nom' => $champ->nom,
            'total_ventes_fcfa' => $totalVentes,
            'total_depenses_fcfa' => $totalDepenses,
            'solde_net_fcfa' => $totalVentes - $totalDepenses,
        ]);
    }
}
