<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => DB::table('Usuarios')->get()
        ]);
    }

    public function show($id)
    {
        $user = DB::table('Usuarios as u')
            ->leftJoin('Roles as r', 'u.ID_Rol', '=', 'r.ID_Rol')
            ->leftJoin('Estados as e', 'u.ID_Estado', '=', 'e.ID_Estado')
            ->select(
                'u.ID_Usuario as id',
                DB::raw("CONCAT(u.Nombre, ' ', u.Ap_Paterno) as name"),
                'u.Email as email',
                'u.Telefono as phone',
                'u.Matricula as matricula',
                'u.Numero_Empleado as employee_number',
                'u.Empresa as company',
                'r.Nombre_Rol as role',
                'e.Nombre as status'
            )
            ->where('u.ID_Usuario', $id)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'No encontrado'], 404);
        }

        return response()->json(['data' => $user]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Nombre' => 'required',
            'Ap_Paterno' => 'required',
            'Email' => 'required|email|unique:Usuarios,Email',
            'Contrasena' => 'required|min:6'
        ]);

        $id = DB::table('Usuarios')->insertGetId([
            'Nombre' => $request->Nombre,
            'Ap_Paterno' => $request->Ap_Paterno,
            'Ap_Materno' => $request->Ap_Materno,
            'Email' => $request->Email,
            'Numero_Empleado' => $request->Numero_Empleado,
            'Matricula' => $request->Matricula,
            'ID_Rol' => $request->ID_Rol,
            'ID_Estado' => 1,
            'Contrasena' => Hash::make($request->Contrasena)
        ]);

        return response()->json(['success' => true, 'id' => $id]);
    }

    public function update(Request $request, $id)
    {
        DB::table('Usuarios')
            ->where('ID_Usuario', $id)
            ->update($request->except(['Contrasena']));

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        DB::table('Usuarios')
            ->where('ID_Usuario', $id)
            ->update(['ID_Estado' => 4]);

        return response()->json(['success' => true]);
    }

    public function activate($id)
    {
        DB::table('Usuarios')
            ->where('ID_Usuario', $id)
            ->update(['ID_Estado' => 1]);

        return response()->json(['success' => true]);
    }

    public function suspend($id)
    {
        DB::table('Usuarios')
            ->where('ID_Usuario', $id)
            ->update(['ID_Estado' => 3]);

        return response()->json(['success' => true]);
    }
}