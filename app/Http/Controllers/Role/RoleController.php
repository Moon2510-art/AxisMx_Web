<?php

namespace App\Http\Controllers\Role;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('Roles')
            ->select(
                'ID_Rol as id',
                'Nombre_Rol as name',
                'Descripcion as description'
            );

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('Nombre_Rol', 'like', "%{$request->search}%")
                  ->orWhere('Descripcion', 'like', "%{$request->search}%");
            });
        }

        $roles = $query->orderByDesc('ID_Rol')->get();

        return response()->json(['data' => $roles]);
    }

    public function show($id)
    {
        $role = DB::table('Roles')
            ->select(
                'ID_Rol as id',
                'Nombre_Rol as name',
                'Descripcion as description'
            )
            ->where('ID_Rol', $id)
            ->first();

        if (!$role) {
            return response()->json(['message' => 'No encontrado'], 404);
        }

        return response()->json(['data' => $role]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Nombre_Rol' => 'required|unique:Roles,Nombre_Rol',
        ]);

        $id = DB::table('Roles')->insertGetId([
            'Nombre_Rol' => $request->Nombre_Rol,
            'Descripcion' => $request->Descripcion
        ]);

        return response()->json([
            'success' => true,
            'id' => $id
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = [
            'Nombre_Rol' => $request->Nombre_Rol,
            'Descripcion' => $request->Descripcion
        ];

        $data = array_filter($data, fn($v) => !is_null($v));

        DB::table('Roles')
            ->where('ID_Rol', $id)
            ->update($data);

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        DB::table('Roles')
            ->where('ID_Rol', $id)
            ->delete();

        return response()->json(['success' => true]);
    }
}