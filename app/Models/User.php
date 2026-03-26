<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'Usuarios';
    protected $primaryKey = 'ID_Usuario';
    public $timestamps = false;

    protected $fillable = [
        'Matricula',
        'Numero_Empleado',
        'Nombre',
        'Ap_Paterno',
        'Ap_Materno',
        'Email',
        'Telefono',
        'Empresa',
        'ID_Rol',
        'Contrasena',
        'ID_Estado',
        'Fecha_Creacion'
    ];

    protected $hidden = [
        'Contrasena'
    ];

    protected $casts = [
        'Fecha_Creacion' => 'datetime',
        'ID_Estado' => 'integer',
        'ID_Rol' => 'integer'
    ];

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'ID_Rol', 'ID_Rol');
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(Estado::class, 'ID_Estado', 'ID_Estado');
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->Nombre . ' ' . $this->Ap_Paterno . ' ' . ($this->Ap_Materno ?? ''));
    }

    public function getAuthPassword()
    {
        return $this->Contrasena;
    }

    public function isActive(): bool
    {
        return $this->estado && $this->estado->Nombre === 'Activo';
    }

    public function isAdmin(): bool
    {
        return $this->rol && $this->rol->Nombre_Rol === 'Administrador';
    }
    
    public function hasRole(string $roleName): bool
    {
        return $this->rol && $this->rol->Nombre_Rol === $roleName;
    }
}