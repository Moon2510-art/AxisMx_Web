<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    protected $table = 'Vehiculos';
    protected $primaryKey = 'ID_Vehiculo';
    public $timestamps = false;

    protected $fillable = [
        'Placa',
        'ID_Modelo',
        'Anio',
        'Color',
        'ID_Estado'
    ];
}