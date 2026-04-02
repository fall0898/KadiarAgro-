<?php

namespace Database\Seeders;

use App\Models\Intrant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nom' => 'Administrateur',
            'email' => 'admin@kadiar-agro.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'est_actif' => true,
        ]);

        User::create([
            'nom' => 'Lecteur',
            'email' => 'lecteur@kadiar-agro.com',
            'password' => Hash::make('password'),
            'role' => 'lecteur',
            'est_actif' => true,
        ]);

        $intrants = [
            ['nom' => 'NPK 15-15-15', 'categorie' => 'Engrais', 'unite' => 'kg'],
            ['nom' => 'Urée 46%', 'categorie' => 'Engrais', 'unite' => 'kg'],
            ['nom' => 'Semence de riz', 'categorie' => 'Semence', 'unite' => 'kg'],
            ['nom' => "Semence d'oignon", 'categorie' => 'Semence', 'unite' => 'kg'],
            ['nom' => 'Herbicide', 'categorie' => 'Produit phytosanitaire', 'unite' => 'L'],
            ['nom' => 'Insecticide', 'categorie' => 'Produit phytosanitaire', 'unite' => 'L'],
            ['nom' => 'Fumure organique', 'categorie' => 'Amendement', 'unite' => 'kg'],
        ];

        foreach ($intrants as $intrant) {
            Intrant::create($intrant);
        }
    }
}
