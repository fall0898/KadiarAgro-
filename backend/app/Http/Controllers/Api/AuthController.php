<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->where('est_actif', true)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        $user->update(['derniere_connexion_at' => now()]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function user(Request $request)
    {
        return response()->json(['user' => $this->formatUser($request->user())]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'telephone' => 'sometimes|nullable|string|max:20',
        ]);

        $user->update($data);

        return response()->json(['user' => $this->formatUser($user->fresh())]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'ancien_password' => 'required|string',
            'nouveau_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->ancien_password, $user->password)) {
            return response()->json(['message' => 'Ancien mot de passe incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->nouveau_password)]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'nom' => $user->nom,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'role' => $user->role,
            'est_actif' => $user->est_actif,
            'derniere_connexion_at' => $user->derniere_connexion_at,
        ];
    }
}
