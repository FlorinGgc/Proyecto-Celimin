// =============================================================================
// CORE.JS — Módulo Central (datos compartidos, navegación, dashboard, etc.)
// =============================================================================

// Funciones de utilidad para persistencia segura
const storage = {
    get: (key, fallback) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (e) {
            console.warn("Acceso a localStorage bloqueado o fallido:", e);
            return fallback;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("Error al guardar en localStorage:", e);
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {}
    }
};

const STORAGE_KEYS = {
    INVENTORY: 'celimin_inventory_v2',
    USERS: 'celimin_users_v2',
    MOVEMENTS: 'celimin_movements_v2',
    SESSION: 'celimin_session_v2'
};

// Datos iniciales globales (se poblarán desde Supabase)
let labsData = [];
let inventoryData = [];
let usersData = [];
let movementsData = [];
let requestsData = [];
let agendaTrabajosData = [];
let mantenimientoData = [];
let turnosData = [];
let usosData = [];
let planificacionData = [];
let libraryDocsData = [];

// Función para sincronizar datos al inicio
window.initApp = async function() {
    try {
        const db = await window.dbSync.loadAllData();
        labsData = db.labs;
        inventoryData = db.inventory;
        usersData = db.users;
        movementsData = db.movements;
        requestsData = db.requests;
        agendaTrabajosData = db.agenda;
        planificacionData = db.planificacion;
        mantenimientoData = db.mantenimiento;
        turnosData = db.turnos;
        usosData = db.auditoria;
        libraryDocsData = db.library_docs;
        
        console.log("Base de datos cargada exitosamente.");

        // Ejecutar migración de usuarios si está disponible
        if (typeof window.runUsersMigration === 'function') {
            await window.runUsersMigration();
        }
        
        // Render iniciales
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderEquipmentStatus === 'function') renderEquipmentStatus();
        if (typeof renderLabs === 'function') renderLabs();
        if (typeof updateLabSelections === 'function') updateLabSelections();
        
    } catch (error) {
        console.error("Fallo crítico en initApp", error);
    }
};

function saveData() {
    // Ya no guardamos en localStorage. Las operaciones a base de datos
    // se hacen puntualmente con await dbSync.saveX() en las vistas.
    // Esta función se mantiene para disparar actualizaciones de UI por compatibilidad.
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderEquipmentStatus === 'function') renderEquipmentStatus();
}

// =============================================================================
// NAVEGACIÓN
// =============================================================================
function switchView(viewId) {
    if (window.allowedViews && !window.allowedViews.includes(viewId)) {
        console.warn(`Access denied to view: ${viewId}`);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Acceso Denegado',
                text: 'No tienes permisos para acceder a esta sección.',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('No tienes permisos para acceder a esta sección.');
        }
        return;
    }

    let viewElementId = `${viewId}-view`;
    
    // Casos especiales que usan el layout de inventario
    if (viewId === 'low-stock' || viewId === 'expiry-alerts') {
        viewElementId = 'inventory-view';
    }

    const targetView = document.getElementById(viewElementId);
    if (!targetView) return;

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-view="${viewId}"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    targetView.classList.remove('hidden');

    const titleEl = document.getElementById('view-title');
    if (titleEl) {
        const titles = {
            dashboard: 'Dashboard General',
            inventory: 'Inventario',
            users: 'Usuarios',
            movements: 'Movimientos',
            traceability: 'Trazabilidad',
            calendar: 'Calendario Institucional',
            labs: 'Laboratorio (Sedes)',
            'low-stock': 'Insumos con Stock Bajo',
            'expiry-alerts': 'Alertas de Vencimiento Próximo',
            requests: 'Control de Solicitudes',
            somos: 'Sobre Nosotros',
            'linea-trabajo': 'Líneas de Investigación',
            asesorias: 'Servicios y Asesorías',
            proyectos: 'Proyectos de Investigación',
            publicaciones: 'Repositorio de Publicaciones',
            infraestructura: 'Infraestructura y Equipamiento',
            'capital-humano': 'Nuestro Equipo',
            novedades: 'Actualidad y Novedades',
            congreso: 'Eventos y Congresos',
            contactos: 'Canales de Contacto',
            mantenimiento: 'Limpieza y Equipos',
            espacios: 'Orden y Espacios',
            'agendar-trabajos': 'Trabajos Agendados',
            turnos: 'Planificación de Orden y Aseo',
            auditoria: 'Checkeo General',
            planificacion: 'Planificación de Usos',
            library: 'Biblioteca de Documentos',
            plano: 'Plano Interactivo de Laboratorios'
        };
        titleEl.innerText = titles[viewId] || 'CELIMIN';
    }

    if (viewId === 'inventory' || viewId === 'low-stock' || viewId === 'expiry-alerts') {
        document.getElementById('inventory-view').classList.remove('hidden');
        const alertContainer = document.getElementById('inventory-alert-container');
        alertContainer.innerHTML = '';
        
        if (viewId === 'inventory') {
            renderInventory(inventoryData);
        } else if (viewId === 'low-stock') {
            const filtered = inventoryData.filter(i => i.stockActual <= i.stockMin);
            if (filtered.length > 0) {
                alertContainer.innerHTML = `<div class="alert-banner danger"><i class="fas fa-exclamation-circle"></i> Atención: Hay ${filtered.length} insumos con niveles de stock crítico.</div>`;
            } else {
                alertContainer.innerHTML = `<div class="alert-banner success"><i class="fas fa-check-circle"></i> Todo en orden: No hay insumos con stock bajo.</div>`;
            }
            renderInventory(filtered);
        } else if (viewId === 'expiry-alerts') {
            const soon = new Date();
            soon.setMonth(soon.getMonth() + 3);
            const filtered = inventoryData.filter(i => i.expiryDate && new Date(i.expiryDate) <= soon);
            if (filtered.length > 0) {
                alertContainer.innerHTML = `<div class="alert-banner danger"><i class="fas fa-hourglass-end"></i> Atención: ${filtered.length} insumos vencen en los próximos 90 días.</div>`;
            } else {
                alertContainer.innerHTML = `<div class="alert-banner success"><i class="fas fa-calendar-check"></i> Seguridad: No hay insumos próximos a vencer.</div>`;
            }
            renderInventory(filtered);
        }
        return;
    }

    const viewSection = document.getElementById(`${viewId}-view`);
    if (viewSection) viewSection.classList.remove('hidden');

    if (viewId === 'requests') {
        const pending = requestsData.filter(r => r.status === 'pendiente').length;
        const alertContainer = document.getElementById('requests-alert-container');
        if (alertContainer) {
            if (pending > 0) {
                alertContainer.innerHTML = `<div class="alert-banner danger"><i class="fas fa-bell"></i> Pendiente: Hay ${pending} solicitudes esperando revisión.</div>`;
            } else {
                alertContainer.innerHTML = `<div class="alert-banner success"><i class="fas fa-thumbs-up"></i> Al día: No hay solicitudes pendientes de aprobación.</div>`;
            }
        }
        renderRequests();
    }
    if (viewId === 'users') renderUsers();
    if (viewId === 'movements') renderMovements();
    if (viewId === 'dashboard') renderDashboard();
    if (viewId === 'calendar') renderCalendar();
    if (viewId === 'labs') renderLabs();
    if (viewId === 'mantenimiento') renderMantenimiento();
    if (viewId === 'espacios') renderEspacios();
    if (viewId === 'agendar-trabajos') renderAgendaTrabajos();
    if (viewId === 'turnos') renderTurnos();
    if (viewId === 'auditoria') renderAuditoria();
    if (viewId === 'planificacion') renderPlanificacion();
    if (viewId === 'library') renderLibrary();
    if (viewId === 'plano') initPlano();
}

// =============================================================================
// RELOJ EN VIVO
// =============================================================================
function updateClock() {
    const clockDate = document.getElementById('clock-date');
    const clockTime = document.getElementById('clock-time');
    if (!clockDate || !clockTime) return;

    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    clockDate.innerText = now.toLocaleDateString('es-ES', options);
    clockTime.innerText = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

setInterval(updateClock, 1000);

// =============================================================================
// GENERADOR DE CALENDARIO
// =============================================================================
function renderCalendar() {
    const container = document.getElementById('full-year-calendar');
    if (!container) return;
    container.innerHTML = '';

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const year = 2026;
    const now = new Date();

    months.forEach((month, index) => {
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        
        let html = `<div class="month-name">${month} ${year}</div>`;
        html += '<div class="days-grid">';
        
        ['D', 'L', 'M', 'M', 'J', 'V', 'S'].forEach(d => {
            html += `<div class="day-name">${d}</div>`;
        });
 
        const firstDay = new Date(year, index, 1).getDay();
        const daysInMonth = new Date(year, index + 1, 0).getDate();
 
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="day-number empty"></div>';
        }
 
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${(index + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const isToday = now.getFullYear() === year && now.getMonth() === index && now.getDate() === day;
            
            const dayEvents = [];
            agendaTrabajosData.forEach(t => { 
                if(t.fecha === dateStr) {
                    const timeStr = t.hora ? ` (${t.hora})` : '';
                    const eqBadge = t.equipo ? ` [🔬 ${t.equipo}]` : '';
                    dayEvents.push({ type: 'work', title: `${t.titulo}${eqBadge}${timeStr}` }); 
                }
            });

            planificacionData.forEach(p => { if(p.fecha === dateStr) dayEvents.push({ type: 'work', title: `Planificación: ${p.item}` }); });

            let eventDots = '';
            if (dayEvents.length > 0) {
                const types = [...new Set(dayEvents.map(e => e.type))];
                eventDots = `<div class="event-dots">` + types.map(t => `<span class="dot dot-${t}"></span>`).join('') + `</div>`;
            }

            const tooltipText = dayEvents.length ? `title="${dayEvents.map(e => e.title).join('\n')}"` : '';

            html += `<div class="day-number ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}" 
                        ${tooltipText} 
                        onclick="showDayDetails('${dateStr}')">
                        ${day}
                        ${eventDots}
                    </div>`;
        }
 
        html += '</div>';
        monthCard.innerHTML = html;
        container.appendChild(monthCard);
    });
}

// =============================================================================
// LABORATORIOS (SEDES)
// =============================================================================
function renderLabs() {
    const tbody = document.getElementById('labs-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canModify = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento', 'Investigador'].includes(session.role);
    tbody.innerHTML = labsData.map((lab, index) => `
        <tr>
            <td><code>${lab.id}</code></td>
            <td>${lab.name}</td>
            <td>${lab.location}</td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                    ${canModify ? `
                    <button class="btn-action edit" onclick="editLab(${index})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete" onclick="deleteLab(${index})" title="Eliminar"><i class="fas fa-trash"></i></button>
                    ` : '<span class="text-muted" style="font-size: 0.75rem;">—</span>'}
                </div>
            </td>
        </tr>
    `).join('');

    updateLabSelections();
}

window.editLab = (index) => {
    const lab = labsData[index];
    document.getElementById('edit-lab-index').value = index;
    document.getElementById('edit-lab-id').value = lab.id;
    document.getElementById('edit-lab-name').value = lab.name;
    document.getElementById('edit-lab-location').value = lab.location;
    document.getElementById('modal-edit-lab').classList.remove('hidden');
};

function deleteLab(index) {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento', 'Investigador'].includes(session.role);
    if (!canDelete) {
        alert('No tiene permisos para eliminar.');
        return;
    }
    if (confirm(`¿Eliminar el laboratorio "${labsData[index].name}"?`)) {
        window.dbSync.deleteLab(labsData[index].id).then(() => {
            labsData.splice(index, 1);
            saveData();
            renderLabs();
        });
    }
}

function updateLabSelections() {
    const containers = [
        document.getElementById('item-labs-selection'),
        document.getElementById('edit-item-labs-selection')
    ];

    containers.forEach(container => {
        if (!container) return;
        const isEdit = container.id.includes('edit');
        const name = isEdit ? 'edit-labs' : 'labs';
        
        if (labsData.length === 0) {
            container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem; font-style:italic; padding: 0.25rem;">No hay laboratorios registrados. Ve a la sección "Laboratorio (Sedes)" para agregar uno.</span>';
        } else {
            container.innerHTML = labsData.map(lab => `
                <label class="checkbox-item"><input type="checkbox" name="${name}" value="${lab.id}"> ${lab.name}</label>
            `).join('');
        }
    });

    const filterSelect = document.getElementById('lab-filter');
    if (filterSelect) {
        const currentValue = filterSelect.value;
        filterSelect.innerHTML = '<option value="all">Todos los Laboratorios</option>' + 
            labsData.map(lab => `<option value="${lab.id}">${lab.name} (${lab.location})</option>`).join('');
        
        if ([...filterSelect.options].some(opt => opt.value === currentValue)) {
            filterSelect.value = currentValue;
        }
    }
}

// =============================================================================
// BÚSQUEDA, FILTRADO Y ORDENAMIENTO DE INVENTARIO
// =============================================================================
window.sortInventoryData = function(items, sortVal = 'name-asc') {
    const sorted = [...items];
    sorted.sort((a, b) => {
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        const zoneA = (a.locationDetail || '').trim();
        const zoneB = (b.locationDetail || '').trim();
        const codeA = (a.code || '').trim();
        const codeB = (b.code || '').trim();

        if (sortVal === 'name-asc') {
            return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
        } else if (sortVal === 'name-desc') {
            return nameB.localeCompare(nameA, 'es', { sensitivity: 'base' });
        } else if (sortVal === 'zone-asc') {
            if (!zoneA && !zoneB) return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
            if (!zoneA) return 1;
            if (!zoneB) return -1;
            const cmp = zoneA.localeCompare(zoneB, 'es', { numeric: true, sensitivity: 'base' });
            return cmp !== 0 ? cmp : nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
        } else if (sortVal === 'zone-desc') {
            if (!zoneA && !zoneB) return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
            if (!zoneA) return 1;
            if (!zoneB) return -1;
            const cmp = zoneB.localeCompare(zoneA, 'es', { numeric: true, sensitivity: 'base' });
            return cmp !== 0 ? cmp : nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
        } else if (sortVal === 'code-asc') {
            return codeA.localeCompare(codeB, 'es', { numeric: true });
        } else if (sortVal === 'code-desc') {
            return codeB.localeCompare(codeA, 'es', { numeric: true });
        } else if (sortVal === 'category-asc') {
            const catCmp = (a.category || '').localeCompare(b.category || '', 'es', { sensitivity: 'base' });
            return catCmp !== 0 ? catCmp : nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
        } else if (sortVal === 'stock-asc') {
            return (a.stockActual || 0) - (b.stockActual || 0);
        } else if (sortVal === 'stock-desc') {
            return (b.stockActual || 0) - (a.stockActual || 0);
        }
        return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    });
    return sorted;
};

window.setInventorySort = function(field) {
    const sortSelect = document.getElementById('inventory-sort');
    if (!sortSelect) return;
    const current = sortSelect.value;
    let next = `${field}-asc`;
    if (current === `${field}-asc`) {
        next = `${field}-desc`;
    }
    sortSelect.value = next;
    applyFilters();
};

function applyFilters() {
    const searchTerm = document.getElementById('inventory-search')?.value.toLowerCase() || '';
    const labFilter = document.getElementById('lab-filter')?.value || 'all';
    const sortVal = document.getElementById('inventory-sort')?.value || 'name-asc';

    let filtered = inventoryData.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm) || 
                             (item.category || '').toLowerCase().includes(searchTerm) ||
                             (item.code || '').toLowerCase().includes(searchTerm) ||
                             (item.locationDetail || '').toLowerCase().includes(searchTerm);
        
        const matchesLab = labFilter === 'all' || (item.labs && item.labs.includes(labFilter));
        
        return matchesSearch && matchesLab;
    });

    filtered = window.sortInventoryData(filtered, sortVal);

    if (typeof renderInventoryTable === 'function') renderInventoryTable(filtered);
    if (typeof renderEquipmentStatus === 'function') {
        renderEquipmentStatus(currentEquipmentFilter);
    }
}

