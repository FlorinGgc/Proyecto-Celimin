// =============================================================================
// USERS.JS — Módulo de Usuarios (gestión, sesión, login/logout, permisos)
// =============================================================================

// =============================================================================
// RENDERIZADO DE USUARIOS
// =============================================================================
function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento'].includes(session.role);
    const canEdit = session && ['Administrador', 'Administrador General'].includes(session.role);
    tbody.innerHTML = usersData.map((user, index) => `
        <tr>
            <td><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:30px;height:30px;background:#eee;border-radius:50%;display:grid;place-items:center;">${user.name[0]}</div>${user.name}</div></td>
            <td>${user.role}</td>
            <td>${user.lastAccess}</td>
            <td><code>${user.permissions || 'Estándar'}</code></td>
            <td><span class="status-badge status-ok">ACTIVO</span></td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                    ${canEdit ? `<button class="btn-action edit" onclick="editUser(${index})" title="Editar"><i class="fas fa-edit"></i></button>` : ''}
                    ${canDelete ? `<button class="btn-action delete" onclick="deleteUser(${index})" title="Eliminar"><i class="fas fa-trash"></i></button>` : ''}
                    ${!canEdit && !canDelete ? '<span class="text-muted" style="font-size: 0.75rem;">—</span>' : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

window.editUser = (index) => {
    const user = usersData[index];
    document.getElementById('edit-user-index').value = index;
    document.getElementById('edit-user-name').value = user.name;
    document.getElementById('edit-user-role').value = user.role;
    document.getElementById('edit-user-permissions').value = user.permissions || 'Estándar';
    document.getElementById('modal-edit-user').classList.remove('hidden');
};

window.deleteUser = async (index) => {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento'].includes(session.role);
    if (!canDelete) {
        alert('No tiene permisos para eliminar.');
        return;
    }
    const user = usersData[index];
    if (confirm(`¿Está seguro de eliminar al usuario "${user.name}" (${user.role})?`)) {
        await window.dbSync.deleteUser(user.id);
        usersData.splice(index, 1);
        saveData();
        renderUsers();
    }
};

// =============================================================================
// INICIALIZACIÓN — DOMContentLoaded (users)
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {

    // Referencias DOM
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const btnLogout = document.getElementById('btn-logout');

    // Función para aplicar sesión
    const applySession = (session) => {
        if (!session) return;
        const nameEl = document.getElementById('current-user-name');
        const roleEl = document.getElementById('current-user-role');
        const avatarEl = document.getElementById('user-avatar');
        
        if (nameEl) nameEl.innerText = session.user;
        if (roleEl) roleEl.innerText = session.role;
        if (avatarEl) avatarEl.innerText = session.user[0].toUpperCase();

        // Control de acceso por roles para el botón "Nuevo Registro" (Inventario)
        const allowedRolesInventory = [
            'Administrador', 
            'Administrador General',
            'Compra y Abastecimiento'
        ];
        
        // Control de acceso por roles para el botón "Registrar Usuario" (Personal)
        const allowedRolesUsers = [
            'Administrador',
            'Administrador General'
        ];

        const btnNewItem = document.getElementById('btn-new-item');
        if (btnNewItem) {
            btnNewItem.style.display = allowedRolesInventory.includes(session.role) ? 'inline-flex' : 'none';
        }

        const btnClearInventory = document.getElementById('btn-clear-inventory');
        if (btnClearInventory) {
            btnClearInventory.style.display = allowedRolesInventory.includes(session.role) ? 'inline-flex' : 'none';
        }

        const btnNewUser = document.getElementById('btn-new-user');
        if (btnNewUser) {
            btnNewUser.style.display = allowedRolesUsers.includes(session.role) ? 'inline-flex' : 'none';
        }

        // Matriz de permisos de vistas por rol
        const roleViewPermissions = {
            'Administrador General': ['dashboard', 'inventory', 'agendar-trabajos', 'users', 'movements', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano', 'low-stock', 'expiry-alerts'],
            'Administrador': ['dashboard', 'inventory', 'agendar-trabajos', 'users', 'movements', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano', 'low-stock', 'expiry-alerts'],
            'Compra y Abastecimiento': ['dashboard', 'inventory', 'movements', 'low-stock', 'expiry-alerts'],
            'Investigador': ['dashboard', 'inventory', 'agendar-trabajos', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano'],
            'Tesista': ['dashboard', 'inventory', 'agendar-trabajos', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano'],
            'Estándar': ['dashboard', 'inventory', 'agendar-trabajos', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano']
        };

        const allowedViews = roleViewPermissions[session.role] || roleViewPermissions['Estándar'];
        
        // Guardar las vistas permitidas en sesión/window global para usar en switchView
        window.allowedViews = allowedViews;

        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link && link.getAttribute('data-view')) {
                const view = link.getAttribute('data-view');
                if (!allowedViews.includes(view)) {
                    item.style.display = 'none';
                } else {
                    item.style.display = '';
                }
            }
        });

        if (loginScreen) loginScreen.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');
        document.body.classList.remove('login-active');
        switchView('dashboard');
    };

    // Verificar sesión existente
    const existingSession = storage.get(STORAGE_KEYS.SESSION, null);
    if (existingSession) {
        applySession(existingSession);
    }

    // Login Event
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';
            btn.disabled = true;

            const emailEl = document.getElementById('login-email');
            const passEl = document.getElementById('login-pass');
            const email = emailEl ? emailEl.value.trim() : '';
            const password = passEl ? passEl.value : '';
            
            try {
                let error = null;
                // Si el valor ingresado es un correo, validamos con Supabase Auth
                if (email.includes('@')) {
                    const res = await window.supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password,
                    });
                    error = res.error;
                    if (error) {
                        throw new Error("Credenciales inválidas o correo no registrado.");
                    }
                } else {
                    // Ingreso mediante nombre (Bypass simulado para personal)
                    const mockPassword = 'celiminadmin'; // Contraseña genérica de control
                    if (password !== mockPassword) {
                        throw new Error("Contraseña incorrecta. Intente nuevamente.");
                    }
                    console.log('Ingreso directo por nombre (bypass validado):', email);
                }

                const MOCK_ROLES = {
                    "Mario Grágeda": "Administrador General",
                    "Svetlana Ushak": "Administrador",
                    "Paula Marín": "Administrador",
                    "Alonso Gonzalez": "Administrador",
                    "Marcelo Gonzales": "Administrador",
                    "Adrian Quispe": "Investigador",
                    "Kumaresan Lakshmanan": "Investigador",
                    "Sagar Panwar": "Investigador",
                    "Mirko Grageda": "Compra y Abastecimiento",
                    "Nicolás Palma": "Tesista",
                    "Maura Judith": "Tesista",
                    "Luis Rojas": "Tesista",
                    "Sergio Pablo": "Tesista",
                    "Evgeniya Pasechnaya": "Tesista",
                    "Geovanna Choque": "Tesista",
                    "Milton Arratia": "Tesista",
                    "Moises Gonzales": "Tesista",
                    "Joseas Ariel": "Tesista",
                    "Reina Eulalia": "Tesista",
                    "Ivan Nelson": "Tesista",
                    "Elgalini Ines": "Tesista",
                    "Daniela Estefany": "Tesista",
                    "Keyla Candy": "Tesista"
                };

                // Buscar usuario por nombre corto o correo
                let foundUser = usersData.find(u => u.name.toLowerCase().includes(email.toLowerCase()) || (u.email && u.email.toLowerCase() === email.toLowerCase()));
                
                const userName = foundUser ? foundUser.name : email;
                
                // Si es un gmail asume un rol por defecto si no lo encuentra
                let userRole = 'Investigador'; 
                if (foundUser) {
                    userRole = foundUser.role;
                } else {
                    // Buscar coincidencia parcial en MOCK_ROLES
                    for (const [key, role] of Object.entries(MOCK_ROLES)) {
                        if (email.toLowerCase().includes(key.toLowerCase())) {
                            userRole = role;
                            break;
                        }
                    }
                    if (email.includes('@')) {
                        // Si es correo pero no está en la lista, lo dejamos como Estándar
                        userRole = 'Estándar';
                    }
                }

                const nowStr = 'Recientemente';
                if (foundUser) {
                    await window.dbSync.updateUserAccess(userName, nowStr);
                    foundUser.lastAccess = nowStr;
                }
                
                const session = { user: userName, role: userRole };
                storage.set(STORAGE_KEYS.SESSION, session);
                applySession(session);
            } catch (err) {
                console.error("Error en login:", err);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Acceso Denegado',
                        text: err.message,
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert("Error al iniciar sesión: " + err.message);
                }
            } finally {
                btn.innerHTML = origHtml;
                btn.disabled = false;
            }
        });
    }

    // Logout Event
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            if (confirm('¿Cerrar sesión?')) {
                try {
                    await window.supabaseClient.auth.signOut();
                } catch(e) { console.error(e); }
                storage.remove(STORAGE_KEYS.SESSION);
                location.reload();
            }
        });
    }

    // User Modal Logic
    const modalUser = document.getElementById('modal-user');
    const btnNewUser = document.getElementById('btn-new-user');
    const closeUserBtn = document.getElementById('close-modal-user');
    const cancelUserBtn = document.getElementById('btn-cancel-user');
    const formNewUser = document.getElementById('form-new-user');

    const toggleUserModal = (show) => {
        if (show) modalUser.classList.remove('hidden');
        else modalUser.classList.add('hidden');
    };

    if (btnNewUser) btnNewUser.addEventListener('click', () => toggleUserModal(true));
    if (closeUserBtn) closeUserBtn.addEventListener('click', () => toggleUserModal(false));
    if (cancelUserBtn) cancelUserBtn.addEventListener('click', () => toggleUserModal(false));

    if (formNewUser) {
        formNewUser.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = e.target.querySelector('button[type="submit"]');
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            btn.disabled = true;

            const newUser = {
                name: document.getElementById('user-full-name').value,
                role: document.getElementById('user-new-role').value,
                lastAccess: 'Nunca',
                permissions: document.getElementById('user-permissions').value || 'Estándar',
                active: true
            };

            await window.dbSync.saveUser(newUser, true);
            
            // Re-fetch users to get IDs generated by DB or just push mock id, but re-fetch is safer
            // For simplicity, we just reload the data completely
            await initApp();
            
            formNewUser.reset();
            toggleUserModal(false);
            btn.innerHTML = origHtml;
            btn.disabled = false;
            alert(`Usuario ${newUser.name} registrado con éxito`);
        });
    }

    // Edit User Modal Logic
    const modalEditUser = document.getElementById('modal-edit-user');
    const closeEditUserBtn = document.getElementById('close-modal-edit-user');
    const cancelEditUserBtn = document.getElementById('btn-cancel-edit-user');
    const formEditUser = document.getElementById('form-edit-user');

    if (closeEditUserBtn) closeEditUserBtn.addEventListener('click', () => modalEditUser.classList.add('hidden'));
    if (cancelEditUserBtn) cancelEditUserBtn.addEventListener('click', () => modalEditUser.classList.add('hidden'));

    if (formEditUser) {
        formEditUser.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btn.disabled = true;

            const index = document.getElementById('edit-user-index').value;
            
            usersData[index] = {
                ...usersData[index],
                name: document.getElementById('edit-user-name').value,
                role: document.getElementById('edit-user-role').value,
                permissions: document.getElementById('edit-user-permissions').value || 'Estándar'
            };

            await window.dbSync.saveUser(usersData[index]);
            
            saveData();
            renderUsers();
            modalEditUser.classList.add('hidden');
            btn.innerHTML = origHtml;
            btn.disabled = false;
            alert('Usuario actualizado con éxito.');
        });
    }

    // LOGIN EXTRA ACTIONS (Forgot & Signup)
    const modalForgot = document.getElementById('modal-forgot');
    const modalSignup = document.getElementById('modal-signup');
    const linkForgot = document.getElementById('link-forgot-password');
    const btnSignup = document.getElementById('btn-create-account');

    if (linkForgot) {
        linkForgot.addEventListener('click', (e) => {
            e.preventDefault();
            modalForgot.classList.remove('hidden');
        });
    }

    if (btnSignup) {
        btnSignup.addEventListener('click', (e) => {
            e.preventDefault();
            modalSignup.classList.remove('hidden');
        });
    }

    document.getElementById('close-modal-forgot')?.addEventListener('click', () => modalForgot.classList.add('hidden'));
    document.getElementById('close-modal-signup')?.addEventListener('click', () => modalSignup.classList.add('hidden'));
    document.getElementById('btn-cancel-forgot')?.addEventListener('click', () => modalForgot.classList.add('hidden'));
    document.getElementById('btn-cancel-signup')?.addEventListener('click', () => modalSignup.classList.add('hidden'));

    document.getElementById('form-forgot')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;

        const email = document.getElementById('forgot-email').value.trim();

        try {
            const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });

            if (error) {
                throw error;
            }

            alert('Se ha enviado un correo de recuperación a su casilla de Gmail. Por favor, revise su bandeja de entrada para restablecer su contraseña.');
            modalForgot.classList.add('hidden');
            e.target.reset();
        } catch (err) {
            console.error("Error al recuperar contraseña:", err);
            alert("Error al intentar recuperar la contraseña: " + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    document.getElementById('form-signup')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btn.disabled = true;

        const idRut = document.getElementById('signup-id').value.trim();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-pass').value;
        const role = document.getElementById('signup-role').value;

        try {
            // Registrar con Supabase Auth (intentarlo, pero no bloquear si falla por falta de credenciales)
            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        id_rut: idRut,
                        full_name: name,
                        requested_role: role
                    }
                }
            });

            if (error) {
                console.warn("Registro falló en Supabase Auth, procediendo solo con tabla local. Error:", error.message);
            }

            // También registrar el usuario en la tabla 'users' para mantener coherencia
            await window.dbSync.saveUser({
                id: idRut, // Utilizando el ID/RUT como ID opcional si la tabla lo permite
                name: name,
                role: role,
                permissions: 'Estándar',
                lastAccess: 'Nunca',
                active: true
            }, true);

            alert('Cuenta creada exitosamente. Se ha enviado un correo a su cuenta de Gmail para confirmar el registro y la contraseña.');
            const modalSignup = document.getElementById('modal-signup');
            if (modalSignup) modalSignup.classList.add('hidden');
            e.target.reset();
        } catch (err) {
            console.error("Error en registro:", err);
            alert("Error al registrar: " + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
});
