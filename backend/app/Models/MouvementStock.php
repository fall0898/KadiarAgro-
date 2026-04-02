<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    protected $table = 'mouvements_stock';

    protected $fillable = [
        'stock_id', 'type', 'quantite', 'prix_unitaire_fcfa',
        'montant_total_fcfa', 'fournisseur', 'depense_id', 'culture_id', 'motif', 'date_mouvement',
    ];

    protected function casts(): array
    {
        return ['date_mouvement' => 'date'];
    }

    public function stock() { return $this->belongsTo(Stock::class); }
    public function depense() { return $this->belongsTo(Depense::class); }
    public function culture() { return $this->belongsTo(Culture::class); }
}
