<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employe;
use Illuminate\Http\Request;

class EmployeController extends Controller
{
    public function index()
    {
        return response()->json(Employe::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'poste' => 'nullable|string|max:100',
            'date_embauche' => 'nullable|date',
            'salaire_mensuel_fcfa' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $data['user_id'] = $request->user()->id;
        $employe = Employe::create($data);

        return response()->json($employe, 201);
    }

    public function show(Employe $employe)
    {
        return response()->json($employe->load('taches', 'paiementsSalaire'));
    }

    public function update(Request $request, Employe $employe)
    {
        $data = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'telephone' => 'sometimes|nullable|string|max:20',
            'poste' => 'sometimes|nullable|string|max:100',
            'date_embauche' => 'sometimes|nullable|date',
            'salaire_mensuel_fcfa' => 'sometimes|nullable|numeric|min:0',
            'est_actif' => 'sometimes|boolean',
            'notes' => 'sometimes|nullable|string',
        ]);

        $employe->update($data);
        return response()->json($employe->fresh());
    }

    public function destroy(Employe $employe)
    {
        $employe->delete();
        return response()->json(['message' => 'Employé supprimé.']);
    }

    public function taches(Employe $employe)
    {
        return response()->json($employe->taches()->with('champ', 'culture')->get());
    }

    public function paiements(Employe $employe)
    {
        return response()->json($employe->paiementsSalaire()->get());
    }
}
