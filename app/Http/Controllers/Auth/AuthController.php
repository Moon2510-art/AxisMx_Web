<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email_or_employee' => 'required',
            'password' => 'required'
        ]);

        $user = User::with(['rol', 'estado'])
            ->where('Email', $request->email_or_employee)
            ->orWhere('Numero_Empleado', $request->email_or_employee)
            ->orWhere('Matricula', $request->email_or_employee)
            ->first();

        if (!$user || !Hash::check($request->password, $user->Contrasena)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        if (($user->estado->Nombre ?? '') !== 'Activo') {
            return response()->json([
                'success' => false,
                'message' => 'Usuario inactivo'
            ], 403);
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => $this->formatUser($user)
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $user = $this->user($request);

        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json(['success' => true]);
    }

    public function me(Request $request)
    {
        $user = $this->user($request);

        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        $user->load(['rol', 'estado']);

        return response()->json([
            'success' => true,
            'data' => $this->formatUser($user)
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $this->user($request);

        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->Contrasena)) {
            return response()->json([
                'success' => false,
                'message' => 'Contraseña incorrecta'
            ], 400);
        }

        $user->Contrasena = Hash::make($request->new_password);
        $user->save();

        return response()->json(['success' => true]);
    }

    private function user(Request $request)
    {
        $token = $request->bearerToken();
        return $token
            ? PersonalAccessToken::findToken($token)?->tokenable
            : null;
    }

    private function formatUser($user)
    {
        return [
            'id' => $user->ID_Usuario,
            'name' => trim($user->Nombre . ' ' . $user->Ap_Paterno . ' ' . $user->Ap_Materno),
            'email' => $user->Email,
            'matricula' => $user->Matricula,
            'numero_empleado' => $user->Numero_Empleado,
            'rol' => $user->rol->Nombre_Rol ?? null,
            'estado' => $user->estado->Nombre ?? null,
            'is_admin' => ($user->rol->Nombre_Rol ?? '') === 'Administrativo'
        ];
    }
}