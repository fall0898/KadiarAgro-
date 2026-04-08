<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE depenses MODIFY COLUMN categorie ENUM(
            'intrant','salaire','materiel','autre','carburant',
            'main_oeuvre','traitement_phytosanitaire','transport',
            'irrigation','entretien_materiel','alimentation_betail',
            'frais_recolte','financement_individuel'
        ) NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE depenses MODIFY COLUMN categorie ENUM(
            'intrant','salaire','materiel','autre','carburant',
            'main_oeuvre','traitement_phytosanitaire','transport',
            'irrigation','entretien_materiel','alimentation_betail',
            'frais_recolte'
        ) NOT NULL");
    }
};
