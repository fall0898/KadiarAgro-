<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Financement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employe_id', 'user_id', 'montant_fcfa', 'motif', 'date_financement',
        'mode_paiement', 'notes', 'depense_id', 'montant_rembourse_fcfa', 'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_financement' => 'date',
            'montant_fcfa' => 'float',
            'montant_rembourse_fcfa' => 'float',
        ];
    }

    public function employe() { return $this->belongsTo(Employe::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function depense() { return $this->belongsTo(Depense::class); }
    public function remboursements() { return $this->hasMany(RemboursementFinancement::class); }
}
