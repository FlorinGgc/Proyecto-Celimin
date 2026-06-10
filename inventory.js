// =============================================================================
// INVENTORY.JS — Módulo de Inventario (tabla, equipos, CRUD ítems, PDF)
// =============================================================================

// Renders
function renderInventoryTable(data = inventoryData) {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canModify = session && ['Administrador', 'Compra y Abastecimiento'].includes(session.role);
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
            <td>${item.locationDetail ? `<span class="badge" style="background:#e2e8f0; color:#475569; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:600;">${item.locationDetail}</span>` : '<span class="text-muted">—</span>'}</td>
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

// =============================================================================
// ESTADO DE EQUIPOS
// =============================================================================
let currentEquipmentFilter = 'all';

window.toggleEquipmentStatus = async function(index) {
    const item = inventoryData[index];
    const newStatus = !item.inUse;
    await window.dbSync.toggleEquipmentInUse(item.id, newStatus);
    item.inUse = newStatus;
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
                    <select id="swal-eq-loc" class="swal2-select" style="width: 100%; margin: 0; border-radius: 8px; height: 45px; font-size: 14px;">
                        <option value="">— Seleccione una Zona —</option>
                        <optgroup label="Laboratorio en Procesos">
                            ${['Zona A', 'Zona B', 'Zona C', 'Zona D', 'Zona E', 'Zona F', 'Zona G', 'Zona H', 'Zona I', 'Zona J', 'Zona K', 'Zona L'].map(z => `<option value="${z}" ${eq.locationDetail === z ? 'selected' : ''}>${z}</option>`).join('')}
                        </optgroup>
                        <optgroup label="Laboratorio de Baterías de Ion Litio">
                            ${['Zona M', 'Zona N', 'Zona O', 'Zona P', 'Zona Q', 'Zona R'].map(z => `<option value="${z}" ${eq.locationDetail === z ? 'selected' : ''}>${z}</option>`).join('')}
                        </optgroup>
                    </select>
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
    }).then(async (result) => {
        if (result.isConfirmed) {
            inventoryData[index].name = result.value.name;
            inventoryData[index].code = result.value.code;
            inventoryData[index].locationDetail = result.value.location;
            inventoryData[index].inUse = result.value.inUse;
            
            await window.dbSync.saveInventoryItem(inventoryData[index]);
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

// =============================================================================
// FUNCIONES CRUD DE ÍTEMS
// =============================================================================
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

    const checkboxes = document.querySelectorAll('input[name="edit-labs"]');
    checkboxes.forEach(cb => {
        cb.checked = item.labs && item.labs.includes(cb.value);
    });
    document.getElementById('edit-item-state').value = item.state || 'Nuevo';
    document.getElementById('edit-item-react-date').value = item.reactDate || '';
    document.getElementById('edit-item-comments').value = item.comments || '';
    
    const reagentFields = document.getElementById('edit-reagent-only-fields');
    if (item.category === 'Reactivos') reagentFields.classList.remove('hidden');
    else reagentFields.classList.add('hidden');

    const editExpiryGroup = document.getElementById('edit-item-expiry-group');
    if (editExpiryGroup) {
        if (item.category === 'Equipos') editExpiryGroup.classList.add('hidden');
        else editExpiryGroup.classList.remove('hidden');
    }

    document.getElementById('modal-edit-item').classList.remove('hidden');
};

window.deleteItem = async (index) => {
    const session = storage.get(STORAGE_KEYS.SESSION);
    const canDelete = session && ['Administrador', 'Compra y Abastecimiento'].includes(session.role);
    if (!canDelete) {
        alert('No tiene permisos para eliminar.');
        return;
    }
    const item = inventoryData[index];
    if (confirm(`¿Está seguro de eliminar "${item.name}"?`)) {
        await window.dbSync.deleteInventoryItem(item.id);
        inventoryData.splice(index, 1);
        saveData();
        renderInventory();
        renderDashboard();
    }
};

// =============================================================================
// EXPORTAR INVENTARIO A PDF
// =============================================================================
function downloadInventory() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const title = "CELIMIN - Reporte de Inventario";
    const date = new Date().toLocaleDateString();
    
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${date}`, 14, 30);
    
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

    doc.autoTable({
        columns: columns,
        body: data,
        startY: 40,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 40 }
    });

    doc.save(`inventario_celimin_${new Date().getTime()}.pdf`);
}

// =============================================================================
// INICIALIZACIÓN — DOMContentLoaded (inventory)
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {

    // Modal Logic — Nuevo Ítem
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
        formNewItem.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = e.target.querySelector('button[type="submit"]');
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btn.disabled = true;

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

            const savedId = await window.dbSync.saveInventoryItem(newItem, true);
            newItem.id = savedId;
            inventoryData.push(newItem);
            
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
            
            await window.dbSync.insertMovement(movement);
            movementsData.push(movement);

            saveData();
            renderInventory();
            renderDashboard();
            if (typeof renderEspacios === 'function') renderEspacios();
            
            formNewItem.reset();
            toggleModal(false);
            btn.innerHTML = origHtml;
            btn.disabled = false;
            alert('Registro de ítem guardado con éxito');
        });
    }

    // Edit Item Logic
    const formEditItem = document.getElementById('form-edit-item');
    if (formEditItem) {
        formEditItem.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btn.disabled = true;

            const index = document.getElementById('edit-item-index').value;
            const selectedLabs = Array.from(document.querySelectorAll('input[name="edit-labs"]:checked')).map(cb => cb.value);

            const updatedItem = {
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

            await window.dbSync.saveInventoryItem(updatedItem);
            inventoryData[index] = updatedItem;

            saveData();
            renderInventory();
            if (typeof renderDashboard === 'function') renderDashboard();
            if (typeof renderEspacios === 'function') renderEspacios();
            document.getElementById('modal-edit-item').classList.add('hidden');
            btn.innerHTML = origHtml;
            btn.disabled = false;
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

    // Listeners para filtros de estado en equipos
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

    // Vaciar inventario
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
                    inventoryData.length = 0;
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
});