document.getElementById('inventory-search')?.addEventListener('input', applyFilters);
document.getElementById('lab-filter')?.addEventListener('change', applyFilters);
document.getElementById('inventory-sort')?.addEventListener('change', applyFilters);
document.getElementById('espacios-search')?.addEventListener('input', () => {
    if (typeof renderEspacios === 'function') renderEspacios();
});

// =============================================================================
// OPERACIONES DE STOCK
// =============================================================================
window.openMovementModal = (index, type) => {
    const item = inventoryData[index];
    document.getElementById('mv-item-index').value = index;
    document.getElementById('mv-type').value = type;
    document.getElementById('mv-item-name').innerText = item.name;
    document.getElementById('mv-type-label').innerText = type.toLowerCase();
    document.getElementById('movement-modal-title').innerText = `Registrar ${type}`;
    document.getElementById('modal-movement').classList.remove('hidden');
};

async function handleMovement(e) {
    e.preventDefault();
    const index = document.getElementById('mv-item-index').value;
    const type = document.getElementById('mv-type').value;
    const qty = parseInt(document.getElementById('mv-qty').value);
    const reason = document.getElementById('mv-reason').value;
    const item = inventoryData[index];

    if (type === 'Salida' && item.stockActual < qty) {
        alert('Error: Stock insuficiente para realizar la salida.');
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]') || e.target.querySelector('.btn-primary');
    const originalText = btn ? btn.innerHTML : 'Guardar';
    if(btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; btn.disabled = true; }

    try {
        if (type === 'Ingreso') item.stockActual += qty;
        else item.stockActual -= qty;

        if (item.stockActual <= 0) item.status = 'out';
        else if (item.stockActual <= item.stockMin) item.status = 'low';
        else item.status = 'ok';

        const now = new Date();
        const session = storage.get(STORAGE_KEYS.SESSION);
        const mov = {
            id: `TRX-${Date.now().toString().slice(-6)}`,
            type: type,
            item: item.name,
            qty: `${qty} ${item.unit}`,
            user: session ? session.user : 'Sistema',
            target: reason || 'Ajuste de inventario',
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };

        if (window.dbSync && window.dbSync.saveInventoryItem) {
            await window.dbSync.saveInventoryItem(item);
        }
        if (window.dbSync && window.dbSync.insertMovement) {
            await window.dbSync.insertMovement(mov);
        }

        movementsData.push(mov);
        saveData();
        renderInventory();
        renderDashboard();
        if (typeof renderMovements === 'function') renderMovements();
        document.getElementById('modal-movement').classList.add('hidden');
        document.getElementById('form-movement').reset();
        alert('Movimiento registrado con éxito.');
    } catch(err) {
        console.error('Error saving movement:', err);
        alert('Error al registrar movimiento. Asegúrate de tener RLS desactivado en "movements" y "inventory".');
    } finally {
        if(btn) { btn.innerHTML = originalText; btn.disabled = false; }
    }
}

// =============================================================================
// GESTIÓN DE SOLICITUDES
// =============================================================================
function renderRequests() {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canApprove = session && ['Administrador', 'Compra y Abastecimiento', 'Investigador'].includes(session.role);
    tbody.innerHTML = requestsData.length ? requestsData.map((req, index) => `
        <tr>
            <td><code>${req.id}</code></td>
            <td>${req.user}</td>
            <td>${req.item}</td>
            <td>${req.qty}</td>
            <td>${req.date}</td>
            <td><span class="status-badge status-${req.status}">${req.status.toUpperCase()}</span></td>
            <td style="text-align: right;">
                ${req.status === 'pendiente' ? (canApprove ? `
                    <button class="btn-action success-btn" onclick="approveRequest(${index})" title="Aprobar"><i class="fas fa-check"></i></button>
                    <button class="btn-action danger-btn" onclick="rejectRequest(${index})" title="Rechazar"><i class="fas fa-times"></i></button>
                ` : '<span class="text-muted" style="font-size: 0.8rem;">Pendiente Aprobación</span>') : '<i class="fas fa-check-double text-muted"></i>'}
            </td>
        </tr>
    `).join('') : '<tr><td colspan="7" style="text-align:center;padding:2rem;">No hay solicitudes registradas</td></tr>';
}

window.approveRequest = async (index) => {
    const req = requestsData[index];
    const itemIndex = inventoryData.findIndex(i => i.name === req.item);
    
    // Suponiendo que req.qty contiene un número (ej. "10 Unid")
    const qtyMatch = req.qty.match(/\d+/);
    const qtyNum = qtyMatch ? parseInt(qtyMatch[0]) : 1;

    if (itemIndex !== -1) {
        const item = inventoryData[itemIndex];
        if (item.stockActual < qtyNum) {
            alert('No hay stock suficiente para aprobar esta solicitud.');
            return;
        }
        item.stockActual -= qtyNum;
        if (item.stockActual <= 0) item.status = 'out';
        else if (item.stockActual <= item.stockMin) item.status = 'low';
        else item.status = 'ok';
        
        await window.dbSync.saveInventoryItem(item);
        
        const now = new Date();
        const mov = {
            id: `TRX-${Date.now().toString().slice(-6)}`,
            type: 'Salida (Solicitud)',
            item: item.name,
            qty: req.qty,
            user: req.user,
            target: 'Entrega por Solicitud',
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };
        await window.dbSync.insertMovement(mov);
        movementsData.push(mov);
    }

    req.status = 'aprobada';
    await window.dbSync.saveRequest(req);
    saveData();
    renderRequests();
    renderInventory();
    renderDashboard();
};

window.rejectRequest = async (index) => {
    requestsData[index].status = 'rechazada';
    await window.dbSync.saveRequest(requestsData[index]);
    saveData();
    renderRequests();
};

// =============================================================================
// MOVIMIENTOS
// =============================================================================
function renderMovements() {
    const tbody = document.getElementById('movements-table-body');
    if (!tbody) return;
    tbody.innerHTML = movementsData.map(mv => `
        <tr>
            <td><code>${mv.id}</code></td>
            <td>${mv.type}</td>
            <td>${mv.item}</td>
            <td>${mv.qty}</td>
            <td>${mv.user}</td>
            <td>${mv.target}</td>
        </tr>
    `).join('');
}

// =============================================================================
// DASHBOARD
// =============================================================================
function renderDashboard() {
    const tbody = document.getElementById('recent-activity-body');
    if (!tbody) return;
    const recent = [...movementsData].reverse().slice(0, 5);
    tbody.innerHTML = recent.length ? recent.map(mv => `
        <tr>
            <td>${mv.date || 'Hoy'} ${mv.time || ''}</td>
            <td>${mv.user}</td>
            <td>${mv.type}</td>
            <td>${mv.item}</td>
        </tr>
    `).join('') : '<tr><td colspan="4" style="text-align:center;padding:1rem;">Sin actividad reciente</td></tr>';

    const elItemsTotal = document.getElementById('stat-items-total');
    const elAlerts = document.getElementById('stat-alerts');
    const elMovements = document.getElementById('stat-movements');

    if (elItemsTotal) {
        elItemsTotal.innerText = inventoryData.length.toLocaleString('es-CL');
    }
    
    if (elAlerts) {
        const alertsCount = inventoryData.filter(i => i.stockActual <= i.stockMin).length;
        elAlerts.innerText = alertsCount.toLocaleString('es-CL');
    }

    if (elMovements) {
        elMovements.innerText = movementsData.length.toLocaleString('es-CL');
    }
}

window.forceUpdateDashboard = function() {
    const btn = document.getElementById('btn-force-update');
    if (btn) {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
        btn.disabled = true;
        
        setTimeout(() => {
            renderDashboard();
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }, 500);
    } else {
        renderDashboard();
    }
    renderEquipmentStatus();
}

window.masterSync = async function() {
    // Re-cargar todo de supabase
    await initApp();
    renderInventory();
    renderLabs();
    if (typeof window.renderAgendaTrabajos === 'function') window.renderAgendaTrabajos();
    if (typeof window.renderCalendar === 'function') window.renderCalendar();
    
    console.log("Sincronización maestra completada con Supabase.");
};

