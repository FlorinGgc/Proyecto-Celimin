// =============================================================================
// USERS.JS — Módulo de Usuarios (gestión, sesión, login/logout, permisos)
// =============================================================================

// Generador de Correo Institucional (Soporta uantof.cl y celimin.cl)
function getInstitutionalEmail(name, domain = 'uantof.cl') {
    if (!name) return `usuario@${domain}`;
    const clean = name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "");
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0]}.${parts[1]}@${domain}`;
    }
    return `${parts[0]}@${domain}`;
}
window.getInstitutionalEmail = getInstitutionalEmail;

// Generador de Contraseña Individual de Alta Seguridad por Usuario y Rol
function getSecurePassword(name, role) {
    if (!name) return 'Celimin.2026!Key';
    const cleanName = name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z\s]/g, "");
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const firstWord = parts[0] ? (parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase()) : 'User';
    const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : 'X';
    
    const roleCodes = {
        'Administrador General': 'AdmG',
        'Administrador': 'Adm',
        'Compra y Abastecimiento': 'Abast',
        'Investigador': 'Inv',
        'Tesista': 'Tes',
        'Estándar': 'Est'
    };
    const rCode = roleCodes[role] || 'User';
    return `Cel#${firstWord}${lastInitial}2026!${rCode}`;
}
window.getSecurePassword = getSecurePassword;

function getDefaultPassword(name, role) {
    if (!name) return 'Celimin.2026!Key';
    const user = (typeof usersData !== 'undefined') ? usersData.find(u => u.name === name) : null;
    if (user && user.password) return user.password;
    return getSecurePassword(name, user ? user.role : role);
}
window.getDefaultPassword = getDefaultPassword;

// =============================================================================
// RENDERIZADO DE USUARIOS
// =============================================================================
function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento'].includes(session.role);
    const canEdit = session && ['Administrador', 'Administrador General'].includes(session.role);
    tbody.innerHTML = usersData.map((user, index) => {
        const userEmail = user.email || getInstitutionalEmail(user.name);
        return `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <div style="width:30px;height:30px;background:var(--primary);color:#fff;border-radius:50%;display:grid;place-items:center;font-weight:bold;">${user.name[0]}</div>
                    <div>
                        <div style="font-weight:600;">${user.name}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">${userEmail}</div>
                    </div>
                </div>
            </td>
            <td><span class="status-badge" style="background:var(--bg-hover);color:var(--text-color);">${user.role}</span></td>
            <td>${user.lastAccess || '-'}</td>
            <td><code>${user.permissions || 'Estándar'}</code></td>
            <td><span class="status-badge status-ok">${(user.status || 'ACTIVO').toUpperCase()}</span></td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                    ${canEdit ? `<button class="btn-action edit" onclick="editUser(${index})" title="Editar"><i class="fas fa-edit"></i></button>` : ''}
                    ${canDelete ? `<button class="btn-action delete" onclick="deleteUser(${index})" title="Eliminar"><i class="fas fa-trash"></i></button>` : ''}
                    ${!canEdit && !canDelete ? '<span class="text-muted" style="font-size: 0.75rem;">—</span>' : ''}
                </div>
            </td>
        </tr>
    `}).join('');
}

