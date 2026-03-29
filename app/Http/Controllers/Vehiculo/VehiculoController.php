<?php

namespace App\Http\Controllers\Vehiculo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VehiculoController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('vehiculos as v')
            ->leftJoin('modelos as m', 'v.ID_Modelo', '=', 'm.ID_Modelo')
            ->leftJoin('marcas as ma', 'm.ID_Marca', '=', 'ma.ID_Marca')
            ->leftJoin('estados as e', 'v.ID_Estado', '=', 'e.ID_Estado')
            ->leftJoin('usuarios as u', 'v.ID_Usuario', '=', 'u.ID_Usuario')
            ->select(
                'v.ID_Vehiculo as id',
                'v.Placa as placa',
                DB::raw("CONCAT(ma.Nombre_Marca, ' ', m.Nombre_Modelo) as modelo"),
                'v.Anio as anio',
                'v.Color as color',
                'e.Nombre as status',
                DB::raw("CONCAT(u.Nombre, ' ', u.Ap_Paterno, ' ', COALESCE(u.Ap_Materno, '')) as propietario")
            );

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('v.Placa', 'like', "%{$request->search}%")
                  ->orWhere('m.Nombre_Modelo', 'like', "%{$request->search}%")
                  ->orWhere('u.Nombre', 'like', "%{$request->search}%")
                  ->orWhere('u.Ap_Paterno', 'like', "%{$request->search}%");
            });
        }

        if ($request->estado) {
            $query->where('e.Nombre', $request->estado);
        }

        $vehiculos = $query->orderByDesc('v.ID_Vehiculo')->get();

        return response()->json(['data' => $vehiculos]);
    }

    public function getByUsuario($id)
    {
        $vehiculos = DB::table('vehiculos as v')
            ->leftJoin('modelos as m', 'v.ID_Modelo', '=', 'm.ID_Modelo')
            ->leftJoin('marcas as ma', 'm.ID_Marca', '=', 'ma.ID_Marca')
            ->leftJoin('estados as e', 'v.ID_Estado', '=', 'e.ID_Estado')
            ->where('v.ID_Usuario', $id)
            ->select(
                'v.ID_Vehiculo as id',
                'v.Placa as placa',
                DB::raw("CONCAT(ma.Nombre_Marca, ' ', m.Nombre_Modelo) as modelo"),
                'v.Anio as anio',
                'v.Color as color',
                'e.Nombre as status'
            )
            ->orderByDesc('v.ID_Vehiculo')
            ->get();

        return response()->json(['data' => $vehiculos]);
    }

    public function show($id)
    {
        $vehiculo = DB::table('vehiculos as v')
            ->leftJoin('usuarios as u', 'v.ID_Usuario', '=', 'u.ID_Usuario')
            ->where('v.ID_Vehiculo', $id)
            ->select(
                'v.*',
                'v.ID_Vehiculo as id',
                DB::raw("CONCAT(u.Nombre, ' ', u.Ap_Paterno, ' ', COALESCE(u.Ap_Materno, '')) as propietario")
            )
            ->first();

        return response()->json(['data' => $vehiculo]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Placa' => 'required|unique:vehiculos,Placa',
            'ID_Modelo' => 'required',
            'ID_Usuario' => 'required|exists:usuarios,ID_Usuario'
        ]);

        $id = DB::table('vehiculos')->insertGetId([
            'Placa' => $request->Placa,
            'ID_Modelo' => $request->ID_Modelo,
            'Anio' => $request->Anio,
            'Color' => $request->Color,
            'ID_Estado' => 1, // default activo
            'ID_Usuario' => $request->ID_Usuario
        ]);

        return response()->json(['success' => true, 'id' => $id]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'Placa' => "required|unique:vehiculos,Placa,$id,ID_Vehiculo",
            'ID_Modelo' => 'required',
            'ID_Usuario' => 'required|exists:usuarios,ID_Usuario'
        ]);

        DB::table('vehiculos')
            ->where('ID_Vehiculo', $id)
            ->update([
                'Placa' => $request->Placa,
                'ID_Modelo' => $request->ID_Modelo,
                'Anio' => $request->Anio,
                'Color' => $request->Color,
                'ID_Usuario' => $request->ID_Usuario
            ]);

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        DB::table('vehiculos')
            ->where('ID_Vehiculo', $id)
            ->delete();

        return response()->json(['success' => true]);
    }

    public function activate($id)
    {
        DB::table('vehiculos')
            ->where('ID_Vehiculo', $id)
            ->update(['ID_Estado' => 1]);

        return response()->json(['success' => true]);
    }

    public function suspend($id)
    {
        DB::table('vehiculos')
            ->where('ID_Vehiculo', $id)
            ->update(['ID_Estado' => 3]);

        return response()->json(['success' => true]);
    }


}