function renderInventory(data) {
    const searchInput = document.getElementById('inventory-search');
    const labFilter = document.getElementById('lab-filter');
    const sortSelect = document.getElementById('inventory-sort');
    
    if (data === undefined || data === inventoryData) {
        if (typeof applyFilters === 'function') {
            applyFilters();
            return;
        }
    }

    let displayData = data === undefined ? inventoryData : data;
    const sortVal = sortSelect?.value || 'name-asc';
    if (typeof window.sortInventoryData === 'function') {
        displayData = window.sortInventoryData(displayData, sortVal);
    }

    if (typeof renderInventoryTable === 'function') renderInventoryTable(displayData);
    if (typeof renderEquipmentStatus === 'function') {
        renderEquipmentStatus(currentEquipmentFilter);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar aplicación cargando datos de Supabase
    window.initApp();
});

// =============================================================================
// AGENDA DE TRABAJOS
// =============================================================================
window.renderAgendaTrabajos = function() {
    const tbody = document.getElementById('agendar-trabajos-table-body');
    if (!tbody) return;

    const combinedData = [];
    
    const safeMap = (arr, mapper) => {
        if (!Array.isArray(arr)) return [];
        return arr.map(mapper);
    };

    combinedData.push(...safeMap(agendaTrabajosData, (t, index) => ({ 
        ...t, 
        titulo: t.titulo || 'Sin título',
        fecha: t.fecha || '',
        hora: t.hora || '--:--',
        type: t.type || 'Trabajo', 
        originalIndex: index, 
        source: 'agenda' 
    })));

    combinedData.push(...safeMap(planificacionData, (p, index) => ({
        titulo: `Planificación: ${p.item || 'Item'} (${p.usuario || 'Sist'})`,
        fecha: p.fecha || '',
        hora: '--:--',
        insumos: 'Reserva de uso',
        equipo: p.item || 'N/A',
        type: 'Trabajo',
        originalIndex: index,
        source: 'planificacion'
    })));

    combinedData.sort((a, b) => {
        const dA = (a.fecha || '0000-00-00');
        const dB = (b.fecha || '0000-00-00');
        const comp = dB.localeCompare(dA);
        if (comp !== 0) return comp;
        return (b.hora || '00:00').localeCompare(a.hora || '00:00');
    });

    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento', 'Investigador'].includes(session.role);

    tbody.innerHTML = combinedData.length ? combinedData.map(t => {
        const typeKey = (t.type || 'trab').toLowerCase().substring(0,4);
        const displayDate = t.fecha.includes('-') ? t.fecha.split('-').reverse().join('/') : t.fecha;
        return `
        <tr class="row-${typeKey}">
            <td style="text-align: center;">
                <span class="type-indicator type-${typeKey}">${t.type}</span><br>
                <strong>${t.titulo}</strong>
            </td>
            <td style="text-align: center;">${displayDate}</td>
            <td style="text-align: center;">${t.hora}</td>
            <td style="text-align: center;">${t.insumos || 'N/A'}</td>
            <td style="text-align: center;">${t.equipo || 'N/A'}${t.responsable ? ` / ${t.responsable}` : ''}</td>
            <td style="text-align: center;">
                <div style="display: flex; gap: 0.35rem; justify-content: center;">
                    ${(t.source === 'agenda' || t.source === 'planificacion') ? `<button class="btn-action edit" onclick="window.editActivity('${t.source}', ${t.originalIndex})" title="Editar"><i class="fas fa-edit"></i></button>` : ''}
                    ${canDelete ? `<button class="btn-action delete" onclick="window.deleteActivity('${t.source}', ${t.originalIndex})" title="Eliminar"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            </td>
        </tr>
    `;}).join('') : '<tr><td colspan="6" style="text-align:center;padding:1rem;">No hay actividades programadas</td></tr>';

    renderInsumosUso();
    renderEquipmentStatus();
}

function renderInsumosUso() {
    const container = document.getElementById('insumos-uso-list');
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];
    const insumosSet = new Set();
    
    agendaTrabajosData.forEach(t => {
        if (t.fecha === today && t.insumos) {
            t.insumos.split(',').forEach(i => insumosSet.add(i.trim()));
        }
    });

    if (insumosSet.size === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No hay insumos asignados a trabajos para hoy.</p>';
        return;
    }

    container.innerHTML = Array.from(insumosSet).map(insumo => `
        <div class="card" style="padding: 1rem; border-left: 4px solid var(--primary); display: flex; align-items: center; gap: 1rem;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></div>
            <div>
                <strong style="display: block;">${insumo}</strong>
                <small style="color: var(--text-muted);">En verificación de uso</small>
            </div>
        </div>
    `).join('');
}

window.editActivity = function(source, index) {
    console.log("CLIC EN EDITAR ACTIVIDAD:", source, index);
    try {
        let activity;
        if (source === 'agenda') activity = agendaTrabajosData[index];
        else if (source === 'planificacion') activity = { 
            titulo: planificacionData[index].item, 
            fecha: planificacionData[index].fecha, 
            insumos: 'Reserva de uso', 
            type: 'Trabajo' 
        };


    window.currentEditingActivityIndex = index;
    window.currentEditingActivitySource = source;

    document.getElementById('agenda-type').value = activity.type || 'Trabajo';
    
    const agendaTypeSelect = document.getElementById('agenda-type');
    if (agendaTypeSelect) {
        agendaTypeSelect.dispatchEvent(new Event('change'));
    }

    if (typeof window.populateInventorySelectors === 'function') {
        window.populateInventorySelectors();
    }

    document.getElementById('agenda-titulo').value = activity.titulo || activity.item;
    document.getElementById('agenda-fecha').value = activity.fecha;
    document.getElementById('agenda-insumos').value = activity.insumos || '';
    document.getElementById('agenda-equipo').value = activity.equipo || '';
    document.getElementById('agenda-responsable').value = activity.responsable || '';

    const eqSelect = document.getElementById('agenda-equipo-select');
    if (eqSelect && activity.equipo) {
        eqSelect.value = activity.equipo;
    }

    if (activity.horaInicio) {
        document.getElementById('agenda-hora-inicio').value = activity.horaInicio;
    } else if (activity.hora && activity.hora.includes(' - ')) {
        const parts = activity.hora.split(' - ');
        document.getElementById('agenda-hora-inicio').value = parts[0];
    } else {
        document.getElementById('agenda-hora-inicio').value = activity.hora || '';
    }

    if (activity.horaFin) {
        document.getElementById('agenda-hora-fin').value = activity.horaFin;
    } else if (activity.hora && activity.hora.includes(' - ')) {
        const parts = activity.hora.split(' - ');
        document.getElementById('agenda-hora-fin').value = parts[1];
    } else {
        document.getElementById('agenda-hora-fin').value = '';
    }
    
    document.getElementById('modal-agendar').classList.remove('hidden');
    if (typeof window.checkEquipmentAvailability === 'function') {
        window.checkEquipmentAvailability();
    }
    } catch(e) {
        console.error("ERROR EN EDIT ACTIVITY:", e);
        alert("Error al editar: " + e.message);
    }
}

window.deleteActivity = async function(source, index) {
    console.log("CLIC EN ELIMINAR:", source, index);
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento', 'Investigador'].includes(session.role);
    if (!canDelete) {
        alert('No tiene permisos para eliminar.');
        return;
    }

    let idToDelete = null;
    let arrayRef = null;

    if (source === 'agenda') {
        idToDelete = agendaTrabajosData[index]?.id;
        arrayRef = agendaTrabajosData;
    } else if (source === 'movements') {
        idToDelete = movementsData[index]?.id;
        arrayRef = movementsData;
    } else if (source === 'requests') {
        idToDelete = requestsData[index]?.id;
        arrayRef = requestsData;
    } else if (source === 'planificacion') {
        idToDelete = planificacionData[index]?.id;
        arrayRef = planificacionData;
    }

    if (!idToDelete) {
        console.error("No se encontró el ID para eliminar");
        alert("No se puede eliminar: ID no encontrado.");
        return;
    }

    try {
        if (source === 'agenda' && window.dbSync && window.dbSync.deleteAgenda) {
            await window.dbSync.deleteAgenda(idToDelete);
        } else if (source === 'movements' && window.dbSync && window.dbSync.deleteMovement) {
            await window.dbSync.deleteMovement(idToDelete);
        } else if (source === 'requests' && window.dbSync && window.dbSync.deleteRequest) {
            await window.dbSync.deleteRequest(idToDelete);
        } else if (source === 'planificacion' && window.dbSync && window.dbSync.deletePlanificacion) {
            await window.dbSync.deletePlanificacion(idToDelete);
        }

        arrayRef.splice(index, 1);
        
        if (typeof window.renderAgendaTrabajos === 'function') window.renderAgendaTrabajos();
        if (typeof window.renderCalendar === 'function') window.renderCalendar();
        
        const dayModal = document.getElementById('modal-calendar-day');
        if (dayModal && !dayModal.classList.contains('hidden')) {
            const titleText = document.getElementById('calendar-day-title').textContent;
            if (titleText.includes(': ')) {
                const dateParts = titleText.split(': ')[1].split('/');
                if (dateParts.length === 3) {
                    const dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    if (typeof window.showDayDetails === 'function') window.showDayDetails(dateStr);
                }
            }
        }

        saveData();
        
        Swal.fire({
            icon: 'success',
            title: 'Registro Eliminado',
            text: 'La tabla y el calendario se han actualizado.',
            timer: 1000,
            showConfirmButton: false
        });
    } catch (error) {
        console.error("Error al eliminar en la BD:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el registro en la base de datos.',
        });
    }
}

window.showDayDetails = function(dateStr) {
    console.log("CLIC EN VER DETALLES DIA:", dateStr);
    const dayEvents = [];
    agendaTrabajosData.forEach((t, index) => { if(t.fecha === dateStr) dayEvents.push({ ...t, source: 'agenda', originalIndex: index, type: t.type || 'Trabajo', time: t.hora }); });
    movementsData.forEach((m, index) => { if(m.date === dateStr) dayEvents.push({ titulo: `${m.type}: ${m.item}`, source: 'movements', originalIndex: index, type: 'Movimiento', time: m.time }); });
    requestsData.forEach((r, index) => { 
        const parts = r.date.split('/');
        if (parts.length === 3) {
            const dayPart = parts[0].padStart(2, '0');
            const monthPart = parts[1].padStart(2, '0');
            const yearPart = parts[2];
            if (`${yearPart}-${monthPart}-${dayPart}` === dateStr) {
                dayEvents.push({ titulo: `Solicitud: ${r.item}`, source: 'requests', originalIndex: index, type: 'Solicitud' });
            }
        }
    });

    planificacionData.forEach((p, index) => { if(p.fecha === dateStr) dayEvents.push({ titulo: `Planificación: ${p.item}`, source: 'planificacion', originalIndex: index, type: 'Trabajo' }); });

    const modal = document.getElementById('modal-calendar-day');
    const content = document.getElementById('calendar-day-content');
    const title = document.getElementById('calendar-day-title');
    
    const displayDate = dateStr.split('-').reverse().join('/');
    title.textContent = `Actividades del Día: ${displayDate}`;
    
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento', 'Investigador'].includes(session.role);

    if (dayEvents.length === 0) {
        content.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">
            <i class="fas fa-calendar-times" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
            <p>No hay actividades programadas para este día.</p>
        </div>`;
        if (modal) modal.classList.remove('hidden');
        return;
    }

    content.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Actividad / Horario</th>
                    <th>Equipo / Insumos Reservados</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${dayEvents.map(e => `
                    <tr>
                        <td>
                            <strong>${e.titulo}</strong> 
                            ${e.time ? `<br><small style="color:var(--primary); font-weight:600;"><i class="far fa-clock"></i> ${e.time}</small>` : ''}
                            ${e.responsable ? `<br><small><strong>Responsable:</strong> ${e.responsable}</small>` : ''}
                        </td>
                        <td>
                            ${e.equipo ? `<span class="badge" style="background:#e0e7ff; color:#3730a3; padding:3px 7px; border-radius:4px; font-size:0.75rem; font-weight:700; display:inline-block; margin-bottom:3px;"><i class="fas fa-microscope"></i> ${e.equipo}</span><br>` : ''}
                            ${e.insumos ? `<small class="text-muted"><i class="fas fa-vial"></i> ${e.insumos}</small>` : '<small class="text-muted">—</small>'}
                        </td>
                        <td><span class="type-indicator type-${e.type ? e.type.toLowerCase().substring(0,4) : 'trab'}">${e.type || 'Trabajo'}</span></td>
                        <td>
                            <div style="display: flex; gap: 0.5rem;">
                                ${(e.source === 'agenda' || e.source === 'planificacion') ? `<button class="btn-action edit" onclick="window.editActivity('${e.source}', ${e.originalIndex}); document.getElementById('modal-calendar-day').classList.add('hidden');" title="Editar"><i class="fas fa-edit"></i></button>` : ''}
                                ${canDelete ? `<button class="btn-action delete" onclick="window.deleteActivity('${e.source}', ${e.originalIndex})" title="Eliminar"><i class="fas fa-trash"></i></button>` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    if (modal) modal.classList.remove('hidden');
}

// =============================================================================
// TURNOS, AUDITORÍA, PLANIFICACIÓN, MANTENIMIENTO, ESPACIOS
// =============================================================================
function renderTurnos() {
    const tbody = document.getElementById('turnos-table-body');
    if (!tbody) return;
    tbody.innerHTML = turnosData.length ? turnosData.map((t, index) => `
        <tr>
            <td style="text-align: center;"><strong>${t.laboratorio}</strong></td>
            <td style="text-align: center;">${t.jefe}</td>
            <td style="text-align: center;">${t.semana}</td>
            <td style="text-align: center;">${t.mes}</td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                    <button class="btn-action edit" onclick="window.editTurno(${index})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete" onclick="window.deleteTurno(${index})" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align:center;padding:1rem;">No hay responsables asignados</td></tr>';
}

window.editTurno = function(index) {
    const item = turnosData[index];
    if (!item) return;
    document.getElementById('edit-turno-index').value = index;
    document.getElementById('turno-lab').value = item.laboratorio || '';
    document.getElementById('turno-jefe').value = item.jefe || '';
    document.getElementById('turno-semana').value = item.semana || '';
    document.getElementById('turno-mes').value = item.mes || '';
    const titleEl = document.getElementById('modal-turno-title');
    if (titleEl) titleEl.innerText = 'Editar Responsable de Orden y Aseo';
    document.getElementById('modal-turno').classList.remove('hidden');
};

window.deleteTurno = async function(index) {
    const item = turnosData[index];
    if (!item) return;
    if (confirm(`¿Está seguro de eliminar la asignación para "${item.laboratorio}" (${item.jefe})?`)) {
        try {
            if (window.dbSync && window.dbSync.deleteTurno) {
                await window.dbSync.deleteTurno(item);
            }
        } catch (err) {
            console.error("Error al eliminar turno en BD:", err);
        }
        turnosData.splice(index, 1);
        saveData();
        renderTurnos();
        if (typeof Swal !== 'undefined') {
            Swal.fire({ icon: 'success', title: 'Responsable Eliminado', timer: 1000, showConfirmButton: false });
        }
    }
};

function renderAuditoria() {
    const tbody = document.getElementById('auditoria-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const userRole = (session && session.role) ? session.role.toLowerCase().trim() : '';
    const canCheck = ['administrador', 'administrador general', 'compra y abastecimiento'].includes(userRole);

    tbody.innerHTML = usosData.length ? usosData.map((u, index) => {
        const isConfirmed = !!(u.checked || u.confirmado);

        return `
        <tr style="${isConfirmed ? 'background-color: rgba(16, 185, 129, 0.06);' : ''}">
            <td style="text-align: center;"><strong>${u.item}</strong></td>
            <td style="text-align: center;">${u.usuario}</td>
            <td style="text-align: center;">${u.cantidad}</td>
            <td style="text-align: center;">${u.fecha}</td>
            <td style="text-align: center;">${u.comentario || '-'}</td>
            <td style="text-align: center;">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.2rem;">
                    <input type="checkbox" style="transform: scale(1.4); cursor: pointer;" onchange="window.toggleUsoCheck(${index})" ${isConfirmed ? 'checked' : ''} ${canCheck ? '' : 'disabled'}>
                    <span class="status-badge ${isConfirmed ? 'status-ok' : 'status-pending'}" style="font-size: 0.65rem; padding: 1px 6px;">
                        ${isConfirmed ? 'REVISADO' : 'PENDIENTE'}
                    </span>
                </div>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; gap: 0.35rem; justify-content: center; align-items: center;">
                    ${!isConfirmed ? `
                        <button class="btn btn-sm" onclick="window.confirmarTerminoFila(${index})" title="Confirmar Término de Trabajo" 
                                style="background: #10b981; color: white; border: none; font-size: 0.75rem; padding: 0.35rem 0.65rem; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem;">
                            <i class="fas fa-check-circle"></i> Confirmar Término
                        </button>
                    ` : `
                        <button class="btn btn-sm" onclick="window.confirmarTerminoFila(${index})" title="Re-confirmar Término de Trabajo" 
                                style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-size: 0.75rem; padding: 0.35rem 0.65rem; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem;">
                            <i class="fas fa-check-double"></i> Confirmado
                        </button>
                    `}
                    <button class="btn-action view" onclick="viewUsoDetail(${index})" title="Ver detalles"><i class="fas fa-eye"></i></button>
                    <button class="btn-action edit" onclick="editUso(${index})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete" onclick="deleteUso(${index})" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;}).join('') : '<tr><td colspan="7" style="text-align:center;padding:1rem;">No hay registros de uso</td></tr>';
}

window.toggleUsoCheck = async (index) => {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const userRole = (session && session.role) ? session.role.toLowerCase().trim() : '';
    const canCheck = ['administrador', 'administrador general', 'compra y abastecimiento'].includes(userRole);
    if (!canCheck) {
        alert('No tiene permisos para modificar la revisión.');
        return;
    }
    usosData[index].checked = !usosData[index].checked;
    usosData[index].confirmado = usosData[index].checked;
    if (window.dbSync && window.dbSync.saveAuditoria) {
        await window.dbSync.saveAuditoria(usosData[index]);
    }
    saveData();
    renderAuditoria();
};

window.confirmarTerminoFila = async function(index) {
    const item = usosData[index];
    if (!item) return;

    const session = storage.get(STORAGE_KEYS.SESSION);
    const currentUser = session ? session.user : '';
    const userRole = session ? (session.role || '').toLowerCase().trim() : '';
    const isAdmin = ['administrador', 'administrador general'].includes(userRole);
    
    const isOwner = currentUser && currentUser.toLowerCase().trim() === (item.usuario || '').toLowerCase().trim();
    if (!isOwner && !isAdmin && currentUser) {
        Swal.fire({
            icon: 'warning',
            title: 'Acceso Denegado',
            text: `Solo ${item.usuario} o un Administrador pueden confirmar el término de este trabajo.`,
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const titleText = item.checked ? `¿Actualizar Término de Trabajo?` : `¿Confirmar Término para "${item.item}"?`;
    const bodyText = `<strong>Ítem / Trabajo:</strong> ${item.item}<br><strong>Usuario:</strong> ${item.usuario}<br><strong>Cantidad:</strong> ${item.cantidad}<br><br>Esto registrará la confirmación del término de trabajo en el historial de auditoría y movimientos.`;

    Swal.fire({
        title: titleText,
        html: bodyText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: item.checked ? 'Sí, re-confirmar' : 'Sí, confirmar término',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10b981'
    }).then(async (result) => {
        if (result.isConfirmed) {
            item.checked = true;
            item.confirmado = true;

            const now = new Date();
            const mov = {
                id: `TRX-${Date.now().toString().slice(-6)}`,
                type: 'Término de Trabajo',
                item: item.item,
                qty: `${item.cantidad}`,
                user: currentUser || item.usuario,
                target: `Término Confirmado: ${item.item} (${item.usuario})`,
                date: now.toISOString().split('T')[0],
                time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            };

            try {
                if (window.dbSync && window.dbSync.saveAuditoria) {
                    await window.dbSync.saveAuditoria(item);
                }
                if (window.dbSync && window.dbSync.insertMovement) {
                    await window.dbSync.insertMovement(mov);
                }
                if (typeof movementsData !== 'undefined' && Array.isArray(movementsData)) {
                    movementsData.push(mov);
                }
                saveData();
                renderAuditoria();
                if (typeof renderDashboard === 'function') renderDashboard();
                if (typeof renderMovements === 'function') renderMovements();

                Swal.fire({
                    icon: 'success',
                    title: 'Término Confirmado',
                    text: `Se ha registrado el término de trabajo para "${item.item}".`,
                    timer: 1800,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al confirmar término de fila:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo guardar la confirmación en la base de datos.'
                });
            }
        }
    });
};

window.deleteUso = async (index) => {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const userRole = (session && session.role) ? session.role.toLowerCase().trim() : '';
    const canDelete = ['administrador', 'administrador general', 'compra y abastecimiento', 'investigador'].includes(userRole);
    if (!canDelete) {
        alert('No tiene permisos para eliminar.');
        return;
    }
    
    const u = usosData[index];
    if (!u) return;

    Swal.fire({
        title: '¿Eliminar Registro?',
        text: `¿Estás seguro de que deseas eliminar el registro de uso para "${u.item}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'var(--danger)'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                if (window.dbSync && window.dbSync.deleteAuditoria) {
                    await window.dbSync.deleteAuditoria(u.id);
                }
                usosData.splice(index, 1);
                saveData();
                renderAuditoria();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El registro ha sido eliminado del sistema.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al eliminar uso:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el registro de la base de datos.'
                });
            }
        }
    });
};

