<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intrant;
use Illuminate\Http\Request;

class IntrantController extends Controller
{
    public function index()
    {
        return response()->json(Intrant::where('est_actif', true)->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:200',
            'categorie' => 'required|string|max:100',
            'unite' => 'required|string|max:20',
            'description' => 'nullable|string',
        ]);

        $intrant = Intrant::create($data);
        return response()->json($intrant, 201);
    }

    public function update(Request $request, Intrant $intrant)
    {
        $data = $request->validate([
            'nom' => 'sometimes|string|max:200',
            'categorie' => 'sometimes|string|max:100',
            'unite' => 'sometimes|string|max:20',
            'description' => 'sometimes|nullable|string',
            'est_actif' => 'sometimes|boolean',
        ]);

        $intrant->update($data);
        return response()->json($intrant->fresh());
    }

    public function destroy(Intrant $intrant)
    {
        $intrant->update(['est_actif' => false]);
        return response()->json(['message' => 'Intrant désactivé.']);
    }
}
