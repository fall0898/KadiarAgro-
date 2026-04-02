<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vente extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'champ_id', 'culture_id', 'acheteur', 'produit',
        'quantite_kg', 'prix_unitaire_fcfa', 'montant_total_fcfa', 'date_vente', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_vente' => 'date',
            'quantite_kg' => 'float',
            'prix_unitaire_fcfa' => 'float',
            'montant_total_fcfa' => 'float',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function champ() { return $this->belongsTo(Champ::class); }
    public function culture() { return $this->belongsTo(Culture::class); }
}
