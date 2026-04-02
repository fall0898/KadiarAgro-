<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $fillable = [
        'user_id', 'intrant_id', 'nom', 'categorie',
        'quantite_actuelle', 'unite', 'seuil_alerte', 'est_actif',
    ];

    protected function casts(): array
    {
        return [
            'est_actif' => 'boolean',
            'quantite_actuelle' => 'float',
            'seuil_alerte' => 'float',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function intrant() { return $this->belongsTo(Intrant::class); }
    public function mouvementsStock() { return $this->hasMany(MouvementStock::class); }

    public function estEnAlerte(): bool
    {
        return $this->seuil_alerte !== null && $this->quantite_actuelle <= $this->seuil_alerte;
    }
}
