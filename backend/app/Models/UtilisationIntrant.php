<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UtilisationIntrant extends Model
{
    protected $table = 'utilisations_intrants';

    protected $fillable = [
        'culture_id', 'intrant_id', 'stock_id', 'nom_intrant',
        'quantite', 'unite', 'cout_total_fcfa', 'date_utilisation', 'notes',
    ];

    protected function casts(): array
    {
        return ['date_utilisation' => 'date'];
    }

    public function culture() { return $this->belongsTo(Culture::class); }
    public function intrant() { return $this->belongsTo(Intrant::class); }
    public function stock() { return $this->belongsTo(Stock::class); }
}
