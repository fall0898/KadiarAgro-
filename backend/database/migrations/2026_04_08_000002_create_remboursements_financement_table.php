<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('remboursements_financement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financement_id')->constrained('financements')->onDelete('cascade');
            $table->decimal('montant_fcfa', 12, 2);
            $table->date('date_remboursement');
            $table->enum('mode_paiement', ['especes', 'mobile_money', 'virement', 'autre'])->default('especes');
            $table->text('notes')->nullable();
            $table->foreignId('vente_id')->nullable()->constrained('ventes')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('remboursements_financement');
    }
};
