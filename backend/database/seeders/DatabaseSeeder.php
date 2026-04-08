<?php

namespace Database\Seeders;

use App\Models\Champ;
use App\Models\Employe;
use App\Models\Intrant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Idempotent : ne crée que si l'utilisateur n'existe pas déjà
        User::firstOrCreate(
            ['email' => 'admin@kadiar-agro.com'],
            [
                'nom'      => 'Administrateur',
                'password' => Hash::make('password'),
                'role'     => 'admin',
                'est_actif' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'lecteur@kadiar-agro.com'],
            [
                'nom'      => 'Lecteur',
                'password' => Hash::make('password'),
                'role'     => 'lecteur',
                'est_actif' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'serigne-kadiar@gmail.com'],
            [
                'nom'      => 'Serigne Kadiar Mafal Fall',
                'password' => Hash::make('password'),
                'role'     => 'lecteur',
                'est_actif' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'fall@gmail.com'],
            [
                'nom'      => 'Abdou Aziz Fall',
                'password' => Hash::make('password'),
                'role'     => 'lecteur',
                'est_actif' => true,
            ]
        );

        $intrants = [
            ['nom' => 'NPK 15-15-15',        'categorie' => 'Engrais',                 'unite' => 'kg'],
            ['nom' => 'Urée 46%',             'categorie' => 'Engrais',                 'unite' => 'kg'],
            ['nom' => 'Semence de riz',       'categorie' => 'Semence',                 'unite' => 'kg'],
            ['nom' => "Semence d'oignon",     'categorie' => 'Semence',                 'unite' => 'kg'],
            ['nom' => 'Herbicide',            'categorie' => 'Produit phytosanitaire',  'unite' => 'L'],
            ['nom' => 'Insecticide',          'categorie' => 'Produit phytosanitaire',  'unite' => 'L'],
            ['nom' => 'Fumure organique',     'categorie' => 'Amendement',              'unite' => 'kg'],
        ];

        foreach ($intrants as $intrant) {
            Intrant::firstOrCreate(['nom' => $intrant['nom']], $intrant);
        }

        // Champs de base (ordre important pour les FK du seeder de dépenses)
        $admin = User::where('email', 'admin@kadiar-agro.com')->first();
        foreach (['Yokh', 'Ablaye Fall', 'Razel', 'Projet'] as $nom) {
            Champ::firstOrCreate(['nom' => $nom], ['user_id' => $admin->id]);
        }

        // Employés — firstOrCreate par nom pour survivre aux resets
        $employes = [
            ['nom' => 'Abdou Aziz Fall',       'poste' => 'Gérant',  'telephone' => '775759378'],
            ['nom' => 'Mandickou Fall',         'poste' => 'Ouvrier', 'telephone' => null],
            ['nom' => 'Ousmane Fall Sa Thies',  'poste' => 'Ouvrier', 'telephone' => null],
            ['nom' => 'Amadou Diao Fall',       'poste' => 'Ouvrier', 'telephone' => null],
            ['nom' => 'Ablaye Fall Machine',    'poste' => null,      'telephone' => null],
            ['nom' => 'Ablaye Fall',            'poste' => 'Ouvrier', 'telephone' => null],
        ];

        foreach ($employes as $e) {
            Employe::firstOrCreate(
                ['nom' => $e['nom']],
                [
                    'user_id'            => $admin->id,
                    'poste'              => $e['poste'],
                    'telephone'          => $e['telephone'],
                    'salaire_mensuel_fcfa' => 0,
                    'est_actif'          => true,
                ]
            );
        }

        $this->call(DepenseSeeder::class);
    }
}
