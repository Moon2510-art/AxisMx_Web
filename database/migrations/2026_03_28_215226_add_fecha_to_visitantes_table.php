<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('visitantes', function (Blueprint $table) {
            $table->date('fecha')->after('Telefono')->default(date('Y-m-d'));
        });
    }

    public function down()
    {
        Schema::table('visitantes', function (Blueprint $table) {
            $table->dropColumn('fecha');
        });
    }
};