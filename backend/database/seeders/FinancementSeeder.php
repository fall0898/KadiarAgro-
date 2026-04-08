<?php

namespace Database\Seeders;

use App\Models\Depense;
use App\Models\Employe;
use App\Models\Financement;
use App\Models\RemboursementFinancement;
use App\Models\Vente;
use Illuminate\Database\Seeder;

class FinancementSeeder extends Seeder
{
    public function run(): void
    {
        $admin = \App\Models\User::where('email', 'admin@kadiar-agro.com')->first();

        $data = [
            [
                'employe_nom'      => 'Abdou Aziz Fall',
                'montant_fcfa'     => 202000,
                'motif'            => 'Campagne oignon 2025-2026',
                'date_financement' => '2026-04-08',
                'mode_paiement'    => 'especes',
                'statut'           => 'en_cours',
                'remboursements'   => [],
            ],
            [
                'employe_nom'      => 'Mandickou Fall',
                'montant_fcfa'     => 269000,
                'motif'            => 'Campagne oignon 2025-2026',
                'date_financement' => '2026-04-08',
                'mode_paiement'    => 'especes',
                'statut'           => 'en_cours',
                'remboursements'   => [],
            ],
            [
                'employe_nom'      => 'Ousmane Fall Sa Thies',
                'montant_fcfa'     => 317000,
                'motif'            => 'Campagne oignon 2025-2026',
                'date_financement' => '2026-04-08',
                'mode_paiement'    => 'especes',
                'statut'           => 'en_cours',
                'remboursements'   => [],
            ],
            [
                'employe_nom'      => 'Amadou Diao Fall',
                'montant_fcfa'     => 289000,
                'motif'            => 'Campagne oignon 2025-2026',
                'date_financement' => '2026-04-08',
                'mode_paiement'    => 'especes',
                'statut'           => 'en_cours',
                'remboursements'   => [],
            ],
            [
                'employe_nom'      => 'Ablaye Fall Machine',
                'montant_fcfa'     => 61000,
                'motif'            => 'Campagne oignon 2025-2026',
                'date_financement' => '2026-04-08',
                'mode_paiement'    => 'especes',
                'statut'           => 'en_cours',
                'remboursements'   => [],
            ],
            [
                'employe_nom'      => 'Ablaye Fall',
                'montant_fcfa'     => 310000,
                'motif'            => 'Campagne oignon 2025-2026',
                'date_financement' => '2026-04-08',
                'mode_paiement'    => 'especes',
                'statut'           => 'rembourse',
                'remboursements'   => [
                    [
                        'montant_fcfa'       => 310000,
                        'date_remboursement' => '2026-04-08',
                        'mode_paiement'      => 'especes',
                    ],
                ],
            ],
        ];

        foreach ($data as $item) {
            $employe = Employe::where('nom', $item['employe_nom'])->first();
            if (!$employe) continue;

            // Idempotent : skip si ce financement existe déjà pour cet employé + motif
            $existant = Financement::where('employe_id', $employe->id)
                ->where('motif', $item['motif'])
                ->first();

            if ($existant) continue;

            // Créer la dépense auto
            $depense = Depense::create([
                'user_id'          => $admin->id,
                'categorie'        => 'financement_individuel',
                'description'      => "Financement - {$employe->nom} : {$item['motif']}",
                'montant_fcfa'     => $item['montant_fcfa'],
                'date_depense'     => $item['date_financement'],
                'est_auto_generee' => true,
                'source_type'      => 'financement',
            ]);

            $montantRembourse = collect($item['remboursements'])->sum('montant_fcfa');

            $financement = Financement::create([
                'employe_id'           => $employe->id,
                'user_id'              => $admin->id,
                'montant_fcfa'         => $item['montant_fcfa'],
                'motif'                => $item['motif'],
                'date_financement'     => $item['date_financement'],
                'mode_paiement'        => $item['mode_paiement'],
                'depense_id'           => $depense->id,
                'montant_rembourse_fcfa' => $montantRembourse,
                'statut'               => $item['statut'],
            ]);

            $depense->update(['source_id' => $financement->id]);

            // Remboursements
            foreach ($item['remboursements'] as $r) {
                $vente = Vente::create([
                    'user_id'            => $admin->id,
                    'produit'            => "Remboursement financement - {$employe->nom}",
                    'acheteur'           => $employe->nom,
                    'quantite_kg'        => 1,
                    'prix_unitaire_fcfa' => $r['montant_fcfa'],
                    'montant_total_fcfa' => $r['montant_fcfa'],
                    'date_vente'         => $r['date_remboursement'],
                    'est_auto_generee'   => true,
                    'source_type'        => 'remboursement_financement',
                ]);

                $remboursement = RemboursementFinancement::create([
                    'financement_id'     => $financement->id,
                    'montant_fcfa'       => $r['montant_fcfa'],
                    'date_remboursement' => $r['date_remboursement'],
                    'mode_paiement'      => $r['mode_paiement'],
                    'vente_id'           => $vente->id,
                ]);

                $vente->update(['source_id' => $remboursement->id]);
            }
        }
    }
}
