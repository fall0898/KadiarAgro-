<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaiementSalaire extends Model
{
    protected $table = 'paiements_salaire';

    protected $fillable = [
        'employe_id', 'montant_fcfa', 'mois', 'date_paiement',
        'mode_paiement', 'notes', 'depense_id',
    ];

    protected function casts(): array
    {
        return ['date_paiement' => 'date', 'montant_fcfa' => 'float'];
    }

    public function employe() { return $this->belongsTo(Employe::class); }
    public function depense() { return $this->belongsTo(Depense::class); }
}
