<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'users' => DB::table('Usuarios')->count(),
            'vehicles' => DB::table('Vehiculos')->count(),
            'access_today' => DB::table('Registros_Acceso')
                ->whereDate('Fecha_Hora', now())
                ->count(),
        ]);
    }

    public function recentAccesses()
    {
        $logs = DB::table('Registros_Acceso as r')
            ->leftJoin('Credenciales as c', 'r.ID_Credencial', '=', 'c.ID_Credencial')
            ->leftJoin('Usuarios as u', 'c.ID_Usuario', '=', 'u.ID_Usuario')
            ->select(
                'r.ID_Registro',
                'r.Fecha_Hora',
                'r.Acceso_Autorizado',
                DB::raw("CONCAT(u.Nombre, ' ', u.Ap_Paterno) as usuario")
            )
            ->orderByDesc('r.Fecha_Hora')
            ->limit(10)
            ->get();

        return response()->json(['data' => $logs]);
    }

    public function chartAccessByDay()
    {
        $data = DB::table('Registros_Acceso')
            ->selectRaw('DATE(Fecha_Hora) as fecha, COUNT(*) as total')
            ->where('Fecha_Hora', '>=', now()->subDays(7))
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();

        return response()->json($data);
    }

    public function chartByType()
    {
        $data = DB::table('Registros_Acceso as r')
            ->join('Tipos_Acceso as t', 'r.ID_Tipo_Acceso', '=', 't.ID_Tipo_Acceso')
            ->select('t.Nombre_Tipo', DB::raw('COUNT(*) as total'))
            ->groupBy('t.Nombre_Tipo')
            ->get();

        return response()->json($data);
    }
}