<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Depense extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'champ_id', 'categorie', 'description',
        'montant_fcfa', 'date_depense', 'est_auto_generee', 'source_type', 'source_id',
    ];

    protected function casts(): array
    {
        return [
            'est_auto_generee' => 'boolean',
            'date_depense' => 'date',
            'montant_fcfa' => 'float',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function champ() { return $this->belongsTo(Champ::class); }
}
