<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tache extends Model
{
    protected $fillable = [
        'employe_id', 'champ_id', 'culture_id', 'titre', 'description',
        'date_debut', 'date_fin', 'statut', 'priorite',
    ];

    protected function casts(): array
    {
        return ['date_debut' => 'date', 'date_fin' => 'date'];
    }

    public function employe() { return $this->belongsTo(Employe::class); }
    public function champ() { return $this->belongsTo(Champ::class); }
    public function culture() { return $this->belongsTo(Culture::class); }
}
