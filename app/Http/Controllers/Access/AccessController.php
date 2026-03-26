<?php

namespace App\Http\Controllers\Access;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccessController extends Controller
{
    public function index()
    {
        $logs = DB::table('Registros_Acceso as r')
            ->leftJoin('Credenciales as c', 'r.ID_Credencial', '=', 'c.ID_Credencial')
            ->leftJoin('Usuarios as u', 'c.ID_Usuario', '=', 'u.ID_Usuario')
            ->select(
                'r.ID_Registro',
                'r.Fecha_Hora',
                'r.Acceso_Autorizado',
                'r.Observaciones',
                DB::raw("CONCAT(u.Nombre, ' ', u.Ap_Paterno) as usuario")
            )
            ->orderByDesc('r.Fecha_Hora')
            ->get();

        return response()->json(['data' => $logs]);
    }

    public function validateAccess(Request $request)
    {
        $request->validate([
            'codigo' => 'required',
            'tipo_acceso' => 'required|integer'
        ]);

        $credencial = DB::table('Credenciales')
            ->where('Codigo_Credencial', $request->codigo)
            ->first();

        $autorizado = false;
        $usuarioId = null;

        if ($credencial) {
            $usuarioId = $credencial->ID_Usuario;

            $estado = DB::table('Estados')
                ->where('ID_Estado', $credencial->ID_Estado)
                ->value('Nombre');

            $autorizado = $estado === 'Activo';
        }

        DB::table('Registros_Acceso')->insert([
            'ID_Credencial' => $credencial->ID_Credencial ?? null,
            'ID_Tipo_Acceso' => $request->tipo_acceso,
            'Acceso_Autorizado' => $autorizado,
            'ID_Usuario_Validador' => $usuarioId,
            'Observaciones' => $autorizado ? 'Acceso permitido' : 'Acceso denegado'
        ]);

        return response()->json([
            'success' => true,
            'autorizado' => $autorizado
        ]);
    }
}