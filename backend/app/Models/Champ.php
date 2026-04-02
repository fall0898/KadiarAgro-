<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Champ extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'nom', 'superficie_ha', 'localisation',
        'latitude', 'longitude', 'description', 'est_actif',
    ];

    protected function casts(): array
    {
        return ['est_actif' => 'boolean', 'superficie_ha' => 'float', 'latitude' => 'float', 'longitude' => 'float'];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function cultures() { return $this->hasMany(Culture::class); }
    public function depenses() { return $this->hasMany(Depense::class); }
    public function ventes() { return $this->hasMany(Vente::class); }
    public function taches() { return $this->hasMany(Tache::class); }
}
