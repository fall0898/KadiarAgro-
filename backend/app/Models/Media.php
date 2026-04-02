<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $table = 'medias';

    protected $fillable = [
        'culture_id', 'type', 'fichier_url', 'fichier_nom',
        'taille_octets', 'description', 'date_prise',
    ];

    protected function casts(): array
    {
        return ['date_prise' => 'date'];
    }

    public function culture() { return $this->belongsTo(Culture::class); }
}
