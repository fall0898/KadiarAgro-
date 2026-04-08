<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RemboursementFinancement extends Model
{
    protected $table = 'remboursements_financement';

    protected $fillable = [
        'financement_id', 'montant_fcfa', 'date_remboursement',
        'mode_paiement', 'notes', 'vente_id',
    ];

    protected function casts(): array
    {
        return [
            'date_remboursement' => 'date',
            'montant_fcfa' => 'float',
        ];
    }

    public function financement() { return $this->belongsTo(Financement::class); }
    public function vente() { return $this->belongsTo(Vente::class); }
}
