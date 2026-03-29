<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    protected $table = 'vehiculos';
    protected $primaryKey = 'ID_Vehiculo';
    public $timestamps = false;

    protected $fillable = [
        'Placa',
        'ID_Modelo',
        'Anio',
        'Color',
        'ID_Estado',
        'ID_Usuario', 
    ];

    /**
     * Relación: un vehículo pertenece a un usuario (propietario)
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'ID_Usuario', 'ID_Usuario');
    }

    /**
     * Relación: un vehículo pertenece a un modelo
     */
    public function modelo()
    {
        return $this->belongsTo(Modelo::class, 'ID_Modelo', 'ID_Modelo');
    }

    /**
     * Relación: un vehículo tiene un estado
     */
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'ID_Estado', 'ID_Estado');
    }
}