<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class VenteController extends Controller
{
    public function index(Request $request)
    {
        $query = Vente::with('champ', 'culture', 'user');

        if ($request->champ_id) $query->where('champ_id', $request->champ_id);
        if ($request->culture_id) $query->where('culture_id', $request->culture_id);
        if ($request->date_debut) $query->where('date_vente', '>=', $request->date_debut);
        if ($request->date_fin) $query->where('date_vente', '<=', $request->date_fin);

        return response()->json($query->orderBy('date_vente', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'champ_id' => 'nullable|exists:champs,id',
            'culture_id' => 'nullable|exists:cultures,id',
            'acheteur' => 'nullable|string|max:200',
            'produit' => 'required|string|max:200',
            'quantite_kg' => 'required|numeric|min:0',
            'prix_unitaire_fcfa' => 'required|numeric|min:0',
            'date_vente' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $data['montant_total_fcfa'] = $data['quantite_kg'] * $data['prix_unitaire_fcfa'];
        $data['user_id'] = $request->user()->id;

        $vente = Vente::create($data);
        return response()->json($vente->load('champ', 'culture'), 201);
    }

    public function show(Vente $vente)
    {
        return response()->json($vente->load('champ', 'culture', 'user'));
    }

    public function update(Request $request, Vente $vente)
    {
        $data = $request->validate([
            'champ_id' => 'sometimes|nullable|exists:champs,id',
            'culture_id' => 'sometimes|nullable|exists:cultures,id',
            'acheteur' => 'sometimes|nullable|string|max:200',
            'produit' => 'sometimes|string|max:200',
            'quantite_kg' => 'sometimes|numeric|min:0',
            'prix_unitaire_fcfa' => 'sometimes|numeric|min:0',
            'date_vente' => 'sometimes|date',
            'notes' => 'sometimes|nullable|string',
        ]);

        if (isset($data['quantite_kg']) || isset($data['prix_unitaire_fcfa'])) {
            $qte = $data['quantite_kg'] ?? $vente->quantite_kg;
            $prix = $data['prix_unitaire_fcfa'] ?? $vente->prix_unitaire_fcfa;
            $data['montant_total_fcfa'] = $qte * $prix;
        }

        $vente->update($data);
        return response()->json($vente->fresh()->load('champ', 'culture'));
    }

    public function destroy(Vente $vente)
    {
        $vente->delete();
        return response()->json(['message' => 'Vente supprimée.']);
    }

    public function recuPdf(Vente $vente)
    {
        $vente->load('champ', 'culture');
        $pdf = Pdf::loadView('pdf.recu-vente', ['vente' => $vente]);
        return $pdf->download("recu-VNT-{$vente->id}.pdf");
    }
}
