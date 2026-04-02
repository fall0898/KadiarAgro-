<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('depenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('champ_id')->nullable()->constrained('champs')->nullOnDelete();
            $table->enum('categorie', [
                'intrant', 'salaire', 'materiel', 'autre', 'carburant',
                'main_oeuvre', 'traitement_phytosanitaire', 'transport',
                'irrigation', 'entretien_materiel', 'alimentation_betail', 'frais_recolte'
            ]);
            $table->string('description', 300);
            $table->decimal('montant_fcfa', 14, 2);
            $table->date('date_depense');
            $table->boolean('est_auto_generee')->default(false);
            $table->string('source_type', 50)->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('depenses');
    }
};
