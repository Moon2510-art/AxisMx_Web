<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Visitante extends Model
{
    protected $table = 'visitantes';
    protected $primaryKey = 'ID_Visitante';
    public $timestamps = false;

    protected $fillable = [
        'Nombre',
        'Compania',
        'Descripcion',
        'Email',
        'Telefono',
        'Estado',
        'QR',
        'Fecha', 
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($visitante) {
            if (!$visitante->QR) {
                $visitante->QR = Str::random(20);
            }
        });
    }
}