window.viewUsoDetail = (index) => {
    const u = usosData[index];
    if (!u) return;
    Swal.fire({
        title: '<i class="fas fa-clipboard-check" style="color:var(--primary)"></i> Detalles de Consumo',
        html: `
            <div style="text-align: left; padding: 10px; font-size: 0.95rem; line-height: 1.6;">
                <p><strong>Insumo/Reactivo/Equipo:</strong> ${u.item}</p>
                <p><strong>Usuario (Quién lo usó):</strong> ${u.usuario}</p>
                <p><strong>Cantidad:</strong> ${u.cantidad}</p>
                <p><strong>Fecha:</strong> ${u.fecha}</p>
                <p><strong>Estado Revisión:</strong> ${u.checked ? 'Revisado' : 'Pendiente'}</p>
                <p style="white-space: pre-wrap; margin-top: 10px;"><strong>Comentario/Observación:</strong><br>${u.comentario || 'Sin comentarios'}</p>
            </div>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: 'var(--primary)'
    });
};

window.editUso = (index) => {
    const u = usosData[index];
    if (!u) return;
    
    Swal.fire({
        title: '<i class="fas fa-edit" style="color:var(--primary)"></i> Editar Registro de Uso',
        html: `
            <div style="text-align: left; padding: 10px;">
                <div style="margin-bottom: 1rem;">
                    <label style="display:block; margin-bottom: 0.3rem; font-weight: 700; font-size: 0.85rem;">Insumo / Reactivo / Equipo</label>
                    <input id="swal-uso-item" class="swal2-input" value="${u.item}" style="width: 100%; margin: 0; border-radius: 8px;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display:block; margin-bottom: 0.3rem; font-weight: 700; font-size: 0.85rem;">Usuario (Quién lo usó)</label>
                    <input id="swal-uso-usuario" class="swal2-input" value="${u.usuario}" style="width: 100%; margin: 0; border-radius: 8px;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display:block; margin-bottom: 0.3rem; font-weight: 700; font-size: 0.85rem;">Cantidad</label>
                        <input id="swal-uso-cantidad" type="number" min="1" class="swal2-input" value="${u.cantidad}" style="width: 100%; margin: 0; border-radius: 8px;">
                    </div>
                    <div>
                        <label style="display:block; margin-bottom: 0.3rem; font-weight: 700; font-size: 0.85rem;">Fecha</label>
                        <input id="swal-uso-fecha" type="date" class="swal2-input" value="${u.fecha}" style="width: 100%; margin: 0; border-radius: 8px;">
                    </div>
                </div>
                <div style="margin-bottom: 0.5rem;">
                    <label style="display:block; margin-bottom: 0.3rem; font-weight: 700; font-size: 0.85rem;">Comentario / Observación</label>
                    <textarea id="swal-uso-comentario" class="swal2-textarea" style="width: 100%; margin: 0; border-radius: 8px; font-family: inherit; height: 60px;">${u.comentario || ''}</textarea>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'var(--primary)',
        preConfirm: () => {
            const item = document.getElementById('swal-uso-item').value;
            const usuario = document.getElementById('swal-uso-usuario').value;
            const cantidad = document.getElementById('swal-uso-cantidad').value;
            const fecha = document.getElementById('swal-uso-fecha').value;
            const comentario = document.getElementById('swal-uso-comentario').value;
            
            if (!item || !usuario || !cantidad || !fecha) {
                Swal.showValidationMessage('Todos los campos excepto comentario son obligatorios');
                return false;
            }
            return { item, usuario, cantidad, fecha, comentario };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            usosData[index].item = result.value.item;
            usosData[index].usuario = result.value.usuario;
            usosData[index].cantidad = parseInt(result.value.cantidad);
            usosData[index].fecha = result.value.fecha;
            usosData[index].comentario = result.value.comentario;
            
            saveData();
            renderAuditoria();
            
            Swal.fire({
                icon: 'success',
                title: 'Registro Actualizado',
                text: 'El registro se ha modificado exitosamente.',
                timer: 1000,
                showConfirmButton: false
            });
        }
    });
};

