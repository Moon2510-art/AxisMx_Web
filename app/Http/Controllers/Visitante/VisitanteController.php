<?php

namespace App\Http\Controllers\Visitante;

use App\Http\Controllers\Controller;
use App\Models\Visitante;
use Illuminate\Http\Request;

class VisitanteController extends Controller
{
    // ADMIN
    public function index()
    {
        return response()->json(Visitante::orderByDesc('ID_Visitante')->get());
    }

    public function aprobar($id)
    {
        return $this->changeStatus($id, 'Aprobada');
    }

    public function rechazar($id)
    {
        return $this->changeStatus($id, 'Rechazada');
    }

    private function changeStatus($id, $estado)
    {
        $visitante = Visitante::findOrFail($id);
        $visitante->Estado = $estado;

        if ($estado === 'Aprobada' && !$visitante->QR) {
            $visitante->QR = 'VISIT-' . $visitante->ID_Visitante . '-' . uniqid();
        }

        $visitante->save();
        return response()->json($visitante);
    }

    public function destroy($id)
    {
        Visitante::destroy($id);
        return response()->json(['message' => 'Eliminado']);
    }

    // PUBLIC
    public function store(Request $request)
    {
        $data = $request->validate([
            'Nombre' => 'required|string|max:100',
            'Compania' => 'nullable|string|max:100',
            'Descripcion' => 'nullable|string',
            'Email' => 'required|email|max:150',
            'Telefono' => 'required|string|max:20',
        ]);

        $data['Estado'] = 'Pendiente';
        $visitante = Visitante::create($data);
        $visitante->QR = null;
        $visitante->save();

        return response()->json($visitante, 201);
    }

    public function findByEmail($email)
    {
        $visitante = Visitante::where('Email', $email)
            ->orderByDesc('ID_Visitante')
            ->first();

        if (!$visitante) return response()->json(['message' => 'No encontrado'], 404);
        return response()->json($visitante);
    }
}