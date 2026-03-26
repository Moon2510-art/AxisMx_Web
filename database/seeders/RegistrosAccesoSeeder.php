<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RegistrosAccesoSeeder extends Seeder
{
    public function run()
    {
        $userId = DB::table('Usuarios')->value('ID_Usuario') ?? 1;

        $vehiculoId = DB::table('Vehiculos')->value('ID_Vehiculo') ?? null;

        $credencialId = DB::table('Credenciales')->value('ID_Credencial') ?? null;

        $tipos = [1, 2]; 

        $data = [];

        for ($i = 0; $i < 7; $i++) {

            $date = Carbon::now()->subDays($i);

            $entries = rand(5, 15);

            for ($j = 0; $j < $entries; $j++) {

                $isVehicular = rand(0, 1);

                $data[] = [
                    'Fecha_Hora' => $date->copy()->setTime(rand(6, 22), rand(0, 59)),
                    'ID_Credencial' => $isVehicular ? null : $credencialId,
                    'ID_Vehiculo' => $isVehicular ? $vehiculoId : null,
                    'ID_Tipo_Acceso' => $isVehicular ? 2 : 1,
                    'Acceso_Autorizado' => rand(0, 1),
                    'ID_Usuario_Validador' => $userId,
                    'Observaciones' => rand(0, 1) ? 'Acceso correcto' : 'Intento fallido'
                ];
            }
        }

        DB::table('Registros_Acceso')->insert($data);
    }
}