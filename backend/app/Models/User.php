<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    protected $fillable = [
        'nom', 'email', 'telephone', 'password', 'role', 'est_actif', 'derniere_connexion_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'est_actif' => 'boolean',
            'derniere_connexion_at' => 'datetime',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function champs() { return $this->hasMany(Champ::class); }
    public function depenses() { return $this->hasMany(Depense::class); }
    public function ventes() { return $this->hasMany(Vente::class); }
    public function stocks() { return $this->hasMany(Stock::class); }
    public function employes() { return $this->hasMany(Employe::class); }
}
