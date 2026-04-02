<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intrants', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 200);
            $table->string('categorie', 100);
            $table->string('unite', 20);
            $table->text('description')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intrants');
    }
};
