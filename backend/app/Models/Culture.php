<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Culture extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'champ_id', 'nom', 'variete', 'saison', 'annee',
        'date_semis', 'date_recolte_prevue', 'date_recolte_effective',
        'superficie_cultivee_ha', 'quantite_recoltee_kg', 'statut', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_semis' => 'date',
            'date_recolte_prevue' => 'date',
            'date_recolte_effective' => 'date',
        ];
    }

    public function champ() { return $this->belongsTo(Champ::class); }
    public function medias() { return $this->hasMany(Media::class); }
    public function utilisationsIntrants() { return $this->hasMany(UtilisationIntrant::class); }
    public function ventes() { return $this->hasMany(Vente::class); }
    public function mouvementsStock() { return $this->hasMany(MouvementStock::class); }
    public function taches() { return $this->hasMany(Tache::class); }
}
