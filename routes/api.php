    <?php

    use Illuminate\Support\Facades\Route;
    use Illuminate\Support\Facades\DB;
    use App\Http\Controllers\Auth\AuthController;
    use App\Http\Controllers\User\UserController;
    use App\Http\Controllers\Access\AccessController;
    use App\Http\Controllers\Dashboard\DashboardController;
    use App\Http\Controllers\Role\RoleController;
    use App\Http\Controllers\Vehiculo\VehiculoController;
    use App\Http\Controllers\Visitante\VisitanteController;

    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::post('/users/public-create', [UserController::class, 'storePublic']);

    Route::middleware('auth:sanctum')->group(function () {

        // AUTH
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/change-password', [AuthController::class, 'changePassword']);
        });

        // DASHBOARD
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats', [DashboardController::class, 'stats']);
            Route::get('/recent-accesses', [DashboardController::class, 'recentAccesses']);
            Route::get('/chart-access', [DashboardController::class, 'chartAccessByDay']);
            Route::get('/chart-types', [DashboardController::class, 'chartByType']);
        });

        // ACCESS
        Route::prefix('access')->group(function () {
            Route::get('/logs', [AccessController::class, 'index']);
            Route::post('/validate', [AccessController::class, 'validateAccess']);
        });

        // USERS
        Route::apiResource('users', UserController::class);
        Route::prefix('users')->group(function () {
            Route::post('/{id}/activate', [UserController::class, 'activate']);
            Route::post('/{id}/suspend', [UserController::class, 'suspend']);
        });

        // ROLES
        Route::apiResource('roles', RoleController::class);

        // VEHICULOS
        Route::apiResource('vehiculos', VehiculoController::class);

        Route::prefix('vehiculos')->group(function () {
            Route::post('/{id}/activate', [VehiculoController::class, 'activate']);
            Route::post('/{id}/suspend', [VehiculoController::class, 'suspend']);
        });

        Route::get('usuarios/{id}/vehiculos', [VehiculoController::class, 'getByUsuario']);

        
    });

    Route::get('/modelos', function () {
        $modelos = DB::table('modelos as m')
            ->join('marcas as ma', 'm.ID_Marca', '=', 'ma.ID_Marca')
            ->select('m.ID_Modelo','m.Nombre_Modelo','ma.Nombre_Marca')
            ->orderBy('ma.Nombre_Marca')
            ->get();

        return response()->json(['data' => $modelos]);
    });

    Route::prefix('visitantes')->group(function () {
        Route::get('/', [VisitanteController::class, 'index']); // List all
        Route::post('/', [VisitanteController::class, 'store']); // Create new
        Route::get('/email/{email}', [VisitanteController::class, 'findByEmail']); // Find by email
        Route::delete('/{id}', [VisitanteController::class, 'destroy']); // Delete visitante

        Route::post('/{id}/aprobar', [VisitanteController::class, 'aprobar']);
        Route::post('/{id}/rechazar', [VisitanteController::class, 'rechazar']);
});