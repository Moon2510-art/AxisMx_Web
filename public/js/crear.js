document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('visitaForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            Nombre: document.getElementById('nombre').value.trim(),
            Ap_Paterno: document.getElementById('apellido_paterno').value.trim(),
            Ap_Materno: document.getElementById('apellido_materno').value.trim(),
            Email: document.getElementById('email').value.trim(),
            Telefono: document.getElementById('telefono').value.trim() || null,
            Matricula: document.getElementById('matricula').value.trim() || null,
            Numero_Empleado: document.getElementById('numero_empleado').value.trim() || null,
            Empresa: document.getElementById('empresa').value.trim() || null,
            ID_Rol: document.getElementById('edit_rol').value,
            Contrasena: document.getElementById('password').value.trim(),
            ID_Estado: 3 
        };

        if (!formData.Nombre || !formData.Ap_Paterno || !formData.Email || !formData.Contrasena) {
            return alert('Por favor, completa los campos obligatorios.');
        }

        if (!formData.Matricula && !formData.Numero_Empleado) {
            return alert('Debes ingresar Matrícula o Número de Empleado.');
        }

        try {
            const response = await fetch('/api/users/public-create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Cuenta creada correctamente. Un administrador deberá activarla.');
                form.reset();
                // Reset the select to default value
                document.getElementById('edit_rol').selectedIndex = 0;
            } else {
                alert(data.message || 'Error al crear la cuenta.');
            }
        } catch (error) {
            console.error('Error al enviar datos:', error);
            alert('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
        }
    });
});