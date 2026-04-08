<?php

namespace Database\Seeders;

use App\Models\Vente;
use Illuminate\Database\Seeder;

class VenteSeeder extends Seeder
{
    public function run(): void
    {
        // Ne pas ré-insérer si toutes les ventes manuelles existent déjà (15 attendues)
        if (Vente::where('est_auto_generee', false)->count() >= 15) {
            return;
        }

        $userId = 1; // admin

        // [champ_id, produit, quantite_kg, prix_unitaire_fcfa, montant_total_fcfa, date_vente, notes]
        $ventes = [
            // Yokh — Tomate (4 lots)
            [1, 'Tomate', 2480,   59.5,   147560, '2026-04-08', '1) 90 caisses'],
            [1, 'Tomate', 2370,   59.5,   141015, '2026-04-08', '2) 90 caisses'],
            [1, 'Tomate', 2220,   59.5,   132090, '2026-04-08', '3) 90 caisses'],
            [1, 'Tomate', 2510,   59.5,   149345, '2026-04-08', '4) 90 caisses'],
            // Ablaye Fall — Tomate (4 lots)
            [2, 'Tomate', 2450,   59.5,   145775, '2026-04-08', '1) 90 caisses'],
            [2, 'Tomate', 1950,   59.5,   116025, '2026-04-08', '2) 70 caisses'],
            [2, 'Tomate', 2390,   59.5,   142205, '2026-04-08', '3) 90 Caisses'],
            [2, 'Tomate', 2440,   59.5,   145180, '2026-04-08', '4) 90 Caisses'],
            // Razel — Tomate (5 lots)
            [3, 'Tomate', 2400,   59.5,   142800, '2026-04-08', '1) 90 Caisses'],
            [3, 'Tomate', 2430,   59.5,   144585, '2026-04-08', '2) 90 Caisses'],
            [3, 'Tomate', 760,    59.5,    45220, '2026-04-08', '3) 30 Caisses'],
            [3, 'Tomate', 2130,   59.5,   126735, '2026-04-08', '4) 80 Caisses'],
            [3, 'Tomate', 2080,   59.5,   123760, '2026-04-08', '5) 80 Caisses'],
            // Yokh — Tomate particulier (cargo mixte)
            [1, 'Tomate', 3466.66, 269.71, 935000, '2026-04-08', 'Récolte Tomate Particulier petit cargo 270 grand cargo 180'],
            // Yokh — Oignon
            [1, 'Oignon', 187,  5000,   935000, '2026-04-08', 'Récolte Oignon Champs Yokh ( Environ 190 Sacs)'],
        ];

        foreach ($ventes as [$champId, $produit, $qte, $prixUnit, $montant, $date, $notes]) {
            Vente::firstOrCreate(
                [
                    'champ_id'          => $champId,
                    'produit'           => $produit,
                    'montant_total_fcfa' => $montant,
                    'date_vente'        => $date,
                    'notes'             => $notes,
                ],
                [
                    'user_id'            => $userId,
                    'quantite_kg'        => $qte,
                    'prix_unitaire_fcfa' => $prixUnit,
                    'est_auto_generee'   => false,
                ]
            );
        }
    }
}
