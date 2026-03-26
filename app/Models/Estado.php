<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estado extends Model
{
    protected $table = 'Estados';
    protected $primaryKey = 'ID_Estado';
    public $timestamps = false;

    protected $fillable = ['Nombre'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'ID_Estado', 'ID_Estado');
    }

    public function credentials(): HasMany
    {
        return $this->hasMany(Credential::class, 'ID_Estado', 'ID_Estado');
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class, 'ID_Estado', 'ID_Estado');
    }

    public function buses(): HasMany
    {
        return $this->hasMany(Bus::class, 'ID_Estado', 'ID_Estado');
    }
}