function renderPlanificacion() {
    const tbody = document.getElementById('planificacion-table-body');
    if (!tbody) return;
    tbody.innerHTML = planificacionData.length ? planificacionData.map((p, index) => `
        <tr>
            <td style="text-align: center;"><strong>${p.item}</strong></td>
            <td style="text-align: center;">${p.usuario}</td>
            <td style="text-align: center;">${p.fecha}</td>
            <td style="text-align: center;">
                <span class="status-badge ${p.completado ? 'status-ok' : 'status-pending'}">
                    ${p.completado ? 'Completado' : 'Pendiente'}
                </span>
            </td>
            <td style="text-align: center;">
                ${!p.completado ? `<button class="btn success-btn" onclick="completarPlanificacion(${index})" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">Marcar Uso</button>` : `<i class="fas fa-check" style="color: var(--success);"></i>`}
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align:center;padding:1rem;">No hay planificaciones registradas</td></tr>';
}

window.completarPlanificacion = (index) => {
    planificacionData[index].completado = true;
    saveData();
    renderPlanificacion();
};

function renderMantenimiento() {
    const tbody = document.getElementById('mantenimiento-table-body');
    if (!tbody) return;
    tbody.innerHTML = mantenimientoData.length ? mantenimientoData.map(m => `
        <tr>
            <td><strong>${m.equipo}</strong></td>
            <td>${m.fecha} - ${m.hora}</td>
            <td><span class="status-badge status-ok">${m.tipo}</span></td>
            <td>${m.obs || '-'}</td>
        </tr>
    `).join('') : '<tr><td colspan="4" style="text-align:center;padding:1rem;">No hay registros de limpieza</td></tr>';
}

function renderEspacios() {
    const tbody = document.getElementById('espacios-table-body');
    if (!tbody) return;

    const searchTerm = document.getElementById('espacios-search')?.value.toLowerCase().trim() || '';

    let filtered = inventoryData.filter(item => {
        if (!searchTerm) return true;
        return (item.name || '').toLowerCase().includes(searchTerm) ||
               (item.locationDetail || '').toLowerCase().includes(searchTerm) ||
               (item.category || '').toLowerCase().includes(searchTerm);
    });

    // Ordenar por Zona (locationDetail) A-Z, luego por Nombre A-Z
    filtered.sort((a, b) => {
        const zoneA = (a.locationDetail || '').trim();
        const zoneB = (b.locationDetail || '').trim();
        if (!zoneA && !zoneB) return (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
        if (!zoneA) return 1;
        if (!zoneB) return -1;
        const cmp = zoneA.localeCompare(zoneB, 'es', { numeric: true, sensitivity: 'base' });
        return cmp !== 0 ? cmp : (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
    });

    tbody.innerHTML = filtered.map((item) => {
        const realIndex = inventoryData.indexOf(item);
        const itemLabs = (item.labs || []).map(labId => {
            const lab = labsData.find(l => l.id === labId);
            return lab ? lab.name : labId;
        }).join(', ');
        return `
        <tr>
            <td><strong>${item.name}</strong><br><small class="text-muted">${item.category}</small></td>
            <td>${itemLabs || 'Sin Asignar'}</td>
            <td><code style="background:rgba(79, 70, 229, 0.12); color:var(--primary); padding:2px 8px; border-radius:4px; font-weight:600;">${item.locationDetail || 'Sin Ubicación'}</code></td>
            <td style="text-align: right;">
                <button class="btn-action edit" onclick="openEspacioModal(${realIndex})" title="Cambiar Ubicación"><i class="fas fa-map-marker-alt"></i></button>
            </td>
        </tr>
        `;
    }).join('');
}

window.openEspacioModal = (index) => {
    const item = inventoryData[index];
    document.getElementById('espacio-item-index').value = index;
    document.getElementById('espacio-item-name').innerText = item.name;
    document.getElementById('espacio-location-detail').value = item.locationDetail || '';
    
    const checkboxes = document.querySelectorAll('input[name="espacio-labs"]');
    checkboxes.forEach(cb => {
        cb.checked = item.labs && item.labs.includes(cb.value);
    });

    document.getElementById('modal-espacio').classList.remove('hidden');
};

// =============================================================================
// UTILIDADES
// =============================================================================
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// =============================================================================
// BIBLIOTECA DE DOCUMENTOS
// =============================================================================
window.renderLibrary = function() {
    const grid = document.getElementById('library-docs-grid');
    if (!grid) return;

    if (!libraryDocsData || libraryDocsData.length === 0) {
        grid.innerHTML = `
            <div class="info-placeholder" style="grid-column: 1 / -1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; background: #fff; border-radius: 16px; border: 1px dashed var(--border);">
                <i class="fas fa-book-open fa-3x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-muted); font-size: 1rem; margin: 0;">No hay documentos en la biblioteca. ¡Sube tu primer PDF!</p>
            </div>
        `;
        return;
    }

    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento', 'Investigador'].includes(session.role);

    const searchInput = document.getElementById('library-search');
    const categorySelect = document.getElementById('library-category-filter');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = categorySelect ? categorySelect.value : 'all';

    let filteredDocs = libraryDocsData;

    if (searchTerm) {
        filteredDocs = filteredDocs.filter(doc => 
            doc.title.toLowerCase().includes(searchTerm) || 
            (doc.desc && doc.desc.toLowerCase().includes(searchTerm)) ||
            doc.fileName.toLowerCase().includes(searchTerm)
        );
    }

    if (selectedCategory && selectedCategory !== 'all') {
        filteredDocs = filteredDocs.filter(doc => doc.category === selectedCategory);
    }

    if (filteredDocs.length === 0) {
        grid.innerHTML = `
            <div class="info-placeholder" style="grid-column: 1 / -1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; background: #fff; border-radius: 16px; border: 1px dashed var(--border);">
                <i class="fas fa-search fa-3x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-muted); font-size: 1rem; margin: 0;">No se encontraron documentos con esos filtros.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredDocs.map((doc) => `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; transition: all 0.3s ease; position: relative; overflow: hidden; border: 1px solid var(--border);">
            <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1rem;">
                <div style="background: #fef2f2; padding: 0.75rem; border-radius: 12px;">
                    <i class="fas fa-file-pdf" style="font-size: 2.5rem; color: #ef4444;"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <h4 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; font-weight: 600; color: var(--text-dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${doc.title}">${doc.title}</h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${doc.fileName}">${doc.fileName}</span>
                </div>
            </div>
            
            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 1.25rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.5rem; line-height: 1.25rem;">
                ${doc.desc || 'Sin descripción disponible.'}
            </p>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border);">
                <div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block;"><i class="fas fa-calendar-alt"></i> ${doc.date}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block;"><i class="fas fa-folder"></i> ${doc.category || 'Sin Categoría'}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" onclick="downloadDocument('${doc.id}')" style="display: flex; align-items: center; justify-content: center; padding: 0.5rem 0.8rem;">
                        <i class="fas fa-download"></i>
                    </button>
                    ${canDelete ? `
                        <button class="btn" onclick="deleteDocument('${doc.id}')" style="background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; padding: 0.5rem 0.8rem; border-radius: 12px; transition: all 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
};

window.downloadDocument = function(id) {
    const doc = libraryDocsData.find(d => d.id === id);
    if (!doc) return;

    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName || `${doc.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.deleteDocument = function(id) {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Administrador General', 'Compra y Abastecimiento', 'Investigador'].includes(session.role);
    if (!canDelete) {
        Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos para eliminar documentos de la biblioteca.'
        });
        return;
    }

    const doc = libraryDocsData.find(d => d.id === id);
    if (!doc) return;

    Swal.fire({
        title: '¿Eliminar Documento?',
        text: `¿Estás seguro de que deseas eliminar "${doc.title}" de la biblioteca?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            libraryDocsData = libraryDocsData.filter(d => d.id !== id);
            saveData();
            renderLibrary();
            Swal.fire({
                icon: 'success',
                title: 'Documento Eliminado',
                text: 'El documento se ha retirado de la biblioteca.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
};

// =============================================================================
// INICIALIZACIÓN — DOMContentLoaded (core)
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {

    // Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const viewId = e.currentTarget.getAttribute('data-view');
            if (viewId) {
                switchView(viewId);
            }
        });
    });

    // Sidebar status
    const footer = document.querySelector('.sidebar-footer');
    if (footer) {
        footer.innerHTML = `<p style="font-size:0.7rem;color:#94a3b8;margin-top:10px;">🟢 SISTEMA RESTABLECIDO</p>`;
    }

    // Iniciar reloj
    updateClock();

    // Lab Modal Logic
    const modalLab = document.getElementById('modal-lab');
    const modalMovement = document.getElementById('modal-movement');
    const modalRequest = document.getElementById('modal-request');
    
    document.getElementById('close-modal-movement')?.addEventListener('click', () => modalMovement.classList.add('hidden'));
    document.getElementById('btn-cancel-mv')?.addEventListener('click', () => modalMovement.classList.add('hidden'));
    document.getElementById('form-movement')?.addEventListener('submit', handleMovement);

    document.getElementById('btn-new-request')?.addEventListener('click', () => {
        const select = document.getElementById('req-item');
        select.innerHTML = inventoryData.map(i => `<option value="${i.name}">${i.name} (${i.stockActual} ${i.unit})</option>`).join('');
        modalRequest.classList.remove('hidden');
    });

    document.getElementById('close-modal-request')?.addEventListener('click', () => modalRequest.classList.add('hidden'));
    document.getElementById('btn-cancel-req')?.addEventListener('click', () => modalRequest.classList.add('hidden'));
    
    document.getElementById('form-new-request')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        btn.disabled = true;

        try {
            const itemName = document.getElementById('req-item').value;
            const qty = parseInt(document.getElementById('req-qty').value);
            const item = inventoryData.find(i => i.name === itemName);

            const newReq = {
                id: `SOL-${Math.floor(1000 + Math.random() * 9000)}`,
                user: storage.get(STORAGE_KEYS.SESSION)?.user || 'Usuario',
                item: itemName,
                qty: `${qty} ${item.unit}`,
                qtyNum: qty,
                date: new Date().toLocaleDateString(),
                status: 'pendiente'
            };

            if (window.dbSync && window.dbSync.saveRequest) {
                await window.dbSync.saveRequest(newReq, true);
            }

            if (window.initApp) {
                await window.initApp();
            }

            if (typeof renderRequests === 'function') renderRequests();
            modalRequest.classList.add('hidden');
            e.target.reset();
            alert('Solicitud enviada con éxito');
        } catch (error) {
            console.error("Error saving request:", error);
            alert("Error al enviar solicitud. Asegúrate de tener RLS desactivado en la tabla 'requests'.");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    const btnNewLab = document.getElementById('btn-new-lab');
    const closeLabBtn = document.getElementById('close-modal-lab');
    const cancelLabBtn = document.getElementById('btn-cancel-lab');
    const formNewLab = document.getElementById('form-new-lab');

    const toggleLabModal = (show) => {
        if (show) modalLab.classList.remove('hidden');
        else modalLab.classList.add('hidden');
    };

    if (btnNewLab) btnNewLab.addEventListener('click', () => toggleLabModal(true));
    if (closeLabBtn) closeLabBtn.addEventListener('click', () => toggleLabModal(false));
    if (cancelLabBtn) cancelLabBtn.addEventListener('click', () => toggleLabModal(false));

    if (formNewLab) {
        formNewLab.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const origText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btn.disabled = true;

            try {
                const newLab = {
                    id: document.getElementById('lab-id').value,
                    name: document.getElementById('lab-name').value,
                    location: document.getElementById('lab-location').value
                };

                // Guardar en Supabase para que sea permanente
                if (window.dbSync && window.dbSync.saveLab) {
                    await window.dbSync.saveLab(newLab, true);
                }

                labsData.push(newLab);
                saveData();
                renderLabs();
                formNewLab.reset();
                toggleLabModal(false);
                alert(`Laboratorio ${newLab.name} registrado con éxito`);
            } catch (err) {
                console.error("Error al guardar laboratorio:", err);
                alert("Error al guardar el laboratorio: " + err.message);
            } finally {
                btn.innerHTML = origText;
                btn.disabled = false;
            }
        });
    }

    // Edit Lab Modal Logic
    const modalEditLab = document.getElementById('modal-edit-lab');
    const closeEditLabBtn = document.getElementById('close-modal-edit-lab');
    const cancelEditLabBtn = document.getElementById('btn-cancel-edit-lab');
    const formEditLab = document.getElementById('form-edit-lab');

    if (closeEditLabBtn) closeEditLabBtn.addEventListener('click', () => modalEditLab.classList.add('hidden'));
    if (cancelEditLabBtn) cancelEditLabBtn.addEventListener('click', () => modalEditLab.classList.add('hidden'));

    if (formEditLab) {
        formEditLab.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const origText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btn.disabled = true;

            try {
                const index = document.getElementById('edit-lab-index').value;

                const updatedLab = {
                    id: document.getElementById('edit-lab-id').value,
                    name: document.getElementById('edit-lab-name').value,
                    location: document.getElementById('edit-lab-location').value
                };

                // Actualizar en Supabase para que sea permanente
                if (window.dbSync && window.dbSync.saveLab) {
                    await window.dbSync.saveLab(updatedLab, false);
                }

                labsData[index] = updatedLab;
                saveData();
                renderLabs();
                modalEditLab.classList.add('hidden');
                alert('Laboratorio actualizado con éxito.');
            } catch (err) {
                console.error("Error al actualizar laboratorio:", err);
                alert("Error al actualizar el laboratorio: " + err.message);
            } finally {
                btn.innerHTML = origText;
                btn.disabled = false;
            }
        });
    }

    // Submenú Institucional
    const btnInstitucional = document.getElementById('btn-institucional');
    const submenuInstitucional = document.getElementById('submenu-institucional');

    if (btnInstitucional) {
        btnInstitucional.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = btnInstitucional.getAttribute('aria-expanded') === 'true';
            btnInstitucional.setAttribute('aria-expanded', !isExpanded);
            if (isExpanded) {
                submenuInstitucional.classList.add('hidden');
            } else {
                submenuInstitucional.classList.remove('hidden');
            }
        });
    }

    // Submenú Inventario
    const btnInventarioMenu = document.getElementById('btn-inventario-menu');
    const submenuInventarioList = document.getElementById('submenu-inventario-list');

    if (btnInventarioMenu) {
        btnInventarioMenu.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = btnInventarioMenu.getAttribute('aria-expanded') === 'true';
            btnInventarioMenu.setAttribute('aria-expanded', !isExpanded);
            if (isExpanded) {
                submenuInventarioList.classList.add('hidden');
            } else {
                submenuInventarioList.classList.remove('hidden');
            }
        });
    }

    // =============================================================================
    // SELECCIÓN Y DISPONIBILIDAD DE EQUIPOS/INSUMOS DESDE EL INVENTARIO
    // =============================================================================
    window.populateInventorySelectors = function() {
        const eqSelectors = [
            document.getElementById('agenda-equipo-select'),
            document.getElementById('agenda-equipo-select-2'),
            document.getElementById('agenda-equipo-select-3')
        ];
        const insSelectors = [
            document.getElementById('agenda-insumos-select'),
            document.getElementById('agenda-insumos-select-2'),
            document.getElementById('agenda-insumos-select-3')
        ];

        if (typeof inventoryData !== 'undefined') {
            const equipos = inventoryData.filter(i => (i.category || '').toLowerCase() === 'equipos' || (i.name || '').toLowerCase().includes('equipo'));
            const sortedEquipos = window.sortInventoryData ? window.sortInventoryData(equipos, 'name-asc') : equipos;

            eqSelectors.forEach(eqSelect => {
                if (!eqSelect) return;
                const currentVal = eqSelect.value;
                eqSelect.innerHTML = '<option value="">— Seleccionar Equipo del Inventario —</option>';
                
                sortedEquipos.forEach(eq => {
                    const loc = eq.locationDetail ? ` (${eq.locationDetail})` : '';
                    const inUseStatus = eq.inUse ? ' [EN USO ACTUALMENTE]' : '';
                    const opt = document.createElement('option');
                    opt.value = eq.name;
                    opt.textContent = `${eq.name}${loc}${inUseStatus}`;
                    eqSelect.appendChild(opt);
                });
                if (currentVal) eqSelect.value = currentVal;
            });

            const insumos = inventoryData.filter(i => (i.category || '').toLowerCase() !== 'equipos');
            const sortedInsumos = window.sortInventoryData ? window.sortInventoryData(insumos, 'name-asc') : insumos;

            insSelectors.forEach(insSelect => {
                if (!insSelect) return;
                insSelect.innerHTML = '<option value="">— Seleccionar Insumo / Reactivo para agregar —</option>';
                sortedInsumos.forEach(ins => {
                    const stock = ins.stockActual !== undefined ? ` [Stock: ${ins.stockActual}]` : '';
                    const loc = ins.locationDetail ? ` (${ins.locationDetail})` : '';
                    const opt = document.createElement('option');
                    opt.value = ins.name;
                    opt.textContent = `${ins.name}${stock}${loc}`;
                    insSelect.appendChild(opt);
                });
            });
        }
    };

    window.checkEquipmentAvailability = function() {
        const statusBox = document.getElementById('equipment-availability-status');
        if (!statusBox) return;

        const eqName = (document.getElementById('agenda-equipo')?.value || '').trim();
        const dateVal = document.getElementById('agenda-fecha')?.value;
        const startVal = document.getElementById('agenda-hora-inicio')?.value;
        const endVal = document.getElementById('agenda-hora-fin')?.value;

        if (!eqName || !dateVal) {
            statusBox.style.display = 'none';
            statusBox.innerHTML = '';
            return;
        }

        let conflicts = [];

        if (typeof agendaTrabajosData !== 'undefined' && Array.isArray(agendaTrabajosData)) {
            agendaTrabajosData.forEach((job, idx) => {
                if (job.fecha === dateVal && job.equipo) {
                    const jobEq = (job.equipo || '').toLowerCase().trim();
                    const searchEq = eqName.toLowerCase().trim();

                    if (jobEq.includes(searchEq) || searchEq.includes(jobEq)) {
                        if (window.currentEditingActivityIndex !== undefined && idx === window.currentEditingActivityIndex) {
                            return;
                        }

                        let overlaps = true;
                        if (startVal && endVal && job.horaInicio && job.horaFin) {
                            overlaps = (startVal < job.horaFin && endVal > job.horaInicio);
                        }
                        
                        if (overlaps) {
                            conflicts.push({
                                title: job.titulo || 'Trabajo agendado',
                                responsable: job.responsable || job.user || 'Usuario',
                                hora: (job.horaInicio && job.horaFin) ? `${job.horaInicio} a ${job.horaFin}` : (job.hora || 'Todo el día')
                            });
                        }
                    }
                }
            });
        }

        if (typeof planificacionData !== 'undefined' && Array.isArray(planificacionData)) {
            planificacionData.forEach(plan => {
                if (plan.fecha === dateVal && plan.item) {
                    const planItem = (plan.item || '').toLowerCase().trim();
                    const searchEq = eqName.toLowerCase().trim();
                    if (planItem.includes(searchEq) || searchEq.includes(planItem)) {
                        conflicts.push({
                            title: `Planificación: ${plan.item}`,
                            responsable: plan.usuario || 'Usuario',
                            hora: 'Reserva de uso'
                        });
                    }
                }
            });
        }

        statusBox.style.display = 'block';

        if (conflicts.length > 0) {
            const conflictDetails = conflicts.map(c => `<b>• ${c.responsable}</b> (${c.hora}) — <i>${c.title}</i>`).join('<br>');
            statusBox.innerHTML = `
                <div class="alert-banner danger" style="padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 0.5rem; background: #fee2e2; border: 1px solid #f87171; color: #991b1b;">
                    <i class="fas fa-exclamation-triangle"></i> <strong>¡ATENCIÓN! Equipo Ya Reservado:</strong><br>
                    El equipo <strong>"${eqName}"</strong> presenta reserva(s) en este horario/fecha:<br>
                    <div style="margin-top: 0.3rem; font-size: 0.85rem; line-height: 1.4;">${conflictDetails}</div>
                </div>
            `;
        } else {
            statusBox.innerHTML = `
                <div class="alert-banner success" style="padding: 0.6rem 1rem; border-radius: 8px; margin-bottom: 0.5rem; background: #dcfce7; border: 1px solid #4ade80; color: #166534;">
                    <i class="fas fa-check-circle"></i> <strong>Equipo Disponible:</strong> El equipo <strong>"${eqName}"</strong> está totalmente libre en la fecha y horario seleccionados.
                </div>
            `;
        }
    };

    // Event listeners para la selección de inventario
    [
        { select: 'agenda-equipo-select', input: 'agenda-equipo' },
        { select: 'agenda-equipo-select-2', input: 'agenda-equipo-2' },
        { select: 'agenda-equipo-select-3', input: 'agenda-equipo-3' }
    ].forEach(item => {
        document.getElementById(item.select)?.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                document.getElementById(item.input).value = val;
            }
            window.checkEquipmentAvailability();
        });
    });

    [
        { select: 'agenda-insumos-select', input: 'agenda-insumos' },
        { select: 'agenda-insumos-select-2', input: 'agenda-insumos-2' },
        { select: 'agenda-insumos-select-3', input: 'agenda-insumos-3' }
    ].forEach(item => {
        document.getElementById(item.select)?.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                const currentText = document.getElementById(item.input).value.trim();
                if (!currentText) {
                    document.getElementById(item.input).value = val;
                } else if (!currentText.includes(val)) {
                    document.getElementById(item.input).value = `${currentText}, ${val}`;
                }
                e.target.value = '';
            }
        });
    });

    ['agenda-fecha', 'agenda-hora-inicio', 'agenda-hora-fin', 'agenda-equipo'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => window.checkEquipmentAvailability());
        document.getElementById(id)?.addEventListener('input', () => window.checkEquipmentAvailability());
    });

    // Lógica para Agendar Trabajo
    const modalAgendar = document.getElementById('modal-agendar');
    const btnNewAgendar = document.getElementById('btn-new-agendar');
    const closeAgendarBtn = document.getElementById('close-modal-agendar');
    const cancelAgendarBtn = document.getElementById('btn-cancel-agendar');
    const formAgendar = document.getElementById('form-agendar');

    const toggleAgendarModal = (show) => {
        if (show) {
            modalAgendar.classList.remove('hidden');
            if (typeof window.populateInventorySelectors === 'function') {
                window.populateInventorySelectors();
            }
            const agendaTypeSelect = document.getElementById('agenda-type');
            if (agendaTypeSelect) {
                agendaTypeSelect.value = 'Trabajo';
                agendaTypeSelect.dispatchEvent(new Event('change'));
            }
            if (typeof window.checkEquipmentAvailability === 'function') {
                window.checkEquipmentAvailability();
            }
        } else {
            window.currentEditingActivityIndex = undefined;
            const btnSubmit = formAgendar.querySelector('button[type="submit"]');
            if (btnSubmit) btnSubmit.textContent = 'Agendar Trabajo';
            formAgendar.reset();
            const statusBox = document.getElementById('equipment-availability-status');
            if (statusBox) statusBox.style.display = 'none';
            modalAgendar.classList.add('hidden');
        }
    };
    if (btnNewAgendar) {
        btnNewAgendar.addEventListener('click', () => {
            try {
                toggleAgendarModal(true);
            } catch(e) {
                console.error("Error en toggleAgendarModal:", e);
                alert("Error al abrir modal: " + e.message);
            }
        });
    }
    if (closeAgendarBtn) closeAgendarBtn.addEventListener('click', () => toggleAgendarModal(false));
    if (cancelAgendarBtn) cancelAgendarBtn.addEventListener('click', () => toggleAgendarModal(false));

    if (formAgendar) {
        formAgendar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            btn.disabled = true;

            try {
                const tipo = document.getElementById('agenda-type').value;
                const titulo = document.getElementById('agenda-titulo').value;
                const fecha = document.getElementById('agenda-fecha').value;
                
                const insumos1 = document.getElementById('agenda-insumos').value;
                const insumos2 = document.getElementById('agenda-insumos-2') ? document.getElementById('agenda-insumos-2').value : '';
                const insumos3 = document.getElementById('agenda-insumos-3') ? document.getElementById('agenda-insumos-3').value : '';
                const insumos = [insumos1, insumos2, insumos3].filter(Boolean).join(' | ');

                const equipo1 = document.getElementById('agenda-equipo').value;
                const equipo2 = document.getElementById('agenda-equipo-2') ? document.getElementById('agenda-equipo-2').value : '';
                const equipo3 = document.getElementById('agenda-equipo-3') ? document.getElementById('agenda-equipo-3').value : '';
                const equipo = [equipo1, equipo2, equipo3].filter(Boolean).join(' | ');
                
                const responsable = document.getElementById('agenda-responsable').value;
                
                const session = storage.get(STORAGE_KEYS.SESSION);

                if (tipo === 'Movimiento') {
                    const mov = {
                        id: `TRX-${Date.now().toString().slice(-6)}`,
                        type: 'Manual',
                        item: titulo,
                        qty: insumos || 'N/A',
                        user: session ? session.user : 'Sistema',
                        target: equipo || 'Ajuste manual',
                        date: fecha,
                        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                    };
                    await window.dbSync.insertMovement(mov);
                } else if (tipo === 'Solicitud') {
                    const req = {
                        id: `SOL-${Date.now().toString().slice(-4)}`,
                        user: session ? (session.user || 'Sistema') : 'Sistema',
                        item: titulo,
                        qty: insumos || 'N/A',
                        date: fecha.split('-').reverse().join('/'),
                        status: 'pendiente'
                    };
                    if (window.dbSync.saveRequest) {
                        await window.dbSync.saveRequest(req, true);
                    } else {
                        // Fallback if saveRequest is slightly differently named in some versions
                        await supabaseClient.from('requests').insert([{
                            id: req.id, user_name: req.user, item: req.item, qty: req.qty, date: req.date, status: req.status
                        }]);
                    }
                } else {
                    const horaInicio = document.getElementById('agenda-hora-inicio').value;
                    const horaFin = document.getElementById('agenda-hora-fin').value;
                    let activityItem = {
                        titulo, fecha, insumos, equipo, responsable, type: 'Trabajo',
                        horaInicio, horaFin,
                        hora: `${horaInicio} - ${horaFin}`
                    };

                    if (window.currentEditingActivityIndex !== undefined) {
                        if (window.currentEditingActivitySource === 'planificacion') {
                            const pData = planificacionData[window.currentEditingActivityIndex];
                            pData.item = titulo;
                            pData.fecha = fecha;
                            await window.dbSync.savePlanificacion(pData);
                        } else {
                            const aData = agendaTrabajosData[window.currentEditingActivityIndex];
                            activityItem.id = aData.id;
                            await window.dbSync.saveAgenda(activityItem);
                        }
                    } else {
                        await window.dbSync.saveAgenda(activityItem, true);
                    }
                }

                // Recargar datos desde Supabase para tener los IDs y datos frescos
                if (window.initApp) {
                    await window.initApp();
                }
                
                modalAgendar.classList.add('hidden');
                
                if (typeof renderAgendaTrabajos === 'function') renderAgendaTrabajos();
                if (typeof renderCalendar === 'function') renderCalendar();
                
                window.currentEditingActivityIndex = undefined;
                window.currentEditingActivitySource = undefined;
                
                const btnSubmit = formAgendar.querySelector('button[type="submit"]');
                if (btnSubmit) btnSubmit.textContent = 'Agendar Trabajo';

                if (document.getElementById('agendar-trabajos-view') && !document.getElementById('agendar-trabajos-view').classList.contains('hidden')) {
                    switchView('agendar-trabajos');
                }
                
                formAgendar.reset();
            } catch (error) {
                console.error("Error al guardar en agenda/planificación:", error);
                alert("Hubo un error al guardar. Si estás en Supabase, revisa que el RLS esté desactivado o que haya políticas activas para esta tabla.");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        const agendaTypeSelect = document.getElementById('agenda-type');
        if (agendaTypeSelect) {
            agendaTypeSelect.addEventListener('change', () => {
                const val = agendaTypeSelect.value;
                const lblTitulo = document.getElementById('label-agenda-titulo');
                const btnSubmit = formAgendar.querySelector('button[type="submit"]');
                const timeRangeContainer = document.getElementById('agenda-time-range-container');
                const startInput = document.getElementById('agenda-hora-inicio');
                const endInput = document.getElementById('agenda-hora-fin');

                if (val === 'Movimiento' || val === 'Solicitud') {
                    lblTitulo.textContent = val === 'Movimiento' ? 'Ítem / Producto' : 'Ítem Solicitado';
                    btnSubmit.textContent = val === 'Movimiento' ? 'Registrar Movimiento' : 'Enviar Solicitud';
                    if (timeRangeContainer) timeRangeContainer.classList.add('hidden');
                    if (startInput) startInput.removeAttribute('required');
                    if (endInput) endInput.removeAttribute('required');
                } else {
                    lblTitulo.textContent = 'Título del Trabajo';
                    btnSubmit.textContent = window.currentEditingActivityIndex !== undefined ? 'Actualizar Actividad' : 'Agendar Trabajo';
                    if (timeRangeContainer) timeRangeContainer.classList.remove('hidden');
                    if (startInput) startInput.setAttribute('required', '');
                    if (endInput) endInput.setAttribute('required', '');
                }
            });
        }
    }

    // Lógica de Mantenimiento y Limpieza
    const modalLimpieza = document.getElementById('modal-limpieza');
    const btnNewLimpieza = document.getElementById('btn-new-limpieza');
    const closeLimpiezaBtn = document.getElementById('close-modal-limpieza');
    const cancelLimpiezaBtn = document.getElementById('btn-cancel-limpieza');
    const formLimpieza = document.getElementById('form-limpieza');

    if (btnNewLimpieza) btnNewLimpieza.addEventListener('click', () => modalLimpieza.classList.remove('hidden'));
    if (closeLimpiezaBtn) closeLimpiezaBtn.addEventListener('click', () => modalLimpieza.classList.add('hidden'));
    if (cancelLimpiezaBtn) cancelLimpiezaBtn.addEventListener('click', () => modalLimpieza.classList.add('hidden'));

    if (formLimpieza) {
        formLimpieza.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]') || e.target.querySelector('.btn-primary');
            const originalText = btn ? btn.innerHTML : 'Guardar';
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                btn.disabled = true;
            }

            try {
                const record = {
                    equipo: document.getElementById('limpieza-equipo').value,
                    fecha: document.getElementById('limpieza-fecha').value,
                    hora: document.getElementById('limpieza-hora').value,
                    tipo: document.getElementById('limpieza-tipo').value,
                    obs: document.getElementById('limpieza-obs').value
                };

                if (window.dbSync && window.dbSync.insertMantenimiento) {
                    await window.dbSync.insertMantenimiento(record);
                }

                if (window.initApp) {
                    await window.initApp();
                }

                if (typeof renderMantenimiento === 'function') renderMantenimiento();
                modalLimpieza.classList.add('hidden');
                formLimpieza.reset();
                alert('Registro de limpieza guardado con éxito.');
            } catch (error) {
                console.error("Error saving limpieza:", error);
                alert("Error al guardar el registro. Asegúrate de tener RLS desactivado en la tabla 'mantenimiento'.");
            } finally {
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }
        });
    }

    // Lógica para Guardar Espacio/Ubicación
    const modalEspacio = document.getElementById('modal-espacio');
    const closeEspacioBtn = document.getElementById('close-modal-espacio');
    const cancelEspacioBtn = document.getElementById('btn-cancel-espacio');
    const formEspacio = document.getElementById('form-espacio');

    if (closeEspacioBtn) closeEspacioBtn.addEventListener('click', () => modalEspacio.classList.add('hidden'));
    if (cancelEspacioBtn) cancelEspacioBtn.addEventListener('click', () => modalEspacio.classList.add('hidden'));

    if (formEspacio) {
        formEspacio.addEventListener('submit', (e) => {
            e.preventDefault();
            const index = document.getElementById('espacio-item-index').value;
            const newLocation = document.getElementById('espacio-location-detail').value;
            const selectedLabs = Array.from(document.querySelectorAll('input[name="espacio-labs"]:checked')).map(cb => cb.value);
            
            inventoryData[index].locationDetail = newLocation;
            inventoryData[index].labs = selectedLabs;
            
            saveData();
            renderEspacios();
            renderInventory();
            modalEspacio.classList.add('hidden');
            alert('Ubicación del insumo actualizada con éxito.');
        });
    }

    // Lógica de Orden y Aseo
    const modalTurno = document.getElementById('modal-turno');
    const btnNewTurno = document.getElementById('btn-new-turno');
    const closeTurnoBtn = document.getElementById('close-modal-turno');
    const cancelTurnoBtn = document.getElementById('btn-cancel-turno');
    const formTurno = document.getElementById('form-turno');

    const toggleTurnoModal = (show) => {
        if (show) modalTurno.classList.remove('hidden');
        else modalTurno.classList.add('hidden');
    };

    if (btnNewTurno) {
        btnNewTurno.addEventListener('click', () => {
            const editIdx = document.getElementById('edit-turno-index');
            if (editIdx) editIdx.value = '';
            const titleEl = document.getElementById('modal-turno-title');
            if (titleEl) titleEl.innerText = 'Asignar Responsable';
            if (formTurno) formTurno.reset();
            toggleTurnoModal(true);
        });
    }
    if (closeTurnoBtn) closeTurnoBtn.addEventListener('click', () => toggleTurnoModal(false));
    if (cancelTurnoBtn) cancelTurnoBtn.addEventListener('click', () => toggleTurnoModal(false));

    if (formTurno) {
        formTurno.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btn.disabled = true;

            try {
                const editIndexVal = document.getElementById('edit-turno-index')?.value;
                const isEditing = editIndexVal !== '' && editIndexVal !== null && editIndexVal !== undefined;

                const record = {
                    laboratorio: document.getElementById('turno-lab').value,
                    jefe: document.getElementById('turno-jefe').value,
                    semana: document.getElementById('turno-semana').value,
                    mes: document.getElementById('turno-mes').value
                };
                
                if (isEditing) {
                    const idx = parseInt(editIndexVal, 10);
                    const existing = turnosData[idx];
                    const updated = { ...existing, ...record };
                    if (window.dbSync && window.dbSync.updateTurno) {
                        await window.dbSync.updateTurno(updated);
                    }
                    turnosData[idx] = updated;
                } else {
                    if (window.dbSync && window.dbSync.insertTurno) {
                        await window.dbSync.insertTurno(record);
                    }
                    if (window.initApp) {
                        await window.initApp();
                    } else {
                        turnosData.push(record);
                    }
                }
                
                saveData();
                if (typeof renderTurnos === 'function') renderTurnos();
                toggleTurnoModal(false);
                formTurno.reset();

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: isEditing ? 'Registro Actualizado' : 'Responsable Asignado',
                        timer: 1200,
                        showConfirmButton: false
                    });
                } else {
                    alert(isEditing ? 'Registro actualizado exitosamente.' : 'Responsable registrado exitosamente.');
                }
            } catch (error) {
                console.error("Error al guardar turno:", error);
                alert("Hubo un error al guardar.");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Lógica para Checkeo de Usos (Auditoría)
    const modalUso = document.getElementById('modal-uso');
    const btnNewUso = document.getElementById('btn-new-uso');
    const closeUsoBtn = document.getElementById('close-modal-uso');
    const cancelUsoBtn = document.getElementById('btn-cancel-uso');
    const formUso = document.getElementById('form-uso');

    const toggleUsoModal = (show) => {
        if (show) modalUso.classList.remove('hidden');
        else modalUso.classList.add('hidden');
    };

    if (btnNewUso) btnNewUso.addEventListener('click', () => toggleUsoModal(true));
    if (closeUsoBtn) closeUsoBtn.addEventListener('click', () => toggleUsoModal(false));
    if (cancelUsoBtn) cancelUsoBtn.addEventListener('click', () => toggleUsoModal(false));

    if (formUso) {
        formUso.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btn.disabled = true;

            try {
                const record = {
                    item: document.getElementById('uso-item').value,
                    usuario: document.getElementById('uso-usuario').value,
                    cantidad: document.getElementById('uso-cantidad').value,
                    fecha: document.getElementById('uso-fecha').value,
                    comentario: document.getElementById('uso-comentario').value,
                    checked: false
                };
                
                await window.dbSync.saveAuditoria(record, true);
                
                if (window.initApp) {
                    await window.initApp();
                }
                
                if (typeof renderAuditoria === 'function') renderAuditoria();
                toggleUsoModal(false);
                formUso.reset();
            } catch (error) {
                console.error("Error al guardar auditoria:", error);
                alert("Hubo un error al guardar. Asegúrate de tener el id autoincrementable y RLS desactivado para la tabla 'auditoria' en Supabase.");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Lógica para Planificación
    const modalPlanificacion = document.getElementById('modal-planificacion');
    const btnNewPlanificacion = document.getElementById('btn-new-planificacion');
    const closePlanificacionBtn = document.getElementById('close-modal-planificacion');
    const cancelPlanificacionBtn = document.getElementById('btn-cancel-planificacion');
    const formPlanificacion = document.getElementById('form-planificacion');

    const togglePlanificacionModal = (show) => {
        if (show) modalPlanificacion.classList.remove('hidden');
        else modalPlanificacion.classList.add('hidden');
    };

    if (btnNewPlanificacion) btnNewPlanificacion.addEventListener('click', () => togglePlanificacionModal(true));
    if (closePlanificacionBtn) closePlanificacionBtn.addEventListener('click', () => togglePlanificacionBtn(false));
    if (cancelPlanificacionBtn) cancelPlanificacionBtn.addEventListener('click', () => togglePlanificacionBtn(false));

    if (formPlanificacion) {
        formPlanificacion.addEventListener('submit', (e) => {
            e.preventDefault();
            const record = {
                item: document.getElementById('plan-item').value,
                usuario: document.getElementById('plan-usuario').value,
                fecha: document.getElementById('plan-fecha').value,
                completado: false
            };
            planificacionData.push(record);
            saveData();
            if (typeof renderPlanificacion === 'function') renderPlanificacion();
            renderAgendaTrabajos();
            renderCalendar();
            togglePlanificacionModal(false);
            formPlanificacion.reset();
            
            Swal.fire({
                icon: 'success',
                title: 'Planificación Registrada',
                text: 'La reserva de uso se ha guardado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    // Al iniciar, poblar checkbox de espacios
    const updateEspacioLabs = () => {
        const container = document.getElementById('espacio-labs-selection');
        if (container) {
            container.innerHTML = labsData.map(lab => `
                <label class="checkbox-item"><input type="checkbox" name="espacio-labs" value="${lab.id}"> ${lab.name}</label>
            `).join('');
        }
    };
    updateEspacioLabs();
    
    const oldUpdateLabSelections = window.updateLabSelections || updateLabSelections;
    window.updateLabSelections = function() {
        if(typeof oldUpdateLabSelections === 'function') oldUpdateLabSelections();
        updateEspacioLabs();
    };

    // Limpiar Agenda
    const clearAgendaBtn = document.getElementById('btn-clear-agenda');
    if (clearAgendaBtn) {
        clearAgendaBtn.addEventListener('click', () => {
            Swal.fire({
                title: '¿Eliminar todas las actividades?',
                text: 'Esta acción borrará todos los trabajos, planificaciones, movimientos y solicitudes de este panel. ¡No podrás revertir esto!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#4f46e5',
                confirmButtonText: 'Sí, eliminar todo',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    agendaTrabajosData = [];
                    planificacionData = [];
                    movementsData = [];
                    requestsData = [];
                    saveData();
                    if (typeof renderAgendaTrabajos === 'function') renderAgendaTrabajos();
                    if (typeof renderCalendar === 'function') renderCalendar();
                    if (typeof renderMovements === 'function') renderMovements();
                    if (typeof renderRequests === 'function') renderRequests();
                    if (typeof renderDashboard === 'function') renderDashboard();
                    Swal.fire({
                        icon: 'success',
                        title: 'Actividades Eliminadas',
                        text: 'Se han eliminado todos los registros y actividades.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
        });
    }

    // Renderizado inicial
    renderInventory();
    renderUsers();
    renderMovements();
    renderDashboard();
    renderAgendaTrabajos();
    renderLabs();

    // Listeners para modal de detalles de día
    const modalDay = document.getElementById('modal-calendar-day');
    const closeDayBtn = document.getElementById('close-modal-calendar-day');
    const cancelDayBtn = document.getElementById('btn-close-day-details');
    
    if (closeDayBtn) closeDayBtn.addEventListener('click', () => modalDay.classList.add('hidden'));
    if (cancelDayBtn) cancelDayBtn.addEventListener('click', () => modalDay.classList.add('hidden'));

    // Lógica para Biblioteca (PDF)
    const modalDoc = document.getElementById('modal-doc');
    const btnNewDoc = document.getElementById('btn-new-doc');
    const closeDocBtn = document.getElementById('close-modal-doc');
    const cancelDocBtn = document.getElementById('btn-cancel-doc');
    const formDoc = document.getElementById('form-new-doc');

    const toggleDocModal = (show) => {
        if (show) modalDoc.classList.remove('hidden');
        else {
            modalDoc.classList.add('hidden');
            if (formDoc) formDoc.reset();
        }
    };

    if (btnNewDoc) btnNewDoc.addEventListener('click', () => toggleDocModal(true));
    if (closeDocBtn) closeDocBtn.addEventListener('click', () => toggleDocModal(false));
    if (cancelDocBtn) cancelDocBtn.addEventListener('click', () => toggleDocModal(false));

    if (formDoc) {
        formDoc.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('doc-title').value.trim();
            const desc = document.getElementById('doc-desc').value.trim();
            const category = document.getElementById('doc-category').value;
            const fileInput = document.getElementById('doc-file');
            
            if (!fileInput.files || fileInput.files.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Archivo Requerido',
                    text: 'Por favor, selecciona un archivo PDF.'
                });
                return;
            }

            const file = fileInput.files[0];
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Formato Incorrecto',
                    text: 'Solo se permiten archivos en formato PDF.'
                });
                return;
            }

            if (file.size > 1.5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'Archivo Demasiado Grande',
                    text: 'El límite máximo de tamaño de archivo es de 1.5 MB para asegurar el rendimiento local.'
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = async function(evt) {
                const base64Data = evt.target.result;
                const session = storage.get(STORAGE_KEYS.SESSION);
                const uploader = session ? session.user : 'Sistema';
                
                const newDoc = {
                    id: `DOC-${Date.now().toString().slice(-6)}`,
                    title: title,
                    desc: desc,
                    category: category,
                    fileName: file.name,
                    fileData: base64Data,
                    date: new Date().toLocaleDateString('es-ES'),
                    size: formatBytes(file.size),
                    user: uploader
                };

                try {
                    // Si dbSync.insertLibraryDoc existe, lo usamos
                    if (window.dbSync && window.dbSync.insertLibraryDoc) {
                        await window.dbSync.insertLibraryDoc(newDoc);
                    }
                    
                    // Recargar datos desde Supabase
                    if (window.initApp) {
                        await window.initApp();
                    }
                    
                    if (typeof renderLibrary === 'function') renderLibrary();
                    toggleDocModal(false);

                    Swal.fire({
                        icon: 'success',
                        title: 'Documento Guardado',
                        text: 'El PDF se ha subido correctamente a la base de datos.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error("Error al guardar el documento:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de Guardado',
                        text: 'Hubo un problema al guardar en la base de datos. Verifica el RLS de la tabla library_docs.'
                    });
                }
            };
            reader.onerror = function() {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Lectura',
                    text: 'No se pudo leer el archivo seleccionado.'
                });
            };
            reader.readAsDataURL(file);
        });
    }

    // Add event listeners for library filters
    const librarySearch = document.getElementById('library-search');
    if (librarySearch) {
        librarySearch.addEventListener('input', () => {
            if (typeof renderLibrary === 'function') renderLibrary();
        });
    }

    const libraryCategoryFilter = document.getElementById('library-category-filter');
    if (libraryCategoryFilter) {
        libraryCategoryFilter.addEventListener('change', () => {
            if (typeof renderLibrary === 'function') renderLibrary();
        });
    }
});

// =============================================================================
// CONFIRMACIÓN TÉRMINO DE TRABAJOS (AUDITORIA / CHECKEO GENERAL)
// =============================================================================
window.confirmarTerminoTrabajo = async function() {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const user = session ? session.user : null;
    if (!user) {
        Swal.fire({
            icon: 'warning',
            title: 'Acceso Denegado',
            text: 'Inicie sesión para poder confirmar su término de trabajo.'
        });
        return;
    }
    window.confirmarTerminoUsuario(user);
};

window.confirmarTerminoUsuario = async function(userName) {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const currentUser = session ? session.user : '';
    const userRole = session ? session.role : '';
    const isAdmin = ['Administrador', 'Administrador General'].includes(userRole);
    
    if (currentUser !== userName && !isAdmin) {
        Swal.fire({
            icon: 'warning',
            title: 'Acceso Denegado',
            text: 'Solo puedes confirmar tu propio término de trabajo o ser Administrador.',
            confirmButtonColor: '#3085d6'
        });
        return;
    }
    
    Swal.fire({
        title: `¿Confirmar Término para ${userName}?`,
        text: 'Esto registrará en el sistema que ha finalizado los trabajos y revisión de Insumos/Reactivos/Equipos.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'var(--primary)'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const now = new Date();
            const mov = {
                id: `TRX-${Date.now().toString().slice(-6)}`,
                type: 'Término de Trabajo',
                item: 'Checkeo General Completado',
                qty: '-',
                user: userName,
                target: 'Cierre de Trabajos (Insumos/Reactivos/Equipos)',
                date: now.toISOString().split('T')[0],
                time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            };

            try {
                if (window.dbSync && window.dbSync.insertMovement) {
                    await window.dbSync.insertMovement(mov);
                }
                if (movementsData) movementsData.push(mov);
                saveData();
                if (typeof renderDashboard === 'function') renderDashboard();
                if (typeof renderMovements === 'function') renderMovements();
                if (typeof renderAuditoria === 'function') renderAuditoria();

                Swal.fire({
                    icon: 'success',
                    title: 'Trabajo Finalizado',
                    text: `El término de trabajo para ${userName} ha sido registrado.`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Error al registrar término:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo guardar en la base de datos.'
                });
            }
        }
    });
};
