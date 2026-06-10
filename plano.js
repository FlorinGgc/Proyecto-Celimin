// =============================================================================
// PLANO.JS — Módulo del Plano Interactivo (SVG, zonas, sidebar, modal)
// =============================================================================

let selectedPlanoZone = null;

const planoZones = {};
const letters = 'ABCDEFGHIJKLMNOPQR'.split('');
letters.forEach(letter => {
    let lab = letter >= 'M' ? 'Laboratorio de Baterías de Ion Litio' : 'Laboratorio en Procesos';
    planoZones[letter] = {
        name: `Zona ${letter}`,
        lab: lab,
        desc: `Área designada como Zona ${letter} en el plano.`,
        match: (item) => item.locationDetail?.toUpperCase().includes(`ZONA ${letter}`) || item.locationDetail?.toUpperCase() === letter
    };
});

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
