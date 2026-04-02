<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Culture;
use App\Models\MouvementStock;
use App\Models\Stock;
use App\Models\UtilisationIntrant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CultureController extends Controller
{
    public function index(Request $request)
    {
        $query = Culture::with('champ');

        if ($request->champ_id) $query->where('champ_id', $request->champ_id);
        if ($request->saison) $query->where('saison', $request->saison);
        if ($request->annee) $query->where('annee', $request->annee);
        if ($request->statut) $query->where('statut', $request->statut);
        if ($request->search) $query->where('nom', 'like', '%' . $request->search . '%');

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'champ_id' => 'required|exists:champs,id',
            'nom' => 'required|string|max:150',
            'variete' => 'nullable|string|max:100',
            'saison' => 'required|in:normale,contre_saison',
            'annee' => 'required|integer|min:2000|max:2100',
            'date_semis' => 'nullable|date',
            'date_recolte_prevue' => 'nullable|date',
            'date_recolte_effective' => 'nullable|date',
            'superficie_cultivee_ha' => 'nullable|numeric|min:0',
            'quantite_recoltee_kg' => 'nullable|numeric|min:0',
            'statut' => 'sometimes|in:en_cours,recolte,termine',
            'notes' => 'nullable|string',
        ]);

        $culture = Culture::create($data);
        return response()->json($culture->load('champ'), 201);
    }

    public function show(Culture $culture)
    {
        return response()->json($culture->load('champ', 'medias', 'utilisationsIntrants'));
    }

    public function update(Request $request, Culture $culture)
    {
        $data = $request->validate([
            'nom' => 'sometimes|string|max:150',
            'variete' => 'sometimes|nullable|string|max:100',
            'saison' => 'sometimes|in:normale,contre_saison',
            'annee' => 'sometimes|integer|min:2000|max:2100',
            'date_semis' => 'sometimes|nullable|date',
            'date_recolte_prevue' => 'sometimes|nullable|date',
            'date_recolte_effective' => 'sometimes|nullable|date',
            'superficie_cultivee_ha' => 'sometimes|nullable|numeric|min:0',
            'quantite_recoltee_kg' => 'sometimes|nullable|numeric|min:0',
            'statut' => 'sometimes|in:en_cours,recolte,termine',
            'notes' => 'sometimes|nullable|string',
        ]);

        $culture->update($data);
        return response()->json($culture->fresh()->load('champ'));
    }

    public function destroy(Culture $culture)
    {
        $culture->delete();
        return response()->json(['message' => 'Culture supprimée.']);
    }

    public function intrants(Culture $culture)
    {
        return response()->json($culture->utilisationsIntrants()->with('intrant', 'stock')->get());
    }

    public function addIntrant(Request $request, Culture $culture)
    {
        $data = $request->validate([
            'intrant_id' => 'nullable|exists:intrants,id',
            'stock_id' => 'nullable|exists:stocks,id',
            'nom_intrant' => 'required|string|max:200',
            'quantite' => 'required|numeric|min:0',
            'unite' => 'required|string|max:20',
            'cout_total_fcfa' => 'nullable|numeric|min:0',
            'date_utilisation' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $data['culture_id'] = $culture->id;
        $utilisation = UtilisationIntrant::create($data);

        // Débiter le stock si stock_id fourni
        if (!empty($data['stock_id'])) {
            $stock = Stock::findOrFail($data['stock_id']);
            $stock->decrement('quantite_actuelle', $data['quantite']);

            MouvementStock::create([
                'stock_id' => $stock->id,
                'type' => 'utilisation',
                'quantite' => $data['quantite'],
                'culture_id' => $culture->id,
                'motif' => 'Utilisation sur culture : ' . $culture->nom,
                'date_mouvement' => $data['date_utilisation'],
            ]);
        }

        return response()->json($utilisation->load('intrant', 'stock'), 201);
    }

    public function deleteIntrant(UtilisationIntrant $utilisationsIntrant)
    {
        $utilisationsIntrant->delete();
        return response()->json(['message' => 'Intrant supprimé.']);
    }

    public function medias(Culture $culture)
    {
        return response()->json($culture->medias()->get());
    }

    public function uploadMedia(Request $request, Culture $culture)
    {
        $request->validate([
            'fichier' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi|max:102400',
            'description' => 'nullable|string|max:300',
            'date_prise' => 'nullable|date',
        ]);

        $file = $request->file('fichier');
        $type = str_starts_with($file->getMimeType(), 'video') ? 'video' : 'photo';
        $path = $file->store("medias/cultures/{$culture->id}", 'public');

        $media = $culture->medias()->create([
            'type' => $type,
            'fichier_url' => '/storage/' . $path,
            'fichier_nom' => $file->getClientOriginalName(),
            'taille_octets' => $file->getSize(),
            'description' => $request->description,
            'date_prise' => $request->date_prise,
        ]);

        return response()->json($media, 201);
    }

    public function deleteMedia(\App\Models\Media $media)
    {
        $path = str_replace('/storage/', '', $media->fichier_url);
        Storage::disk('public')->delete($path);
        $media->delete();
        return response()->json(['message' => 'Média supprimé.']);
    }
}
