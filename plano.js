// =============================================================================
// PLANO.JS — Módulo del Plano Interactivo (SVG, zonas, sidebar, modal)
// =============================================================================

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
