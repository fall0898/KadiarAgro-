<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employe extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'nom', 'telephone', 'poste',
        'date_embauche', 'salaire_mensuel_fcfa', 'est_actif', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'est_actif' => 'boolean',
            'date_embauche' => 'date',
            'salaire_mensuel_fcfa' => 'float',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function taches() { return $this->hasMany(Tache::class); }
    public function paiementsSalaire() { return $this->hasMany(PaiementSalaire::class); }
}
