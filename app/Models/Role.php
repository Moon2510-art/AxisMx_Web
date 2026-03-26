<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $table = 'Roles';
    protected $primaryKey = 'ID_Rol';
    public $timestamps = false;

    protected $fillable = [
        'Nombre_Rol',
        'Descripcion'
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'ID_Rol', 'ID_Rol');
    }
}