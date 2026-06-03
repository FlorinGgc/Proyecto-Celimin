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

const initialLabs = [
    { id: 'L1', name: 'Lab 1', location: 'Piso 1 - Ala Norte' },
    { id: 'L2', name: 'Lab 2', location: 'Piso 1 - Ala Sur' },
    { id: 'L3', name: 'Lab 3', location: 'Piso 2 - Central' }
];

// Datos iniciales
const initialInventory = [
    { code: 'INS-001', name: 'Alcohol Isopropílico', category: 'Reactivos', stockActual: 50, stockMin: 10, unit: 'L', locationDetail: 'Estante A1', expiryDate: '2026-12-31', format: 'Botella 1L', state: 'Nuevo', reactDate: '2026-01-15', comments: 'Pureza 99%', supplier: 'Química Norte', responsible: 'Dr. Alejandro Ruiz', status: 'ok', labs: ['L1', 'L2'] },
    { code: 'EQU-045', name: 'Microscopio Binocular', category: 'Equipos', stockActual: 5, stockMin: 1, unit: 'Unid', locationDetail: 'Mesón 4', expiryDate: '', format: 'N/A', state: 'N/A', supplier: 'Zeiss Chile', responsible: 'Lic. María García', status: 'ok', labs: ['L1'], inUse: false },
    { code: 'INS-012', name: 'Guantes de Nitrilo', category: 'Consumibles', stockActual: 2, stockMin: 5, unit: 'Cajas', locationDetail: 'Bodega Central', expiryDate: '2027-05-15', format: 'Caja 100u', state: 'N/A', supplier: 'MedSupply', responsible: 'Ing. Carlos Pérez', status: 'low', labs: ['L1', 'L2', 'L3'] },
    { code: 'INS-089', name: 'Tubos de Ensayo 10ml', category: 'Vidriería', stockActual: 0, stockMin: 20, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Pack 50u', state: 'N/A', supplier: 'LabTools', responsible: 'Lic. María García', status: 'out', labs: ['L3'] },
    { code: 'EQU-099', name: 'Espectrómetro', category: 'Equipos', stockActual: 1, stockMin: 1, unit: 'Unid', locationDetail: 'Lab 2 - Central', expiryDate: '', format: 'N/A', state: 'N/A', supplier: 'Agilent', responsible: 'Dr. Alejandro Ruiz', status: 'ok', labs: ['L2'], inUse: true },
    { code: 'R1930', name: 'Papel filtro circular, caja 100 unid.grado 101F, diam disco 12,5 cm, equivale a Whatman 40 y a MFS 5B, cuantitativo, sin ceniza, media-lenta (fat free) -- equivale a R1010FX', category: 'Consumibles', stockActual: 10, stockMin: 2, unit: 'Cajas', locationDetail: 'Estante A1', expiryDate: '', format: 'Caja 100u', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'OTT-000287', name: 'Vaso forma alta graduado sin vertedero 400 ml Duran', category: 'Vidriería', stockActual: 15, stockMin: 3, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'V7550', name: 'Vaso pp, alto, grad., 250 ml', category: 'Vidriería', stockActual: 20, stockMin: 5, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'V7560', name: 'Vaso pp, alto, grad., 400 ml', category: 'Vidriería', stockActual: 20, stockMin: 5, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'V7570', name: 'Vaso pp, alto, grad., 600 ml', category: 'Vidriería', stockActual: 15, stockMin: 5, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'M3586', name: 'Guantes Nitrilo S, 100 un. SIN POLVO', category: 'Consumibles', stockActual: 25, stockMin: 5, unit: 'Cajas', locationDetail: 'Bodega Central', expiryDate: '', format: 'Caja 100u', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1', 'L2', 'L3'] },
    { code: 'R0710', name: 'Papel Indicador Universal, pH 1-14, rollo, 1 indicador', category: 'Consumibles', stockActual: 10, stockMin: 2, unit: 'Rollos', locationDetail: 'Estante A1', expiryDate: '', format: 'Rollo', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'M3120', name: 'kG. Algodón Hidrófilo prensado buclo', category: 'Consumibles', stockActual: 5, stockMin: 1, unit: 'Kg', locationDetail: 'Bodega Central', expiryDate: '', format: 'Paquete 1Kg', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'R1040', name: 'Papel filtro circular, caja 100 unid. 292, diam disco 12,5 cm, equivale a Whatman 1 y a MFS 2, Cualitativo, bajo en ceniza, media-rapida', category: 'Consumibles', stockActual: 8, stockMin: 2, unit: 'Cajas', locationDetail: 'Estante A1', expiryDate: '', format: 'Caja 100u', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'R1043', name: 'Papel filtro circular, caja 100 unid. 292, diam disco 9,0 cm, equivale a Whatman 1. MFS 2, Cualitativo, bajo en ceniza, media-rapida', category: 'Consumibles', stockActual: 8, stockMin: 2, unit: 'Cajas', locationDetail: 'Estante A1', expiryDate: '', format: 'Caja 100u', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'R1045', name: 'Papel filtro circular, caja 100 unid. 292, diam disco 11,0 cm, equivale a Whatman 1 y a MFS 2, Cualitativo, bajo en ceniza, media-rapida', category: 'Consumibles', stockActual: 8, stockMin: 2, unit: 'Cajas', locationDetail: 'Estante A1', expiryDate: '', format: 'Caja 100u', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'R1005', name: 'Papel filtro circular, caja 100 unid. 389F, diam disco 9,0 cm, equivale a Whatman 40 y a MFS 5B, cuantitativo, sin ceniza, media-lenta (fat free)', category: 'Consumibles', stockActual: 12, stockMin: 2, unit: 'Cajas', locationDetail: 'Estante A1', expiryDate: '', format: 'Caja 100u', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'R1007', name: 'Papel filtro circular, caja 100 unid. 389F, diam disco 11,0 cm, equivale a Whatman 40 y a MFS 5B, cuantitativo, sin ceniza, media-lenta (fat free)', category: 'Consumibles', stockActual: 12, stockMin: 2, unit: 'Cajas', locationDetail: 'Estante A1', expiryDate: '', format: 'Caja 100u', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'V7380', name: 'Vaso pp, bajo, grad., 100 ml', category: 'Vidriería', stockActual: 25, stockMin: 5, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'V7400', name: 'Vaso pp, bajo, grad., 250 ml', category: 'Vidriería', stockActual: 20, stockMin: 5, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'V7410', name: 'Vaso pp, bajo, grad., 400 ml', category: 'Vidriería', stockActual: 20, stockMin: 5, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'V7420', name: 'Vaso pp, bajo, grad., 600 ml', category: 'Vidriería', stockActual: 15, stockMin: 5, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'V7440', name: 'Vaso pp, bajo, grad., 1000 ml', category: 'Vidriería', stockActual: 10, stockMin: 2, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'V7450', name: 'Vaso pp, bajo, grad., 2000 ml', category: 'Vidriería', stockActual: 10, stockMin: 2, unit: 'Unid', locationDetail: 'Gabinete G2', expiryDate: '', format: 'Unid', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'CV-102', name: 'Flete Transporte al cliente', category: 'Otros', stockActual: 1, stockMin: 0, unit: 'Servicio', locationDetail: 'N/A', expiryDate: '', format: 'Servicio', state: 'N/A', supplier: 'Proveedor General', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'REA-101', name: 'CLORURO DE LITIO', category: 'Reactivos', stockActual: 10, stockMin: 2, unit: 'g', locationDetail: 'Estante A1', expiryDate: '2028-12-31', format: 'Frasco 500g', state: 'Nuevo', reactDate: '2026-06-01', comments: 'Proyecto Igualdad en CYT en la Universidad de Antofagasta Codigo INGE210023 / In', supplier: 'Universidad de Antofagasta', responsible: 'crojas', status: 'ok', labs: ['L1'] },
    { code: 'REA-102', name: 'HYDROCHLORIC ACID, 37%, A.C.S. REAGENT', category: 'Reactivos', stockActual: 5, stockMin: 1, unit: 'L', locationDetail: 'Estante A1', expiryDate: '2027-06-30', format: 'Botella 1L', state: 'Nuevo', reactDate: '2026-06-01', comments: 'Flete y otros cargos. Proyecto Igualdad en CYT en la Universidad de Antofagasta Codigo INGE210023 / In', supplier: 'Universidad de Antofagasta', responsible: 'crojas', status: 'ok', labs: ['L1'] }
];

const initialUsers = [
    { name: 'aegonzalez', role: 'Administrador General', lastAccess: 'Hace 5 min', permissions: 'Full Access', active: true },
    { name: 'crojas', role: 'Encargada de Inventario', lastAccess: 'Ayer', permissions: 'Lectura/Escritura', active: true },
    { name: 'mfernandez', role: 'Supervisor de Laboratorio', lastAccess: 'Hoy', permissions: 'Supervisión', active: true },
    { name: 'jmorales', role: 'Técnico en Laboratorio', lastAccess: 'Hoy', permissions: 'Ingreso/Salida', active: true },
    { name: 'rvega', role: 'Técnico de Apoyo', lastAccess: 'Hoy', permissions: 'Ingreso/Salida', active: true },
    { name: 'pherrera', role: 'Investigadora', lastAccess: 'Hoy', permissions: 'Solicitudes', active: true },
    { name: 'scortes', role: 'Docente', lastAccess: 'Hoy', permissions: 'Solicitudes', active: true },
    { name: 'vsoto', role: 'Tesista', lastAccess: 'Hoy', permissions: 'Estudiante', active: true },
    { name: 'daraya', role: 'Ayudante', lastAccess: 'Hoy', permissions: 'Estudiante', active: true },
    { name: 'amunoz', role: 'Compras y Abastecimiento', lastAccess: 'Hoy', permissions: 'Compras', active: true }
];

// Verificación de primera ejecución para no sobreescribir borrados con muestras
const isFirstRun = !localStorage.getItem('celimin_initialized_v1');

let labsData = storage.get('celimin_labs_v2', initialLabs);
let inventoryData = storage.get(STORAGE_KEYS.INVENTORY, initialInventory);

// Asegurar la inyección de los nuevos registros si ya existe persistencia previa
let updatedInventory = false;
initialInventory.forEach(newItem => {
    if (!inventoryData.some(item => item.code === newItem.code)) {
        inventoryData.push(newItem);
        updatedInventory = true;
    }
});
if (updatedInventory) {
    storage.set(STORAGE_KEYS.INVENTORY, inventoryData);
}

let usersData = storage.get(STORAGE_KEYS.USERS, initialUsers);

let movementsData = storage.get(STORAGE_KEYS.MOVEMENTS, []);
if (isFirstRun && movementsData.length === 0) {
    movementsData = [
        { id: 'TRX-123456', type: 'Ingreso', item: 'Alcohol Isopropílico', qty: '10 L', user: 'crojas', target: 'Abastecimiento Mensual', date: '2026-05-14', time: '10:30' },
        { id: 'TRX-789012', type: 'Salida', item: 'Guantes de Nitrilo', qty: '1 Cajas', user: 'jmorales', target: 'Laboratorio 1', date: '2026-05-15', time: '09:15' }
    ];
}

let requestsData = storage.get('celimin_requests_v2', []);
if (isFirstRun && requestsData.length === 0) {
    requestsData = [
        { id: 'SOL-5566', user: 'pherrera', item: 'Tubos de Ensayo 10ml', qty: '10 Unid', date: '15/05/2026', status: 'pendiente' },
        { id: 'SOL-7788', user: 'scortes', item: 'Alcohol Isopropílico', qty: '2 L', date: '14/05/2026', status: 'aprobada' }
    ];
}

function saveData() {
    storage.set('celimin_labs_v2', labsData);
    storage.set(STORAGE_KEYS.INVENTORY, inventoryData);
    storage.set(STORAGE_KEYS.USERS, usersData);
    storage.set(STORAGE_KEYS.MOVEMENTS, movementsData);
    storage.set('celimin_requests_v2', requestsData);
    storage.set('celimin_mantenimiento_v1', mantenimientoData);
    storage.set('celimin_agenda_trabajos_v1', agendaTrabajosData);
    storage.set('celimin_turnos_v1', turnosData);
    storage.set('celimin_usos_v1', usosData);
    storage.set('celimin_planificacion_v1', planificacionData);
    storage.set('celimin_library_docs_v1', libraryDocsData);

    // Auto-update dashboard and equipment panels when data changes
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderEquipmentStatus === 'function') renderEquipmentStatus();
}

let agendaTrabajosData = storage.get('celimin_agenda_trabajos_v1', []);
if (isFirstRun && agendaTrabajosData.length === 0) {
    agendaTrabajosData = [
        { titulo: 'Análisis de Sedimentos', fecha: '2026-05-20', insumos: 'Ácido Sulfúrico, Agua Destilada', equipo: 'Espectrómetro', responsable: 'Dr. Alejandro Ruiz', type: 'Trabajo', horaInicio: '08:00', horaFin: '12:00', hora: '08:00 - 12:00' },
        { titulo: 'Mantenimiento de Microscopios', fecha: '2026-05-22', insumos: 'Kit de Limpieza Óptica', equipo: 'Microscopio Binocular', responsable: 'Lic. María García', type: 'Trabajo', horaInicio: '10:00', horaFin: '13:00', hora: '10:00 - 13:00' }
    ];
}

let mantenimientoData = storage.get('celimin_mantenimiento_v1', []);
let turnosData = storage.get('celimin_turnos_v1', []);
let usosData = storage.get('celimin_usos_v1', []);
let planificacionData = storage.get('celimin_planificacion_v1', []);
let libraryDocsData = storage.get('celimin_library_docs_v1', []);

if (isFirstRun) {
    localStorage.setItem('celimin_initialized_v1', 'true');
    saveData();
}

// Navegación
function switchView(viewId) {
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

// RELOJ EN VIVO
function updateClock() {
    const clockDate = document.getElementById('clock-date');
    const clockTime = document.getElementById('clock-time');
    if (!clockDate || !clockTime) return;

    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    clockDate.innerText = now.toLocaleDateString('es-ES', options);
    clockTime.innerText = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

setInterval(updateClock, 1000); // Actualizar cada segundo

// GENERADOR DE CALENDARIO
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
        
        // Cabecera de días
        ['D', 'L', 'M', 'M', 'J', 'V', 'S'].forEach(d => {
            html += `<div class="day-name">${d}</div>`;
        });
 
        const firstDay = new Date(year, index, 1).getDay();
        const daysInMonth = new Date(year, index + 1, 0).getDate();
 
        // Espacios vacíos antes del primer día
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="day-number empty"></div>';
        }
 
        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${(index + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const isToday = now.getFullYear() === year && now.getMonth() === index && now.getDate() === day;
            
            // Buscar eventos para este día
            const dayEvents = [];
            agendaTrabajosData.forEach(t => { 
                if(t.fecha === dateStr) {
                    const timeStr = t.hora ? ` (${t.hora})` : '';
                    dayEvents.push({ type: 'work', title: `${t.titulo}${timeStr}` }); 
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

function renderLabs() {
    const tbody = document.getElementById('labs-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canModify = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
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

    // Actualizar selectores de labs en otros modales y filtros
    updateLabSelections();

    // Actualizar tablas que dependen de los nombres/datos de laboratorios
    if (typeof renderInventoryTable === 'function') renderInventoryTable();
    if (typeof renderEspacios === 'function') renderEspacios();
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
    const canDelete = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
    if (!canDelete) {
        alert('No tiene permisos para eliminar.');
        return;
    }
    if (confirm(`¿Eliminar el laboratorio "${labsData[index].name}"?`)) {
        labsData.splice(index, 1);
        saveData();
        renderLabs();
    }
}

function updateLabSelections() {
    // 1. Actualizar Checkboxes en Modales
    const containers = [
        document.getElementById('item-labs-selection'),
        document.getElementById('edit-item-labs-selection')
    ];

    containers.forEach(container => {
        if (!container) return;
        const isEdit = container.id.includes('edit');
        const name = isEdit ? 'edit-labs' : 'labs';
        
        container.innerHTML = labsData.map(lab => `
            <label class="checkbox-item"><input type="checkbox" name="${name}" value="${lab.id}"> ${lab.name}</label>
        `).join('');
    });

    // 2. Actualizar Dropdown de Filtro en Inventario
    const filterSelect = document.getElementById('lab-filter');
    if (filterSelect) {
        const currentValue = filterSelect.value;
        filterSelect.innerHTML = '<option value="all">Todos los Laboratorios</option>' + 
            labsData.map(lab => `<option value="${lab.id}">${lab.name} (${lab.location})</option>`).join('');
        
        // Mantener la selección previa si aún existe
        if ([...filterSelect.options].some(opt => opt.value === currentValue)) {
            filterSelect.value = currentValue;
        }
    }
}

// BÚSQUEDA Y FILTRADO
function applyFilters() {
    const searchTerm = document.getElementById('inventory-search')?.value.toLowerCase() || '';
    const labFilter = document.getElementById('lab-filter')?.value || 'all';

    const filtered = inventoryData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                             item.category.toLowerCase().includes(searchTerm) ||
                             item.code.toLowerCase().includes(searchTerm);
        
        const matchesLab = labFilter === 'all' || (item.labs && item.labs.includes(labFilter));
        
        return matchesSearch && matchesLab;
    });

    renderInventory(filtered);
}

document.getElementById('inventory-search')?.addEventListener('input', applyFilters);
document.getElementById('lab-filter')?.addEventListener('change', applyFilters);
// OPERACIONES DE STOCK
window.openMovementModal = (index, type) => {
    const item = inventoryData[index];
    document.getElementById('mv-item-index').value = index;
    document.getElementById('mv-type').value = type;
    document.getElementById('mv-item-name').innerText = item.name;
    document.getElementById('mv-type-label').innerText = type.toLowerCase();
    document.getElementById('movement-modal-title').innerText = `Registrar ${type}`;
    document.getElementById('modal-movement').classList.remove('hidden');
};

function handleMovement(e) {
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

    if (type === 'Ingreso') item.stockActual += qty;
    else item.stockActual -= qty;

    // Actualizar estado basado en nuevo stock
    if (item.stockActual <= 0) item.status = 'out';
    else if (item.stockActual <= item.stockMin) item.status = 'low';
    else item.status = 'ok';

    const now = new Date();
    const session = storage.get(STORAGE_KEYS.SESSION);
    movementsData.push({
        id: `TRX-${Date.now().toString().slice(-6)}`,
        type: type,
        item: item.name,
        qty: `${qty} ${item.unit}`,
        user: session ? session.user : 'Sistema',
        target: reason || 'Ajuste de inventario',
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    });

    saveData();
    renderInventory();
    renderDashboard();
    document.getElementById('modal-movement').classList.add('hidden');
    document.getElementById('form-movement').reset();
}

// GESTIÓN DE SOLICITUDES
function renderRequests() {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canApprove = session && ['Administrador General', 'Encargada de Inventario', 'Supervisor de Laboratorio'].includes(session.role);
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

window.approveRequest = (index) => {
    const req = requestsData[index];
    const itemIndex = inventoryData.findIndex(i => i.name === req.item);
    
    if (itemIndex !== -1) {
        const item = inventoryData[itemIndex];
        if (item.stockActual < req.qtyNum) {
            alert('No hay stock suficiente para aprobar esta solicitud.');
            return;
        }
        item.stockActual -= req.qtyNum;
        if (item.stockActual <= 0) item.status = 'out';
        else if (item.stockActual <= item.stockMin) item.status = 'low';
        else item.status = 'ok';
        
        const now = new Date();
        movementsData.push({
            id: `TRX-${Date.now().toString().slice(-6)}`,
            type: 'Salida (Solicitud)',
            item: item.name,
            qty: req.qty,
            user: req.user,
            target: 'Entrega por Solicitud',
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        });
    }

    requestsData[index].status = 'aprobada';
    saveData();
    renderRequests();
    renderInventory();
    renderDashboard();
};

window.rejectRequest = (index) => {
    requestsData[index].status = 'rechazada';
    saveData();
    renderRequests();
};
// Renders
function renderInventoryTable(data = inventoryData) {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canModify = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
    tbody.innerHTML = data.map((item, index) => {
        const realIndex = inventoryData.indexOf(item);
        const itemLabs = (item.labs || []).map(labId => {
            const lab = labsData.find(l => l.id === labId);
            return `<span class="lab-badge" title="${lab ? lab.location : ''}">${lab ? lab.name : labId}</span>`;
        }).join('');

        return `
        <tr>
            <td><strong>${item.code || 'N/A'}</strong></td>
            <td>
                <strong>${item.name}</strong>
                ${item.category === 'Reactivos' ? `<br><small class="status-badge" style="background:var(--surface-hover); color:var(--primary); border:1px solid var(--primary); padding:1px 4px; font-size:0.65rem;">${item.state || 'Nuevo'}</small>` : ''}
            </td>
            <td>${item.category}</td>
            <td class="${item.stockActual <= item.stockMin ? 'danger-text' : 'stable-text'}">${item.stockActual}</td>
            <td>${item.format && item.unit && item.format !== item.unit ? `${item.format} (${item.unit})` : (item.format || item.unit || 'N/A')}</td>
            <td>${item.expiryDate || '-'}</td>
            <td><div class="lab-badges-container">${itemLabs}</div></td>
            <td>
                <span class="status-badge status-${item.status}">${(item.status || 'ok').toUpperCase()}</span>
                ${item.comments ? `<i class="fas fa-comment-dots text-muted" title="${item.comments}" style="margin-left: 5px; cursor: help;"></i>` : ''}
            </td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                    <button class="btn-action view" onclick="viewItem(${realIndex})" title="Ver detalles"><i class="fas fa-eye"></i></button>
                    ${canModify ? `
                    <button class="btn-action edit" onclick="editItem(${realIndex})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-action success-btn" onclick="openMovementModal(${realIndex}, 'Ingreso')" title="Ingreso Stock"><i class="fas fa-plus-circle"></i></button>
                    <button class="btn-action danger-btn" onclick="openMovementModal(${realIndex}, 'Salida')" title="Salida Stock"><i class="fas fa-minus-circle"></i></button>
                    <button class="btn-action delete" onclick="deleteItem(${realIndex})" title="Eliminar"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;}).join('');
}

function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
    const canEdit = session && session.role === 'Administrador General';
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

window.deleteUser = (index) => {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
    if (!canDelete) {
        alert('No tiene permisos para eliminar.');
        return;
    }
    const user = usersData[index];
    if (confirm(`¿Está seguro de eliminar al usuario "${user.name}" (${user.role})?`)) {
        usersData.splice(index, 1);
        saveData();
        renderUsers();
    }
};

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

window.masterSync = function() {
    // 1. Persistencia segura (intenta guardar pero no bloquea si falla)
    saveData();
    
    // 2. Refresco total de la interfaz usando datos en memoria RAM
    renderInventory();
    renderLabs();
    if (typeof window.renderAgendaTrabajos === 'function') window.renderAgendaTrabajos();
    if (typeof window.renderCalendar === 'function') window.renderCalendar();
    
    console.log("Sincronización maestra completada en memoria.");
};

function renderInventory(data = inventoryData) {
    renderInventoryTable(data);
    if (typeof renderEquipmentStatus === 'function') {
        renderEquipmentStatus(currentEquipmentFilter);
    }
}

let currentEquipmentFilter = 'all';

window.toggleEquipmentStatus = function(index) {
    // Cambio inmediato en memoria
    inventoryData[index].inUse = !inventoryData[index].inUse;
    
    // Sincronización total
    window.masterSync();
};

function renderEquipmentStatus(filter = 'all') {
    currentEquipmentFilter = filter;
    const tbody = document.getElementById('equipment-status-body');
    if (!tbody) return;

    let equipments = inventoryData.filter((item, index) => {
        item.originalIndex = index;
        return item.category === 'Equipos';
    });

    if (filter === 'available') {
        equipments = equipments.filter(eq => !eq.inUse);
    } else if (filter === 'in-use') {
        equipments = equipments.filter(eq => eq.inUse);
    }

    tbody.innerHTML = equipments.map(eq => `
        <tr>
            <td><strong>${eq.name || 'Sin Nombre'}</strong><br><small>${eq.code || 'S/C'}</small></td>
            <td>${eq.locationDetail || 'No especificada'}</td>
            <td>
                <span class="status-badge" style="background-color: ${eq.inUse ? '#ef4444' : '#10b981'}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">
                    ${eq.inUse ? 'EN USO' : 'DISPONIBLE'}
                </span>
            </td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-sm" onclick="window.toggleEquipmentStatus(${eq.originalIndex})" 
                            style="background: ${eq.inUse ? '#fee2e2' : '#dcfce7'}; 
                                   border: 1px solid ${eq.inUse ? '#f87171' : '#4ade80'}; 
                                   color: ${eq.inUse ? '#991b1b' : '#166534'}; 
                                   font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 600;">
                        <i class="fas ${eq.inUse ? 'fa-unlock' : 'fa-lock'}"></i> ${eq.inUse ? 'Liberar' : 'Ocupar'}
                    </button>
                    <button class="btn-action edit" onclick="window.editEquipmentDetails(${eq.originalIndex})" 
                            style="background: ${eq.inUse ? '#ef4444' : '#10b981'}; color: white; border: none;"
                            title="Editar Detalles">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.editEquipmentDetails = function(index) {
    const eq = inventoryData[index];
    if (!eq) return;
    
    Swal.fire({
        title: '<i class="fas fa-microscope" style="color:var(--primary)"></i> Gestión de Equipo',
        html: `
            <div style="text-align: left; padding: 10px;">
                <div style="margin-bottom: 1rem;">
                    <label style="display:block; margin-bottom: 0.3rem; font-weight: 700; font-size: 0.85rem;">Nombre del Equipo</label>
                    <input id="swal-eq-name" class="swal2-input" value="${eq.name}" style="width: 100%; margin: 0; border-radius: 8px;">
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display:block; margin-bottom: 0.3rem; font-weight: 700; font-size: 0.85rem;">Código de Inventario</label>
                    <input id="swal-eq-code" class="swal2-input" value="${eq.code || ''}" style="width: 100%; margin: 0; border-radius: 8px;">
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display:block; margin-bottom: 0.3rem; font-weight: 700; font-size: 0.85rem;">Ubicación en Laboratorio</label>
                    <input id="swal-eq-loc" class="swal2-input" value="${eq.locationDetail || ''}" style="width: 100%; margin: 0; border-radius: 8px;">
                </div>
                
                <div style="margin-bottom: 0.5rem;">
                    <label style="display:block; margin-bottom: 0.3rem; font-weight: 700; font-size: 0.85rem;">Estado y Acción</label>
                    <select id="swal-eq-use" class="swal2-select" style="width: 100%; margin: 0; border-radius: 8px; height: 45px;">
                        <option value="false" ${!eq.inUse ? 'selected' : ''}>✅ Disponible (Botón Ocupar)</option>
                        <option value="true" ${eq.inUse ? 'selected' : ''}>⚠️ En Uso (Botón Liberar)</option>
                    </select>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'var(--primary)',
        preConfirm: () => {
            const name = document.getElementById('swal-eq-name').value;
            const code = document.getElementById('swal-eq-code').value;
            const location = document.getElementById('swal-eq-loc').value;
            const inUse = document.getElementById('swal-eq-use').value === 'true';
            
            if (!name) {
                Swal.showValidationMessage('El nombre es obligatorio');
                return false;
            }
            return { name, code, location, inUse };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Inmediatez total en memoria RAM (Array Maestro)
            inventoryData[index].name = result.value.name;
            inventoryData[index].code = result.value.code;
            inventoryData[index].locationDetail = result.value.location;
            inventoryData[index].inUse = result.value.inUse;
            
            // Sincronización maestra de todas las tablas
            window.masterSync();
            
            Swal.fire({
                icon: 'success',
                title: 'Sincronización Exitosa',
                text: 'Los datos se han actualizado en memoria y en todas las vistas.',
                timer: 1000,
                showConfirmButton: false
            });
        }
    });
};

window.renderAgendaTrabajos = function() {
    const tbody = document.getElementById('agendar-trabajos-table-body');
    if (!tbody) return;

    const combinedData = [];
    
    // Función segura para mapear y capturar errores de datos
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

    // Ordenar por fecha descendente (más reciente primero) de forma segura
    combinedData.sort((a, b) => {
        const dA = (a.fecha || '0000-00-00');
        const dB = (b.fecha || '0000-00-00');
        const comp = dB.localeCompare(dA);
        if (comp !== 0) return comp;
        return (b.hora || '00:00').localeCompare(a.hora || '00:00');
    });

    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);

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
    
    // Obtener insumos de trabajos de hoy
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
    let activity;
    if (source === 'agenda') activity = agendaTrabajosData[index];
    else if (source === 'planificacion') activity = { 
        titulo: planificacionData[index].item, 
        fecha: planificacionData[index].fecha, 
        insumos: 'Reserva de uso', 
        type: 'Trabajo' 
    };
    
    if (!activity) return;

    // Guardar el índice y fuente que estamos editando
    window.currentEditingActivityIndex = index;
    window.currentEditingActivitySource = source;

    // Poblar modal
    document.getElementById('agenda-type').value = activity.type || 'Trabajo';
    
    // Cambiar texto del botón y visibilidad de campos
    const agendaTypeSelect = document.getElementById('agenda-type');
    if (agendaTypeSelect) {
        agendaTypeSelect.dispatchEvent(new Event('change'));
    }

    document.getElementById('agenda-titulo').value = activity.titulo || activity.item;
    document.getElementById('agenda-fecha').value = activity.fecha;
    document.getElementById('agenda-insumos').value = activity.insumos || '';
    document.getElementById('agenda-equipo').value = activity.equipo || '';
    document.getElementById('agenda-responsable').value = activity.responsable || '';

    // Poblar horas
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
    
    // Abrir modal
    document.getElementById('modal-agendar').classList.remove('hidden');
}

window.deleteActivity = function(source, index) {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
    if (!canDelete) {
        alert('No tiene permisos para eliminar.');
        return;
    }
    // Eliminación inmediata en memoria
    if (source === 'agenda') agendaTrabajosData.splice(index, 1);
    else if (source === 'movements') movementsData.splice(index, 1);
    else if (source === 'requests') requestsData.splice(index, 1);
    else if (source === 'planificacion') planificacionData.splice(index, 1);
    
    // Refresco inmediato de la UI
    if (typeof window.renderAgendaTrabajos === 'function') window.renderAgendaTrabajos();
    if (typeof window.renderCalendar === 'function') window.renderCalendar();
    
    // Refrescar el modal de día si está abierto
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

    // Persistencia opcional/en segundo plano
    saveData();
    
    Swal.fire({
        icon: 'success',
        title: 'Registro Eliminado',
        text: 'La tabla y el calendario se han actualizado.',
        timer: 1000,
        showConfirmButton: false
    });
}

window.showDayDetails = function(dateStr) {
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

    if (dayEvents.length === 0) return;

    const modal = document.getElementById('modal-calendar-day');
    const content = document.getElementById('calendar-day-content');
    const title = document.getElementById('calendar-day-title');
    
    const displayDate = dateStr.split('-').reverse().join('/');
    title.textContent = `Actividades del Día: ${displayDate}`;
    
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);

    content.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Actividad</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${dayEvents.map(e => `
                    <tr>
                        <td><strong>${e.titulo}</strong> ${e.time ? `<br><small>${e.time}</small>` : ''}</td>
                        <td><span class="type-indicator type-${e.type.toLowerCase().substring(0,4)}">${e.type}</span></td>
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
    
    modal.classList.remove('hidden');
}

function renderTurnos() {
    const tbody = document.getElementById('turnos-table-body');
    if (!tbody) return;
    tbody.innerHTML = turnosData.length ? turnosData.map(t => `
        <tr>
            <td style="text-align: center;"><strong>${t.laboratorio}</strong></td>
            <td style="text-align: center;">${t.jefe}</td>
            <td style="text-align: center;">${t.semana}</td>
            <td style="text-align: center;">${t.mes}</td>
        </tr>
    `).join('') : '<tr><td colspan="4" style="text-align:center;padding:1rem;">No hay responsables asignados</td></tr>';
}

function renderAuditoria() {
    const tbody = document.getElementById('auditoria-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canCheck = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
    tbody.innerHTML = usosData.length ? usosData.map((u, index) => `
        <tr>
            <td style="text-align: center;"><strong>${u.item}</strong></td>
            <td style="text-align: center;">${u.usuario}</td>
            <td style="text-align: center;">${u.cantidad}</td>
            <td style="text-align: center;">${u.fecha}</td>
            <td style="text-align: center;">${u.comentario || '-'}</td>
            <td style="text-align: center;">
                <input type="checkbox" style="transform: scale(1.5); cursor: pointer;" onchange="toggleUsoCheck(${index})" ${u.checked ? 'checked' : ''} ${canCheck ? '' : 'disabled'}>
            </td>
            <td style="text-align: center;">
                <div style="display: flex; gap: 0.35rem; justify-content: center;">
                    <button class="btn-action view" onclick="viewUsoDetail(${index})" title="Ver detalles"><i class="fas fa-eye"></i></button>
                    <button class="btn-action edit" onclick="editUso(${index})" title="Editar"><i class="fas fa-edit"></i></button>
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="7" style="text-align:center;padding:1rem;">No hay registros de uso</td></tr>';
}

window.toggleUsoCheck = (index) => {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canCheck = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
    if (!canCheck) {
        alert('No tiene permisos para modificar la revisión.');
        return;
    }
    usosData[index].checked = !usosData[index].checked;
    saveData();
    // No es estrictamente necesario re-renderizar si solo cambia el checkbox y el visual feedback es suficiente
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
    tbody.innerHTML = inventoryData.map((item, index) => {
        const itemLabs = (item.labs || []).map(labId => {
            const lab = labsData.find(l => l.id === labId);
            return lab ? lab.name : labId;
        }).join(', ');
        return `
        <tr>
            <td><strong>${item.name}</strong><br><small class="text-muted">${item.category}</small></td>
            <td>${itemLabs || 'Sin Asignar'}</td>
            <td><code>${item.locationDetail || 'Sin Ubicación'}</code></td>
            <td style="text-align: right;">
                <button class="btn-action edit" onclick="openEspacioModal(${index})" title="Cambiar Ubicación"><i class="fas fa-map-marker-alt"></i></button>
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
    
    // Marcar checkboxes de labs
    const checkboxes = document.querySelectorAll('input[name="espacio-labs"]');
    checkboxes.forEach(cb => {
        cb.checked = item.labs && item.labs.includes(cb.value);
    });

    document.getElementById('modal-espacio').classList.remove('hidden');
};

// FUNCIONES DE ACCIÓN (CRUD)
window.viewItem = (index) => {
    const item = inventoryData[index];
    const content = document.getElementById('item-details-content');
    const itemLabs = (item.labs || []).map(labId => {
        const lab = labsData.find(l => l.id === labId);
        return `<span class="lab-badge">${lab ? lab.name + ' (' + lab.location + ')' : labId}</span>`;
    }).join(' ');

    content.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;" class="details-view">
            <p><strong>Código:</strong> ${item.code}</p>
            <p><strong>Nombre:</strong> ${item.name}</p>
            <p><strong>Categoría:</strong> ${item.category}</p>
            <p><strong>Formato / Unidad:</strong> ${item.format && item.unit && item.format !== item.unit ? `${item.format} (${item.unit})` : (item.format || item.unit || 'N/A')}</p>
            <p><strong>Stock Actual:</strong> ${item.stockActual}</p>
            <p><strong>Stock Mínimo:</strong> ${item.stockMin}</p>
            <p><strong>Vencimiento:</strong> ${item.expiryDate || 'N/A'}</p>
            <p><strong>Ubicación:</strong> ${item.locationDetail || 'N/A'}</p>
            <p><strong>Proveedor:</strong> ${item.supplier || 'N/A'}</p>
            <p><strong>Responsable:</strong> ${item.responsible || 'N/A'}</p>
            <p><strong>Disponibilidad:</strong> <span class="status-badge status-${item.status}">${item.status.toUpperCase()}</span></p>
            ${item.category === 'Reactivos' ? `
                <p><strong>Estado Reactivo:</strong> ${item.state || 'N/A'}</p>
                <p><strong>Fecha Control:</strong> ${item.reactDate || 'N/A'}</p>
                <p style="grid-column: span 2;"><strong>Comentarios:</strong> ${item.comments || 'N/A'}</p>
            ` : ''}
            <div><strong>Sedes:</strong> <div class="lab-badges-container">${itemLabs}</div></div>
        </div>
    `;
    document.getElementById('modal-view-item').classList.remove('hidden');
};

window.editItem = (index) => {
    const item = inventoryData[index];
    document.getElementById('edit-item-index').value = index;
    document.getElementById('edit-item-name').value = item.name;
    document.getElementById('edit-item-category').value = item.category;
    document.getElementById('edit-item-stock-actual').value = item.stockActual;
    document.getElementById('edit-item-stock-min').value = item.stockMin;
    const formatUnitVal = item.format && item.unit && item.format !== item.unit ? `${item.format} (${item.unit})` : (item.format || item.unit || '');
    document.getElementById('edit-item-format-unit').value = formatUnitVal;
    document.getElementById('edit-item-location-detail').value = item.locationDetail || '';
    document.getElementById('edit-item-expiry').value = item.expiryDate || '';
    document.getElementById('edit-item-supplier').value = item.supplier || '';
    document.getElementById('edit-item-responsible').value = item.responsible || '';

    
    // Marcar checkboxes de labs
    const checkboxes = document.querySelectorAll('input[name="edit-labs"]');
    checkboxes.forEach(cb => {
        cb.checked = item.labs && item.labs.includes(cb.value);
    });
    document.getElementById('edit-item-state').value = item.state || 'Nuevo';
    document.getElementById('edit-item-react-date').value = item.reactDate || '';
    document.getElementById('edit-item-comments').value = item.comments || '';
    
    // Mostrar/ocultar campos de reactivos
    const reagentFields = document.getElementById('edit-reagent-only-fields');
    if (item.category === 'Reactivos') reagentFields.classList.remove('hidden');
    else reagentFields.classList.add('hidden');

    // Mostrar/ocultar vencimiento si es Equipos
    const editExpiryGroup = document.getElementById('edit-item-expiry-group');
    if (editExpiryGroup) {
        if (item.category === 'Equipos') editExpiryGroup.classList.add('hidden');
        else editExpiryGroup.classList.remove('hidden');
    }

    document.getElementById('modal-edit-item').classList.remove('hidden');
};

window.deleteItem = (index) => {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
    if (!canDelete) {
        alert('No tiene permisos para eliminar.');
        return;
    }
    if (confirm(`¿Está seguro de eliminar "${inventoryData[index].name}"?`)) {
        inventoryData.splice(index, 1);
        saveData();
        renderInventory();
        renderDashboard();
    }
};

function downloadInventory() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración del documento
    const title = "CELIMIN - Reporte de Inventario";
    const date = new Date().toLocaleDateString();
    
    // Encabezado del PDF
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${date}`, 14, 30);
    
    // Definir las columnas y filas para AutoTable
    const columns = [
        { header: 'Código', dataKey: 'code' },
        { header: 'Nombre', dataKey: 'name' },
        { header: 'Categoría', dataKey: 'category' },
        { header: 'Stock', dataKey: 'stock' },
        { header: 'Laboratorios', dataKey: 'labs' },
        { header: 'Estado', dataKey: 'status' }
    ];

    const data = inventoryData.map(item => {
        const itemLabs = (item.labs || []).map(labId => {
            const lab = labsData.find(l => l.id === labId);
            return lab ? lab.name : labId;
        }).join(', ');

        return {
            code: item.code || 'N/A',
            name: item.name,
            category: item.category,
            stock: item.stock,
            labs: itemLabs,
            status: (item.status || 'ok').toUpperCase()
        };
    });

    // Generar la tabla
    doc.autoTable({
        columns: columns,
        body: data,
        startY: 40,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 40 }
    });

    // Guardar el archivo directamente
    doc.save(`inventario_celimin_${new Date().getTime()}.pdf`);
}

// Inicialización
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
            'Administrador General', 
            'Encargada de Inventario'
        ];
        
        // Control de acceso por roles para el botón "Registrar Usuario" (Personal)
        const allowedRolesUsers = [
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

        // Control "Ver todo": Ocultar ciertos menús si no es admin
        const isAdmin = session.role === 'Administrador General';
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link && link.getAttribute('data-view')) {
                const view = link.getAttribute('data-view');
                if (!isAdmin && (view === 'users' || view === 'movements')) {
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
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userInput = document.getElementById('login-user').value.trim();
            
            // Buscar primero en usersData, luego en initialUsers como respaldo
            let foundUser = usersData.find(u => u.name.toLowerCase() === userInput.toLowerCase());
            if (!foundUser) {
                foundUser = initialUsers.find(u => u.name.toLowerCase() === userInput.toLowerCase());
            }
            
            // Asignar rol del usuario seleccionado
            const user = foundUser ? foundUser.name : userInput;
            const role = foundUser ? foundUser.role : 'Usuario';
            
            const session = { user, role };
            storage.set(STORAGE_KEYS.SESSION, session);
            applySession(session);
        });
    }

    // Logout Event
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('¿Cerrar sesión?')) {
                storage.remove(STORAGE_KEYS.SESSION);
                location.reload(); // Forma más limpia de resetear el estado
            }
        });
    }

    // Modal Logic
    const modalItem = document.getElementById('modal-item');
    const btnNewItem = document.getElementById('btn-new-item');
    const closeBtn = document.getElementById('close-modal-item');
    const cancelBtn = document.getElementById('btn-cancel-item');
    const formNewItem = document.getElementById('form-new-item');

    const toggleModal = (show) => {
        if (show) modalItem.classList.remove('hidden');
        else modalItem.classList.add('hidden');
    };

    if (btnNewItem) {
        btnNewItem.addEventListener('click', () => {
            if (formNewItem) formNewItem.reset();
            const reagentOnly = document.getElementById('reagent-only-fields');
            if (reagentOnly) reagentOnly.classList.add('hidden');
            const itemExpiryGroup = document.getElementById('item-expiry-group');
            if (itemExpiryGroup) itemExpiryGroup.classList.remove('hidden');
            toggleModal(true);
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', () => toggleModal(false));
    if (cancelBtn) cancelBtn.addEventListener('click', () => toggleModal(false));

    if (formNewItem) {
        formNewItem.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const selectedLabs = Array.from(document.querySelectorAll('input[name="labs"]:checked')).map(cb => cb.value);
            
            const newItem = {
                code: `INS-${Math.floor(100 + Math.random() * 900)}`,
                name: document.getElementById('item-name').value,
                category: document.getElementById('item-category').value,
                stockActual: parseInt(document.getElementById('item-stock-actual').value),
                stockMin: parseInt(document.getElementById('item-stock-min').value),
                unit: document.getElementById('item-format-unit').value,
                locationDetail: document.getElementById('item-location-detail').value,
                expiryDate: document.getElementById('item-expiry').value,
                format: document.getElementById('item-format-unit').value,
                state: document.getElementById('item-category').value === 'Reactivos' ? document.getElementById('item-state').value : 'N/A',
                reactDate: document.getElementById('item-category').value === 'Reactivos' ? document.getElementById('item-react-date').value : '',
                comments: document.getElementById('item-category').value === 'Reactivos' ? document.getElementById('item-comments').value : '',
                supplier: document.getElementById('item-supplier').value,
                responsible: document.getElementById('item-responsible').value,
                status: parseInt(document.getElementById('item-stock-actual').value) <= 0 ? 'out' : (parseInt(document.getElementById('item-stock-actual').value) <= parseInt(document.getElementById('item-stock-min').value) ? 'low' : 'ok'),
                labs: selectedLabs
            };

            inventoryData.push(newItem);
            
            // Registrar movimiento
            const session = storage.get(STORAGE_KEYS.SESSION);
            const now = new Date();
            const movement = {
                id: `TRX-${Date.now().toString().slice(-6)}`,
                type: 'Ingreso',
                item: newItem.name,
                qty: `${newItem.stockActual} ${newItem.unit}`,
                user: session ? session.user : 'Sistema',
                target: 'Inventario General',
                date: now.toISOString().split('T')[0],
                time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            };
            movementsData.push(movement);

            saveData();
            renderInventory();
            renderDashboard();
            if (typeof renderEspacios === 'function') renderEspacios();
            
            formNewItem.reset();
            toggleModal(false);
            alert('Registro de ítem guardado con éxito');
        });
    }

    // Edit Item Logic
    const formEditItem = document.getElementById('form-edit-item');
    if (formEditItem) {
        formEditItem.addEventListener('submit', (e) => {
            e.preventDefault();
            const index = document.getElementById('edit-item-index').value;
            
            const selectedLabs = Array.from(document.querySelectorAll('input[name="edit-labs"]:checked')).map(cb => cb.value);

            inventoryData[index] = {
                ...inventoryData[index],
                name: document.getElementById('edit-item-name').value,
                category: document.getElementById('edit-item-category').value,
                stockActual: parseInt(document.getElementById('edit-item-stock-actual').value),
                stockMin: parseInt(document.getElementById('edit-item-stock-min').value),
                unit: document.getElementById('edit-item-format-unit').value,
                locationDetail: document.getElementById('edit-item-location-detail').value,
                expiryDate: document.getElementById('edit-item-expiry').value,
                format: document.getElementById('edit-item-format-unit').value,
                state: document.getElementById('edit-item-category').value === 'Reactivos' ? document.getElementById('edit-item-state').value : 'N/A',
                reactDate: document.getElementById('edit-item-category').value === 'Reactivos' ? document.getElementById('edit-item-react-date').value : '',
                comments: document.getElementById('edit-item-category').value === 'Reactivos' ? document.getElementById('edit-item-comments').value : '',
                supplier: document.getElementById('edit-item-supplier').value,
                responsible: document.getElementById('edit-item-responsible').value,
                status: parseInt(document.getElementById('edit-item-stock-actual').value) <= 0 ? 'out' : (parseInt(document.getElementById('edit-item-stock-actual').value) <= parseInt(document.getElementById('edit-item-stock-min').value) ? 'low' : 'ok'),
                labs: selectedLabs
            };

            saveData();
            renderInventory();
            if (typeof renderDashboard === 'function') renderDashboard();
            if (typeof renderEspacios === 'function') renderEspacios();
            document.getElementById('modal-edit-item').classList.add('hidden');
            alert('Cambios guardados con éxito');
        });
    }

    // Modal Close Logic (View & Edit)
    document.getElementById('close-modal-view')?.addEventListener('click', () => document.getElementById('modal-view-item').classList.add('hidden'));
    document.getElementById('btn-close-view')?.addEventListener('click', () => document.getElementById('modal-view-item').classList.add('hidden'));
    document.getElementById('close-modal-edit')?.addEventListener('click', () => document.getElementById('modal-edit-item').classList.add('hidden'));
    document.getElementById('btn-cancel-edit')?.addEventListener('click', () => document.getElementById('modal-edit-item').classList.add('hidden'));

    // Export Logic
    document.getElementById('btn-export-inventory')?.addEventListener('click', downloadInventory);

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
        formNewUser.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newUser = {
                name: document.getElementById('user-full-name').value,
                role: document.getElementById('user-new-role').value,
                lastAccess: 'Nunca',
                permissions: document.getElementById('user-permissions').value || 'Estándar',
                active: true
            };

            usersData.push(newUser);
            saveData();
            renderUsers();
            
            formNewUser.reset();
            toggleUserModal(false);
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
        formEditUser.addEventListener('submit', (e) => {
            e.preventDefault();
            const index = document.getElementById('edit-user-index').value;
            
            usersData[index] = {
                ...usersData[index],
                name: document.getElementById('edit-user-name').value,
                role: document.getElementById('edit-user-role').value,
                permissions: document.getElementById('edit-user-permissions').value || 'Estándar'
            };

            saveData();
            renderUsers();
            modalEditUser.classList.add('hidden');
            alert('Usuario actualizado con éxito.');
        });
    }

    // Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            switchView(e.currentTarget.getAttribute('data-view'));
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
    
    document.getElementById('form-new-request')?.addEventListener('submit', (e) => {
        e.preventDefault();
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

        requestsData.unshift(newReq);
        saveData();
        renderRequests();
        modalRequest.classList.add('hidden');
        e.target.reset();
        alert('Solicitud enviada con éxito');
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
        formNewLab.addEventListener('submit', (e) => {
            e.preventDefault();
            const newLab = {
                id: document.getElementById('lab-id').value,
                name: document.getElementById('lab-name').value,
                location: document.getElementById('lab-location').value
            };

            labsData.push(newLab);
            saveData();
            renderLabs();
            formNewLab.reset();
            toggleLabModal(false);
            alert(`Laboratorio ${newLab.name} registrado con éxito`);
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
        formEditLab.addEventListener('submit', (e) => {
            e.preventDefault();
            const index = document.getElementById('edit-lab-index').value;

            labsData[index] = {
                id: document.getElementById('edit-lab-id').value,
                name: document.getElementById('edit-lab-name').value,
                location: document.getElementById('edit-lab-location').value
            };

            saveData();
            renderLabs();
            modalEditLab.classList.add('hidden');
            alert('Laboratorio actualizado con éxito.');
        });
    }

    // LOGIN EXTRA ACTIONS (Forgot & Signup)
    const modalForgot = document.getElementById('modal-forgot');
    const modalSignup = document.getElementById('modal-signup');
    const linkForgot = document.getElementById('link-forgot-password');
    const linkSignup = document.getElementById('link-create-account');

    if (linkForgot) {
        linkForgot.addEventListener('click', (e) => {
            e.preventDefault();
            modalForgot.classList.remove('hidden');
        });
    }

    if (linkSignup) {
        linkSignup.addEventListener('click', (e) => {
            e.preventDefault();
            modalSignup.classList.remove('hidden');
        });
    }

    document.getElementById('close-modal-forgot')?.addEventListener('click', () => modalForgot.classList.add('hidden'));
    document.getElementById('close-modal-signup')?.addEventListener('click', () => modalSignup.classList.add('hidden'));
    document.getElementById('btn-cancel-forgot')?.addEventListener('click', () => modalForgot.classList.add('hidden'));
    document.getElementById('btn-cancel-signup')?.addEventListener('click', () => modalSignup.classList.add('hidden'));

    document.getElementById('form-forgot')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;

        setTimeout(() => {
            alert('Se ha enviado un correo de recuperación a su casilla institucional.');
            modalForgot.classList.add('hidden');
            btn.innerHTML = originalText;
            btn.disabled = false;
            e.target.reset();
        }, 1500);
    });

    document.getElementById('form-signup')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btn.disabled = true;

        setTimeout(() => {
            alert('Su solicitud ha sido enviada. El administrador revisará sus datos y activará su cuenta en las próximas 24 horas.');
            modalSignup.classList.add('hidden');
            btn.innerHTML = originalText;
            btn.disabled = false;
            e.target.reset();
        }, 1500);
    });

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

    // Lógica para Agendar Trabajo
    const modalAgendar = document.getElementById('modal-agendar');
    const btnNewAgendar = document.getElementById('btn-new-agendar');
    const closeAgendarBtn = document.getElementById('close-modal-agendar');
    const cancelAgendarBtn = document.getElementById('btn-cancel-agendar');
    const formAgendar = document.getElementById('form-agendar');

    const toggleAgendarModal = (show) => {
        if (show) {
            modalAgendar.classList.remove('hidden');
            const agendaTypeSelect = document.getElementById('agenda-type');
            if (agendaTypeSelect) {
                agendaTypeSelect.value = 'Trabajo';
                agendaTypeSelect.dispatchEvent(new Event('change'));
            }
        } else {
            window.currentEditingActivityIndex = undefined;
            const btnSubmit = formAgendar.querySelector('button[type="submit"]');
            if (btnSubmit) btnSubmit.textContent = 'Agendar Trabajo';
            formAgendar.reset();
            modalAgendar.classList.add('hidden');
        }
    };

    if (btnNewAgendar) btnNewAgendar.addEventListener('click', () => toggleAgendarModal(true));
    if (closeAgendarBtn) closeAgendarBtn.addEventListener('click', () => toggleAgendarModal(false));
    if (cancelAgendarBtn) cancelAgendarBtn.addEventListener('click', () => toggleAgendarModal(false));

    if (formAgendar) {
        formAgendar.addEventListener('submit', (e) => {
            e.preventDefault();
            const tipo = document.getElementById('agenda-type').value;
            const titulo = document.getElementById('agenda-titulo').value;
            const fecha = document.getElementById('agenda-fecha').value;
            const insumos = document.getElementById('agenda-insumos').value;
            const equipo = document.getElementById('agenda-equipo').value;
            const responsable = document.getElementById('agenda-responsable').value;
            
            const session = storage.get(STORAGE_KEYS.SESSION);

            if (tipo === 'Movimiento') {
                movementsData.push({
                    id: `TRX-${Date.now().toString().slice(-6)}`,
                    type: 'Manual',
                    item: titulo,
                    qty: insumos || 'N/A',
                    user: session ? session.user : 'Sistema',
                    target: equipo || 'Ajuste manual',
                    date: fecha,
                    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                });
            } else if (tipo === 'Solicitud') {
                requestsData.push({
                    id: `SOL-${Date.now().toString().slice(-4)}`,
                    user: session ? (session.user || 'Sistema') : 'Sistema',
                    item: titulo,
                    qty: insumos || 'N/A',
                    date: fecha.split('-').reverse().join('/'),
                    status: 'pendiente'
                });
            } else {
                const horaInicio = document.getElementById('agenda-hora-inicio').value;
                const horaFin = document.getElementById('agenda-hora-fin').value;
                const newActivity = {
                    titulo, fecha, insumos, equipo, responsable, type: 'Trabajo',
                    horaInicio, horaFin,
                    hora: `${horaInicio} - ${horaFin}`
                };

                if (window.currentEditingActivityIndex !== undefined) {
                    if (window.currentEditingActivitySource === 'planificacion') {
                        planificacionData[window.currentEditingActivityIndex] = {
                            item: titulo,
                            usuario: session ? session.user : 'Sistema',
                            fecha: fecha,
                            completado: false
                        };
                    } else {
                        agendaTrabajosData[window.currentEditingActivityIndex] = newActivity;
                    }
                    window.currentEditingActivityIndex = undefined;
                    window.currentEditingActivitySource = undefined;
                } else {
                    agendaTrabajosData.push(newActivity);
                }
            }

            saveData();
            
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            btn.disabled = true;

            setTimeout(() => {
                modalAgendar.classList.add('hidden');
                renderAgendaTrabajos();
                renderCalendar();
                
                // Limpiar estado de edición
                window.currentEditingActivityIndex = undefined;
                const btnSubmit = formAgendar.querySelector('button[type="submit"]');
                btnSubmit.textContent = 'Agendar Trabajo';

                if (document.getElementById('agendar-trabajos-view').classList.contains('hidden')) {
                    switchView('agendar-trabajos');
                }
                
                btn.innerHTML = originalText;
                btn.disabled = false;
                formAgendar.reset();
            }, 500);
        });

        // Cambiar etiquetas del modal según el tipo
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
        formLimpieza.addEventListener('submit', (e) => {
            e.preventDefault();
            const record = {
                equipo: document.getElementById('limpieza-equipo').value,
                fecha: document.getElementById('limpieza-fecha').value,
                hora: document.getElementById('limpieza-hora').value,
                tipo: document.getElementById('limpieza-tipo').value,
                obs: document.getElementById('limpieza-obs').value
            };
            mantenimientoData.push(record);
            saveData();
            renderMantenimiento();
            modalLimpieza.classList.add('hidden');
            formLimpieza.reset();
            alert('Registro de limpieza guardado con éxito.');
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

    if (btnNewTurno) btnNewTurno.addEventListener('click', () => toggleTurnoModal(true));
    if (closeTurnoBtn) closeTurnoBtn.addEventListener('click', () => toggleTurnoModal(false));
    if (cancelTurnoBtn) cancelTurnoBtn.addEventListener('click', () => toggleTurnoModal(false));

    if (formTurno) {
        formTurno.addEventListener('submit', (e) => {
            e.preventDefault();
            const record = {
                laboratorio: document.getElementById('turno-lab').value,
                jefe: document.getElementById('turno-jefe').value,
                semana: document.getElementById('turno-semana').value,
                mes: document.getElementById('turno-mes').value
            };
            turnosData.push(record);
            saveData();
            renderTurnos();
            toggleTurnoModal(false);
            formTurno.reset();
            alert('Responsable registrado exitosamente.');
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
        formUso.addEventListener('submit', (e) => {
            e.preventDefault();
            const record = {
                item: document.getElementById('uso-item').value,
                usuario: document.getElementById('uso-usuario').value,
                cantidad: document.getElementById('uso-cantidad').value,
                fecha: document.getElementById('uso-fecha').value,
                comentario: document.getElementById('uso-comentario').value,
                checked: false
            };
            usosData.push(record);
            saveData();
            renderAuditoria();
            toggleUsoModal(false);
            formUso.reset();
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
    if (closePlanificacionBtn) closePlanificacionBtn.addEventListener('click', () => togglePlanificacionModal(false));
    if (cancelPlanificacionBtn) cancelPlanificacionBtn.addEventListener('click', () => togglePlanificacionModal(false));

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
    
    // Y parcheamos updateLabSelections original para incluir el nuevo contenedor
    const oldUpdateLabSelections = window.updateLabSelections || updateLabSelections;
    window.updateLabSelections = function() {
        if(typeof oldUpdateLabSelections === 'function') oldUpdateLabSelections();
        updateEspacioLabs();
    };

    // Lógica para mostrar/ocultar campos de reactivos/equipos en tiempo real
    const catSelect = document.getElementById('item-category');
    const reagentOnly = document.getElementById('reagent-only-fields');
    const itemExpiryGroup = document.getElementById('item-expiry-group');
    if (catSelect && reagentOnly) {
        catSelect.addEventListener('change', () => {
            if (catSelect.value === 'Reactivos') reagentOnly.classList.remove('hidden');
            else reagentOnly.classList.add('hidden');

            if (catSelect.value === 'Equipos') {
                if (itemExpiryGroup) itemExpiryGroup.classList.add('hidden');
            } else {
                if (itemExpiryGroup) itemExpiryGroup.classList.remove('hidden');
            }
        });
    }

    const editCatSelect = document.getElementById('edit-item-category');
    const editReagentOnly = document.getElementById('edit-reagent-only-fields');
    const editItemExpiryGroup = document.getElementById('edit-item-expiry-group');
    if (editCatSelect && editReagentOnly) {
        editCatSelect.addEventListener('change', () => {
            if (editCatSelect.value === 'Reactivos') editReagentOnly.classList.remove('hidden');
            else editReagentOnly.classList.add('hidden');

            if (editCatSelect.value === 'Equipos') {
                if (editItemExpiryGroup) editItemExpiryGroup.classList.add('hidden');
            } else {
                if (editItemExpiryGroup) editItemExpiryGroup.classList.remove('hidden');
            }
        });
    }

    // Listeners para filtros de estado en inventario
    document.querySelectorAll('.status-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.status-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderEquipmentStatus(btn.dataset.status);
        });
    });

    // Listeners para botones de actualización manual
    const refreshInvBtn = document.getElementById('btn-refresh-inventory');
    if (refreshInvBtn) {
        refreshInvBtn.addEventListener('click', () => {
            const icon = refreshInvBtn.querySelector('i');
            icon.classList.add('fa-spin');
            window.masterSync();
            setTimeout(() => {
                icon.classList.remove('fa-spin');
                Swal.fire({ icon: 'success', title: 'Sistema Sincronizado', timer: 800, showConfirmButton: false });
            }, 500);
        });
    }

    const refreshEqBtn = document.getElementById('btn-refresh-equipments');
    if (refreshEqBtn) {
        refreshEqBtn.addEventListener('click', () => {
            const icon = refreshEqBtn.querySelector('i');
            icon.classList.add('fa-spin');
            window.masterSync();
            setTimeout(() => {
                icon.classList.remove('fa-spin');
                Swal.fire({ icon: 'success', title: 'Equipos Actualizados', timer: 800, showConfirmButton: false });
            }, 500);
        });
    }

    // Listeners para vaciar datos (Eliminar Todo)
    const clearInvBtn = document.getElementById('btn-clear-inventory');
    if (clearInvBtn) {
        clearInvBtn.addEventListener('click', () => {
            Swal.fire({
                title: '¿Eliminar todo el inventario?',
                text: 'Esta acción borrará todos los registros de insumos y reactivos. ¡No podrás revertir esto!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#4f46e5',
                confirmButtonText: 'Sí, eliminar todo',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    inventoryData = [];
                    saveData();
                    renderInventory();
                    if (typeof renderDashboard === 'function') renderDashboard();
                    if (typeof renderEspacios === 'function') renderEspacios();
                    Swal.fire({
                        icon: 'success',
                        title: 'Inventario Vaciado',
                        text: 'Se han eliminado todos los registros del inventario.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
        });
    }

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

            // Validar tamaño: 1.5MB max (1.5 * 1024 * 1024 bytes)
            if (file.size > 1.5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'Archivo Demasiado Grande',
                    text: 'El límite máximo de tamaño de archivo es de 1.5 MB para asegurar el rendimiento local.'
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                const base64Data = evt.target.result;
                const session = storage.get(STORAGE_KEYS.SESSION);
                const uploader = session ? session.user : 'Sistema';
                
                const newDoc = {
                    id: `DOC-${Date.now().toString().slice(-6)}`,
                    title: title,
                    desc: desc,
                    fileName: file.name,
                    fileData: base64Data,
                    date: new Date().toLocaleDateString('es-ES'),
                    size: formatBytes(file.size),
                    user: uploader
                };

                libraryDocsData.push(newDoc);
                saveData();
                renderLibrary();
                toggleDocModal(false);

                Swal.fire({
                    icon: 'success',
                    title: 'Documento Guardado',
                    text: 'El PDF se ha subido correctamente a la biblioteca.',
                    timer: 2000,
                    showConfirmButton: false
                });
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
});

// Utilidad para formatear bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Renderizado de Biblioteca
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
    const canDelete = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);

    grid.innerHTML = libraryDocsData.map((doc) => `
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

            <div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Subido por:</span>
                    <strong style="color: var(--text-dark);">${doc.user}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Fecha:</span>
                    <strong>${doc.date}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Tamaño:</span>
                    <strong>${doc.size}</strong>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; width: 100%;">
                <button class="btn btn-primary" onclick="downloadDocument('${doc.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem;">
                    <i class="fas fa-download"></i> Descargar
                </button>
                ${canDelete ? `
                    <button class="btn" onclick="deleteDocument('${doc.id}')" style="background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; padding: 0.6rem; border-radius: 12px; transition: all 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
};

// Descargar Documento
window.downloadDocument = function(id) {
    const doc = libraryDocsData.find(d => d.id === id);
    if (!doc) return;

    // Crear un enlace temporal para descargar el archivo base64
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName || `${doc.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Eliminar Documento
window.deleteDocument = function(id) {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador General', 'Encargada de Inventario'].includes(session.role);
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

// Lógica del Plano Interactivo
let selectedPlanoZone = null;

const planoZones = {
    'analisis-gases': {
        name: 'Módulo de Análisis de Gases',
        lab: 'Laboratorio de Procesos',
        desc: 'Área aislada para el monitoreo de emisiones gaseosas, campanas de flujo controlado y sensores de reactividad.',
        match: (item) => item.locationDetail?.toLowerCase().includes('gases') || item.locationDetail?.toLowerCase().includes('contaminación')
    },
    'baterias-almacen': {
        name: 'Almacén de Material y Equipos',
        lab: 'Laboratorio de Baterías',
        desc: 'Bodega de almacenamiento de celdas de litio, consumibles, guantes y componentes de recambio.',
        match: (item) => item.locationDetail?.toLowerCase().includes('bodega') || item.locationDetail?.toLowerCase().includes('almacén') || item.locationDetail?.toLowerCase().includes('almacen') || item.locationDetail?.toLowerCase().includes('supply')
    },
    'procesos-mesa-lat': {
        name: 'Mesón Lateral Izquierdo',
        lab: 'Laboratorio de Procesos',
        desc: 'Mesón principal para soporte de equipos ópticos, balanzas analíticas y microscopios de procesos.',
        match: (item) => item.locationDetail?.toLowerCase().includes('mesón 4') || item.locationDetail?.toLowerCase().includes('mesa lateral') || item.locationDetail?.toLowerCase().includes('lateral izquierdo') || item.locationDetail?.toLowerCase().includes('mesa 4')
    },
    'procesos-estanteria-sup': {
        name: 'Estantería Superior Izquierda',
        lab: 'Laboratorio de Procesos',
        desc: 'Estante elevado para reactivos químicos sellados, sales de litio y ácidos orgánicos.',
        match: (item) => item.locationDetail?.toLowerCase().includes('estante a1') || item.locationDetail?.toLowerCase().includes('estante') || item.locationDetail?.toLowerCase().includes('estantería')
    },
    'procesos-mesa-central': {
        name: 'Mesón Central de Procesos',
        lab: 'Laboratorio de Procesos',
        desc: 'Mesa de trabajo central multifuncional para la mezcla de disoluciones e instrumentación general.',
        match: (item) => item.locationDetail?.toLowerCase().includes('mesón central') || (item.locationDetail?.toLowerCase().includes('central') && item.labs?.includes('L1'))
    },
    'procesos-lavaplatos': {
        name: 'Lavaplatos Doble (Procesos)',
        lab: 'Laboratorio de Procesos',
        desc: 'Zona húmeda de lavado de material de vidrio de laboratorio (buretas, precipitados, matraces).',
        match: (item) => item.locationDetail?.toLowerCase().includes('lavaplatos') || item.locationDetail?.toLowerCase().includes('lavadero')
    },
    'procesos-campana': {
        name: 'Campana Extractora (Procesos)',
        lab: 'Laboratorio de Procesos',
        desc: 'Extractor de vapores ácidos y solventes volátiles orgánicos para manipulación segura de reactivos.',
        match: (item) => item.locationDetail?.toLowerCase().includes('campana') || item.locationDetail?.toLowerCase().includes('extractora')
    },
    'procesos-estanteria-inf': {
        name: 'Estantería de Procesos (G2)',
        lab: 'Laboratorio de Procesos',
        desc: 'Gabinete inferior cerrado para almacenamiento de vidriería de repuesto y consumibles secos.',
        match: (item) => item.locationDetail?.toLowerCase().includes('gabinete g2') || item.locationDetail?.toLowerCase().includes('gabinete') || item.locationDetail?.toLowerCase().includes('almacenaje inferior')
    },
    'baterias-lavaplatos': {
        name: 'Lavaplatos de Baterías',
        lab: 'Laboratorio de Baterías',
        desc: 'Lavadero secundario para lavado y secado rápido de componentes inertes.',
        match: (item) => item.locationDetail?.toLowerCase().includes('lavaplatos baterías') || item.locationDetail?.toLowerCase().includes('lavaplatos baterias')
    },
    'baterias-mesa-central-sup': {
        name: 'Mesón Central Superior',
        lab: 'Laboratorio de Baterías',
        desc: 'Área destinada a la preparación de electrolitos, pesaje de ánodos/cátodos y ensamblaje inicial.',
        match: (item) => item.locationDetail?.toLowerCase().includes('mesa central superior') || item.locationDetail?.toLowerCase().includes('mesón superior')
    },
    'baterias-mesa-central-inf': {
        name: 'Mesón Central Inferior',
        lab: 'Laboratorio de Baterías',
        desc: 'Espacio de trabajo para montaje de celdas de moneda (coin cells) y conexión de multímetros.',
        match: (item) => item.locationDetail?.toLowerCase().includes('mesa central inferior') || item.locationDetail?.toLowerCase().includes('mesón inferior')
    },
    'baterias-mesa-lat': {
        name: 'Mesón Lateral Derecho',
        lab: 'Laboratorio de Baterías',
        desc: 'Mesón de instrumentación para espectrómetros, equipos analíticos avanzados y hornos de secado.',
        match: (item) => item.locationDetail?.toLowerCase().includes('lab 2 - central') || item.locationDetail?.toLowerCase().includes('lateral derecho') || item.locationDetail?.toLowerCase().includes('mesón lateral')
    },
    'baterias-equipos-inf': {
        name: 'Módulo de Equipos de Ciclos',
        lab: 'Laboratorio de Baterías',
        desc: 'Estaciones de ciclado y carga/descarga de celdas de ion litio conectadas a sistemas de control computarizado.',
        match: (item) => item.locationDetail?.toLowerCase().includes('equipos') || item.locationDetail?.toLowerCase().includes('ciclado') || item.name?.toLowerCase().includes('espectrómetro') || item.name?.toLowerCase().includes('microscopio')
    }
};

window.initPlano = function() {
    const svg = document.getElementById('labs-map-svg');
    if (!svg) return;
    
    // Configurar click listeners en los polígonos/rectángulos del plano
    const zones = svg.querySelectorAll('.map-interactive-zone');
    zones.forEach(zone => {
        zone.onclick = function() {
            zones.forEach(z => z.classList.remove('active'));
            zone.classList.add('active');
            
            const zoneId = zone.getAttribute('data-zone');
            selectedPlanoZone = zoneId;
            renderPlanoSidebar(zoneId);
        };
    });

    // Configurar modal de plano
    const modal = document.getElementById('modal-plano-details');
    const closeBtn = document.getElementById('close-modal-plano-details');
    const cancelBtn = document.getElementById('btn-close-plano-details');
    const fullDetailsBtn = document.getElementById('btn-plano-full-details');
    const searchInput = document.getElementById('plano-details-search');

    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    if (cancelBtn) cancelBtn.onclick = () => modal.classList.add('hidden');
    
    if (fullDetailsBtn) {
        fullDetailsBtn.onclick = () => {
            if (!selectedPlanoZone) return;
            const zoneInfo = planoZones[selectedPlanoZone];
            if (!zoneInfo) return;
            
            document.getElementById('plano-details-title').innerText = `Inventario Completo - ${zoneInfo.name}`;
            document.getElementById('plano-details-subtitle').innerText = zoneInfo.desc;
            
            // Cargar y filtrar
            const matchingItems = inventoryData.filter(item => zoneInfo.match(item));
            renderPlanoModalTable(matchingItems);
            
            modal.classList.remove('hidden');
            if (searchInput) {
                searchInput.value = '';
                searchInput.oninput = () => {
                    const term = searchInput.value.toLowerCase().trim();
                    const filtered = matchingItems.filter(item => 
                        item.name.toLowerCase().includes(term) ||
                        item.code.toLowerCase().includes(term) ||
                        item.category.toLowerCase().includes(term) ||
                        item.locationDetail?.toLowerCase().includes(term)
                    );
                    renderPlanoModalTable(filtered);
                };
            }
        };
    }
};

function renderPlanoSidebar(zoneId) {
    const placeholder = document.getElementById('plano-sidebar-placeholder');
    const content = document.getElementById('plano-sidebar-content');
    const fullDetailsBtn = document.getElementById('btn-plano-full-details');
    const itemsList = document.getElementById('plano-items-list');

    const zoneInfo = planoZones[zoneId];
    if (!zoneInfo) {
        if (placeholder) placeholder.classList.remove('hidden');
        if (content) content.classList.add('hidden');
        if (fullDetailsBtn) fullDetailsBtn.disabled = true;
        return;
    }

    if (placeholder) placeholder.classList.add('hidden');
    if (content) content.classList.remove('hidden');
    if (fullDetailsBtn) fullDetailsBtn.disabled = false;

    document.getElementById('plano-area-name').innerText = zoneInfo.name;
    document.getElementById('plano-area-desc').innerText = zoneInfo.desc;
    
    const labBadge = document.getElementById('plano-area-lab');
    if (labBadge) {
        labBadge.innerText = zoneInfo.lab;
        labBadge.className = `status-badge ${zoneInfo.lab.includes('Procesos') ? 'status-ok' : 'status-pendiente'}`;
    }

    const matchingItems = inventoryData.filter(item => zoneInfo.match(item));
    
    if (matchingItems.length === 0) {
        itemsList.innerHTML = `
            <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
                <i class="fas fa-box-open" style="margin-bottom: 0.5rem; display: block; font-size: 1.5rem;"></i>
                No hay insumos o reactivos registrados en esta ubicación.
            </div>
        `;
        return;
    }

    itemsList.innerHTML = matchingItems.map(item => {
        let iconClass = 'fa-box';
        if (item.category === 'Reactivos') iconClass = 'fa-flask';
        else if (item.category === 'Equipos') iconClass = 'fa-microscope';
        else if (item.category === 'Vidriería') iconClass = 'fa-wine-glass-alt';
        else if (item.category === 'Consumibles') iconClass = 'fa-vials';

        const statusColor = item.status === 'ok' ? '#10b981' : (item.status === 'low' ? '#f59e0b' : '#ef4444');

        return `
            <div class="plano-item-row">
                <div style="display: flex; gap: 0.75rem; align-items: center; min-width: 0;">
                    <i class="fas ${iconClass}" style="color: var(--text-muted); font-size: 1.1rem; width: 20px; text-align: center;"></i>
                    <div style="min-width: 0;">
                        <span style="font-weight: 600; font-size: 0.85rem; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-main);">${item.name}</span>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">${item.code} | ${item.category}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">${item.stockActual} ${item.unit}</span>
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; display: inline-block;" title="Estado: ${item.status}"></span>
                </div>
            </div>
        `;
    }).join('');
}

function renderPlanoModalTable(items) {
    const tbody = document.getElementById('plano-details-table-body');
    const counter = document.getElementById('plano-details-counter');
    if (!tbody) return;

    if (counter) {
        counter.innerText = `Mostrando ${items.length} elemento${items.length === 1 ? '' : 's'}`;
    }

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-search fa-2x" style="margin-bottom: 0.5rem; display: block;"></i>
                    Ningún elemento coincide con los criterios.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = items.map(item => {
        const statusBadge = `<span class="status-badge status-${item.status}">${item.status.toUpperCase()}</span>`;
        return `
            <tr>
                <td><code>${item.code}</code></td>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td style="text-align: center; font-weight: 600;">${item.stockActual} ${item.unit}</td>
                <td>${item.responsible || '—'}</td>
                <td>${item.locationDetail || 'General'}</td>
                <td style="text-align: center;">${statusBadge}</td>
            </tr>
        `;
    }).join('');
}


