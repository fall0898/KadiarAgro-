<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Intrant extends Model
{
    protected $fillable = ['nom', 'categorie', 'unite', 'description', 'est_actif'];

    protected function casts(): array
    {
        return ['est_actif' => 'boolean'];
    }

    public function stocks() { return $this->hasMany(Stock::class); }
    public function utilisations() { return $this->hasMany(UtilisationIntrant::class); }
}
