<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employe_id')->constrained('employes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('montant_fcfa', 12, 2);
            $table->string('motif')->nullable();
            $table->date('date_financement');
            $table->enum('mode_paiement', ['especes', 'mobile_money', 'virement', 'autre'])->default('especes');
            $table->text('notes')->nullable();
            $table->foreignId('depense_id')->nullable()->constrained('depenses')->nullOnDelete();
            $table->decimal('montant_rembourse_fcfa', 12, 2)->default(0);
            $table->enum('statut', ['en_cours', 'partiel', 'rembourse'])->default('en_cours');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financements');
    }
};
