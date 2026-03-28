<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('visitantes', function (Blueprint $table) {
            $table->id('ID_Visitante'); // AutoIncrement

            $table->string('Nombre', 100);
            $table->string('Compania', 100)->nullable(); // (avoid ñ in DB)
            $table->text('Descripcion');

            $table->string('Email', 150);
            $table->string('Telefono', 20);

            $table->enum('Estado', ['Aprobada', 'Rechazada', 'Pendiente'])
                ->default('Pendiente');

            $table->string('QR', 255)->unique(); // unique QR string

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitantes');
    }
};
