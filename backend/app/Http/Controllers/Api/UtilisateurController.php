<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UtilisateurController extends Controller
{
    public function index()
    {
        return response()->json(User::withTrashed()->get()->map(fn($u) => $this->format($u)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'telephone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,lecteur',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json($this->format($user), 201);
    }

    public function show(User $utilisateur)
    {
        return response()->json($this->format($utilisateur));
    }

    public function update(Request $request, User $utilisateur)
    {
        $data = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $utilisateur->id,
            'telephone' => 'sometimes|nullable|string|max:20',
            'role' => 'sometimes|in:admin,lecteur',
            'est_actif' => 'sometimes|boolean',
            'password' => 'sometimes|string|min:8',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $utilisateur->update($data);

        return response()->json($this->format($utilisateur->fresh()));
    }

    public function destroy(User $utilisateur)
    {
        $utilisateur->delete();
        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    private function format(User $user): array
    {
        return [
            'id' => $user->id,
            'nom' => $user->nom,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'role' => $user->role,
            'est_actif' => $user->est_actif,
            'derniere_connexion_at' => $user->derniere_connexion_at,
            'created_at' => $user->created_at,
        ];
    }
}