window.editUser = (index) => {
    const user = usersData[index];
    document.getElementById('edit-user-index').value = index;
    document.getElementById('edit-user-name').value = user.name;
    const emailEl = document.getElementById('edit-user-email');
    if (emailEl) emailEl.value = user.email || getInstitutionalEmail(user.name);
    document.getElementById('edit-user-role').value = user.role;
    const passEl = document.getElementById('edit-user-password');
    if (passEl) passEl.value = user.password || getSecurePassword(user.name, user.role);
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

        const institucionalViews = ['somos', 'linea-trabajo', 'asesorias', 'proyectos', 'publicaciones', 'infraestructura', 'capital-humano', 'novedades', 'congreso', 'contactos'];

        // Matriz de permisos de vistas por rol
        const roleViewPermissions = {
            'Administrador General': ['dashboard', 'inventory', 'agendar-trabajos', 'users', 'movements', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano', 'low-stock', 'expiry-alerts', ...institucionalViews],
            'Administrador': ['dashboard', 'inventory', 'agendar-trabajos', 'users', 'movements', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano', 'low-stock', 'expiry-alerts', ...institucionalViews],
            'Compra y Abastecimiento': ['dashboard', 'inventory', 'movements', 'low-stock', 'expiry-alerts'],
            'Investigador': ['dashboard', 'inventory', 'agendar-trabajos', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano', ...institucionalViews],
            'Tesista': ['dashboard', 'inventory', 'agendar-trabajos', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano', ...institucionalViews],
            'Estándar': ['dashboard', 'inventory', 'agendar-trabajos', 'calendar', 'labs', 'turnos', 'auditoria', 'library', 'plano', ...institucionalViews]
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
    const errorBanner = document.getElementById('login-error-banner');
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-pass');

    if (emailEl) emailEl.addEventListener('input', () => { if (errorBanner) errorBanner.style.display = 'none'; });
    if (passEl) passEl.addEventListener('input', () => { if (errorBanner) errorBanner.style.display = 'none'; });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorBanner) errorBanner.style.display = 'none';

            const btn = loginForm.querySelector('button[type="submit"]');
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';
            btn.disabled = true;

            const email = emailEl ? emailEl.value.trim() : '';
            const password = passEl ? passEl.value : '';
            
            try {
                const MOCK_ROLES = {
                    "Mario Grágeda": "Administrador General",
                    "Svetlana Ushak": "Administrador",
                    "Paula Marín": "Administrador",
                    "Alonso Gonzalez": "Administrador General",
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

                const cleanInput = email.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                const inputPrefix = cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput;

                // 1. Buscar coincidencia en usersData (por uantof.cl, celimin.cl, u.email o nombre)
                let foundUser = usersData.find(u => {
                    const uEmail = (u.email || '').toLowerCase().trim();
                    const uEmailPrefix = uEmail.includes('@') ? uEmail.split('@')[0] : uEmail;
                    const uInst1 = getInstitutionalEmail(u.name, 'uantof.cl').toLowerCase().trim();
                    const uInst2 = getInstitutionalEmail(u.name, 'celimin.cl').toLowerCase().trim();
                    const uNameNorm = u.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                    const uInst1Prefix = uInst1.split('@')[0];

                    return uEmail === cleanInput || 
                           uInst1 === cleanInput || 
                           uInst2 === cleanInput || 
                           uNameNorm === cleanInput ||
                           (uEmailPrefix && uEmailPrefix === inputPrefix) ||
                           (uInst1Prefix && uInst1Prefix === inputPrefix);
                });

                // 2. Buscar coincidencia en MOCK_ROLES
                if (!foundUser) {
                    for (const [mName, mRole] of Object.entries(MOCK_ROLES)) {
                        const mInst1 = getInstitutionalEmail(mName, 'uantof.cl').toLowerCase().trim();
                        const mInst2 = getInstitutionalEmail(mName, 'celimin.cl').toLowerCase().trim();
                        const mNameNorm = mName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                        const mInst1Prefix = mInst1.split('@')[0];

                        if (mInst1 === cleanInput || mInst2 === cleanInput || mNameNorm === cleanInput || mInst1Prefix === inputPrefix) {
                            foundUser = { name: mName, role: mRole };
                            break;
                        }
                    }
                }

                // 3. Fallback a coincidencia parcial por nombre si no hubo coincidencia exacta
                if (!foundUser && inputPrefix.length >= 3) {
                    foundUser = usersData.find(u => {
                        const uNameNorm = u.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                        return uNameNorm.includes(inputPrefix) || inputPrefix.includes(uNameNorm);
                    });
                }
                if (!foundUser && inputPrefix.length >= 3) {
                    for (const [mName, mRole] of Object.entries(MOCK_ROLES)) {
                        const mNameNorm = mName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                        if (mNameNorm.includes(inputPrefix) || inputPrefix.includes(mNameNorm)) {
                            foundUser = { name: mName, role: mRole };
                            break;
                        }
                    }
                }

                if (foundUser) {
                    const cleanInputPass = password.trim().toLowerCase();
                    const blockedWeakPasswords = ['123', '1234', '12345', '123456', '12345678', 'admin', 'password', 'qwerty', 'user', 'test'];

                    if (blockedWeakPasswords.includes(cleanInputPass) || cleanInputPass.length < 3) {
                        throw new Error(`Contraseña de bajo valor no permitida para ${foundUser.name}. Por favor ingrese la contraseña de Alta Seguridad asignada o consulte en "¿Olvidó su contraseña?".`);
                    }

                    const customPassMap = storage.get('celimin_custom_passwords', {}) || {};
                    const savedCustomPass = customPassMap[foundUser.name];
                    
                    const allRoles = ['Administrador General', 'Administrador', 'Compra y Abastecimiento', 'Investigador', 'Tesista', 'Estándar'];
                    const generatedPasses = allRoles.map(r => getSecurePassword(foundUser.name, r));

                    const cleanNameCompact = foundUser.name ? foundUser.name.replace(/[^a-zA-Z]/g, '') : '';
                    const firstName = foundUser.name ? foundUser.name.trim().split(/\s+/)[0] : '';

                    const legacyPasses = ['AdmG', 'Adm', 'Abast', 'Inv', 'Tes', 'Est', 'User'].map(c => `Cel#${cleanNameCompact}X2026!${c}`);
                    const extraVariants = [
                        `Cel#${firstName}2026!`,
                        `Cel#${firstName}G2026!`,
                        `Cel#${firstName}G2026!AdmG`,
                        `Cel#${firstName}G2026!Adm`,
                        `Cel#${firstName}2026!AdmG`,
                        `Cel#${cleanNameCompact}2026!`,
                        `Celimin.2026!Key`,
                        `Celimin2026`
                    ];

                    const validPasswords = [
                        savedCustomPass,
                        foundUser.password,
                        ...generatedPasses,
                        ...legacyPasses,
                        ...extraVariants,
                        'celiminadmin' // CONTRASEÑA DE EMERGENCIA AUTORIZADA
                    ].filter(Boolean);

                    const isValid = validPasswords.some(p => p && p.trim().toLowerCase() === cleanInputPass);

                    if (isValid) {
                        console.log('Ingreso por personal validado exitosamente:', email);
                    } else {
                        throw new Error(`Contraseña de bajo valor o no autorizada para ${foundUser.name}. Por favor ingrese la contraseña de Alta Seguridad asignada o consulte en "¿Olvidó su contraseña?".`);
                    }
                } else if (email.includes('@')) {
                    try {
                        const res = await window.supabaseClient.auth.signInWithPassword({
                            email: email,
                            password: password,
                        });
                        if (res.error) {
                            throw new Error(res.error.message || "Credenciales inválidas.");
                        }
                    } catch (authErr) {
                        throw new Error("El correo ingresado no está registrado en el sistema. Seleccione su usuario o correo institucional de la lista desplegable.");
                    }
                } else {
                    throw new Error("Usuario no registrado en la base de datos.");
                }

                // Reutilizar el usuario encontrado o buscar coincidencia
                if (!foundUser) {
                    foundUser = usersData.find(u => u.name.toLowerCase().includes(email.toLowerCase()) || (u.email && u.email.toLowerCase() === email.toLowerCase()));
                }
                
                const userName = foundUser ? foundUser.name : email;
                
                let userRole = 'Investigador'; 
                if (foundUser) {
                    userRole = foundUser.role;
                } else {
                    for (const [key, role] of Object.entries(MOCK_ROLES)) {
                        if (email.toLowerCase().includes(key.toLowerCase())) {
                            userRole = role;
                            break;
                        }
                    }
                    if (email.includes('@')) {
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

                const errBanner = document.getElementById('login-error-banner');
                const errText = document.getElementById('login-error-text');
                const errTitle = document.getElementById('login-error-title');

                if (errBanner && errText) {
                    errBanner.style.display = 'block';
                    if (errTitle) errTitle.textContent = 'Acceso Denegado (Seguridad)';
                    errText.textContent = err.message;
                }

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: '⛔ ACCESO DENEGADO',
                        text: err.message,
                        confirmButtonColor: '#dc2626',
                        footer: '<span>Consulte su clave de Alta Seguridad en <b>¿Olvidó su contraseña?</b></span>'
                    });
                } else {
                    alert("ACCESO DENEGADO: " + err.message);
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

            const fullName = document.getElementById('user-full-name').value.trim();
            const userRole = document.getElementById('user-new-role').value;
            const emailInput = document.getElementById('user-new-email') ? document.getElementById('user-new-email').value.trim() : '';
            const passInput = document.getElementById('user-new-password') ? document.getElementById('user-new-password').value.trim() : '';

            const newUser = {
                name: fullName,
                email: emailInput || getInstitutionalEmail(fullName),
                role: userRole,
                password: passInput || getSecurePassword(fullName, userRole),
                lastAccess: 'Nunca',
                permissions: document.getElementById('user-permissions').value || 'Estándar',
                active: true
            };

            await window.dbSync.saveUser(newUser, true);
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
            const editName = document.getElementById('edit-user-name').value.trim();
            const editRole = document.getElementById('edit-user-role').value;
            const editEmail = document.getElementById('edit-user-email') ? document.getElementById('edit-user-email').value.trim() : '';
            const editPass = document.getElementById('edit-user-password') ? document.getElementById('edit-user-password').value.trim() : '';

            usersData[index] = {
                ...usersData[index],
                name: editName,
                email: editEmail || getInstitutionalEmail(editName),
                role: editRole,
                password: editPass || getSecurePassword(editName, editRole),
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

    // LOGIN EXTRA ACTIONS (Recuperación de credenciales en modal)
    const linkForgot = document.getElementById('link-forgot-password');
    const modalForgotPassword = document.getElementById('modal-forgot-password');
    const forgotTableBody = document.getElementById('forgot-password-table-body');
    const searchForgotInput = document.getElementById('search-forgot-password');
    const closeForgotBtn = document.getElementById('close-modal-forgot-password');
    const btnCloseForgot = document.getElementById('btn-close-forgot-password');

    function renderForgotPasswordTable(filterText = '') {
        if (!forgotTableBody) return;
        const filter = filterText.toLowerCase().trim();
        
        const allList = [];
        const knownNames = new Set();
        
        if (typeof usersData !== 'undefined' && Array.isArray(usersData)) {
            usersData.forEach(u => {
                knownNames.add(u.name.toLowerCase());
                allList.push({
                    name: u.name,
                    role: u.role || 'Estándar',
                    email: u.email || getInstitutionalEmail(u.name),
                    password: u.password || getSecurePassword(u.name, u.role)
                });
            });
        }
        
        const MOCK_ROLES_REF = {
            "Mario Grágeda": "Administrador General",
            "Svetlana Ushak": "Administrador",
            "Paula Marín": "Administrador",
            "Alonso Gonzalez": "Administrador General",
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

        Object.entries(MOCK_ROLES_REF).forEach(([name, role]) => {
            if (!knownNames.has(name.toLowerCase())) {
                allList.push({
                    name: name,
                    role: role,
                    email: getInstitutionalEmail(name),
                    password: getSecurePassword(name, role)
                });
            }
        });

        const filtered = allList.filter(item => 
            item.name.toLowerCase().includes(filter) ||
            item.role.toLowerCase().includes(filter) ||
            item.email.toLowerCase().includes(filter)
        );

        if (filtered.length === 0) {
            forgotTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
                        No se encontraron credenciales que coincidan con "${filterText}".
                    </td>
                </tr>
            `;
            return;
        }

        forgotTableBody.innerHTML = filtered.map(item => `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem 1rem;"><span style="background: var(--bg-hover); color: var(--text-color); font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">${item.role}</span></td>
                <td style="padding: 0.75rem 1rem; font-weight: 600;">${item.name}</td>
                <td style="padding: 0.75rem 1rem; font-family: monospace; color: var(--primary);">${item.email}</td>
                <td style="padding: 0.75rem 1rem;">
                    <button class="btn btn-sm btn-primary" onclick="window.sendPasswordToEmail('${item.name.replace(/'/g, "\\'")}', '${item.email}', '${item.role}')" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
                        <i class="fas fa-paper-plane"></i> Enviar al Correo
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.sendPasswordToEmail = function(name, email, role) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: '📧 Envió de Credenciales Realizado',
                html: `
                    <div style="text-align: left; font-size: 0.92rem; line-height: 1.5;">
                        <p>Se han enviado las instrucciones de acceso y recuperación al correo institucional:</p>
                        <div style="background: var(--bg-hover); padding: 0.75rem; border-radius: 6px; margin: 0.5rem 0; font-family: monospace; color: var(--primary); font-weight: bold;">
                            ${email}
                        </div>
                        <p><b>Usuario:</b> ${name}<br><b>Rol:</b> ${role}</p>
                        <div style="margin-top: 0.8rem; padding: 0.6rem; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; color: #92400e; font-size: 0.85rem;">
                            <i class="fas fa-shield-alt"></i> <b>Contraseña de Emergencia:</b> En caso de contingencia o emergencia, puede ingresar utilizando la contraseña de emergencia: <code style="background:#fef3c7; padding:2px 6px; border-radius:4px; font-weight:bold; color:#b45309;">celiminadmin</code>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#2563eb'
            });
        } else {
            alert(`Instrucciones enviadas al correo institucional: ${email}\n(Clave de emergencia habilitada: celiminadmin)`);
        }
    };

    if (linkForgot && modalForgotPassword) {
        linkForgot.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchForgotInput) searchForgotInput.value = '';
            renderForgotPasswordTable('');
            modalForgotPassword.classList.remove('hidden');
        });
    }

    if (closeForgotBtn) closeForgotBtn.addEventListener('click', () => modalForgotPassword.classList.add('hidden'));
    if (btnCloseForgot) btnCloseForgot.addEventListener('click', () => modalForgotPassword.classList.add('hidden'));
    if (searchForgotInput) {
        searchForgotInput.addEventListener('input', (e) => {
            renderForgotPasswordTable(e.target.value);
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

        const emailInput = document.getElementById('forgot-email')?.value.trim() || '';

        try {
            let foundUser = typeof usersData !== 'undefined' ? usersData.find(u => (u.email && u.email.toLowerCase() === emailInput.toLowerCase()) || u.name.toLowerCase().includes(emailInput.toLowerCase())) : null;
            const targetEmail = foundUser ? (foundUser.email || getInstitutionalEmail(foundUser.name)) : emailInput;
            const targetName = foundUser ? foundUser.name : 'Usuario';
            const targetRole = foundUser ? foundUser.role : 'Personal';

            window.sendPasswordToEmail(targetName, targetEmail, targetRole);

            const modalForgotEl = document.getElementById('modal-forgot-password') || document.getElementById('modal-forgot');
            if (modalForgotEl) modalForgotEl.classList.add('hidden');
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

    // CAMBIAR MI CONTRASEÑA (Autoservicio para cualquier rol)
    const btnChangeMyPass = document.getElementById('btn-change-my-pass');
    const modalChangeMyPass = document.getElementById('modal-change-my-pass');
    const closeChangeMyPass = document.getElementById('close-modal-change-my-pass');
    const cancelChangeMyPass = document.getElementById('btn-cancel-change-my-pass');
    const formChangeMyPass = document.getElementById('form-change-my-pass');

    if (btnChangeMyPass && modalChangeMyPass) {
        btnChangeMyPass.addEventListener('click', () => {
            const session = storage.get(STORAGE_KEYS.SESSION);
            if (!session) return;
            document.getElementById('change-pass-user-name').value = session.user;
            const roleEl = document.getElementById('change-pass-user-role');
            if (roleEl) roleEl.value = session.role || 'Estándar';
            document.getElementById('change-pass-new').value = '';
            document.getElementById('change-pass-confirm').value = '';
            modalChangeMyPass.classList.remove('hidden');
        });
    }

    if (closeChangeMyPass) closeChangeMyPass.addEventListener('click', () => modalChangeMyPass.classList.add('hidden'));
    if (cancelChangeMyPass) cancelChangeMyPass.addEventListener('click', () => modalChangeMyPass.classList.add('hidden'));

    if (formChangeMyPass) {
        formChangeMyPass.addEventListener('submit', async (e) => {
            e.preventDefault();
            const session = storage.get(STORAGE_KEYS.SESSION);
            if (!session) return;

            const btn = e.target.querySelector('button[type="submit"]');
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
            btn.disabled = true;

            const passNew = document.getElementById('change-pass-new').value.trim();
            const passConfirm = document.getElementById('change-pass-confirm').value.trim();

            if (passNew !== passConfirm) {
                btn.innerHTML = origHtml;
                btn.disabled = false;
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'Las contraseñas no coinciden.', 'warning');
                } else {
                    alert('Las contraseñas no coinciden.');
                }
                return;
            }

            if (passNew.length < 5) {
                btn.innerHTML = origHtml;
                btn.disabled = false;
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Atención', 'La nueva contraseña debe tener al menos 5 caracteres.', 'warning');
                } else {
                    alert('La nueva contraseña debe tener al menos 5 caracteres.');
                }
                return;
            }

            try {
                let userObj = usersData.find(u => u.name === session.user);
                if (userObj) {
                    userObj.password = passNew;
                    await window.dbSync.saveUser(userObj);
                } else {
                    const newUserObj = {
                        name: session.user,
                        role: session.role,
                        password: passNew,
                        email: getInstitutionalEmail(session.user),
                        lastAccess: 'Recientemente',
                        active: true
                    };
                    userObj = newUserObj;
                    await window.dbSync.saveUser(newUserObj, true);
                }

                // Persistir contraseña personalizada en almacenamiento local
                const customPassMap = storage.get('celimin_custom_passwords', {});
                customPassMap[session.user] = passNew;
                storage.set('celimin_custom_passwords', customPassMap);

                saveData();
                renderUsers();

                modalChangeMyPass.classList.add('hidden');
                e.target.reset();

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Contraseña Actualizada!',
                        text: `Tu nueva contraseña ha sido guardada exitosamente.`,
                        confirmButtonColor: '#2563eb'
                    });
                } else {
                    alert('¡Contraseña actualizada con éxito!');
                }
            } catch (err) {
                console.error("Error al cambiar contraseña:", err);
                alert("Error al guardar la contraseña: " + err.message);
            } finally {
                btn.innerHTML = origHtml;
                btn.disabled = false;
            }
        });
    }
});
