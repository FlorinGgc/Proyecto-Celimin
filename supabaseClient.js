// =============================================================================
// SUPABASE CLIENT INIT & DB SYNC
// =============================================================================

// Reemplazar en un entorno de producción seguro o mediante build step
// Para modo de desarrollo estático, leemos las variables directamente o usamos placeholders temporales

let supabaseClient;
try {
    const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
} catch (e) {
    console.error("Error initializing Supabase client:", e);
}

window.dbSync = {
    // ---- INITIAL LOAD ALL DATA ----
    async loadAllData() {
        console.log("Cargando datos desde Supabase...");
        try {
            const [
                labsRes, invRes, usersRes, mvRes, reqRes, 
                agRes, planRes, mantRes, turnosRes, audRes, libRes
            ] = await Promise.all([
                supabaseClient.from('labs').select('*'),
                supabaseClient.from('inventory').select('*, inventory_labs(lab_id)'),
                supabaseClient.from('users').select('*'),
                supabaseClient.from('movements').select('*'),
                supabaseClient.from('requests').select('*'),
                supabaseClient.from('agenda').select('*'),
                supabaseClient.from('planificacion').select('*'),
                supabaseClient.from('mantenimiento').select('*'),
                supabaseClient.from('turnos').select('*'),
                supabaseClient.from('auditoria').select('*'),
                supabaseClient.from('library_docs').select('*')
            ]);

            return {
                labs: labsRes.data || [],
                inventory: (invRes.data || []).map(item => ({
                    ...item,
                    stockActual: item.stock_actual,
                    stockMin: item.stock_min,
                    locationDetail: item.location_detail,
                    expiryDate: item.expiry_date,
                    reactDate: item.react_date,
                    inUse: item.in_use,
                    labs: item.inventory_labs ? item.inventory_labs.map(l => l.lab_id) : []
                })),
                users: usersRes.data || [],
                movements: (mvRes.data || []).map(m => ({ ...m, user: m.user_name })),
                requests: (reqRes.data || []).map(r => ({ ...r, user: r.user_name })),
                agenda: (agRes.data || []).map(a => ({
                    ...a,
                    horaInicio: a.hora_inicio,
                    horaFin: a.hora_fin,
                    hora: (a.hora_inicio && a.hora_fin) ? `${a.hora_inicio.slice(0,5)} - ${a.hora_fin.slice(0,5)}` : ''
                })),
                planificacion: planRes.data || [],
                mantenimiento: mantRes.data || [],
                turnos: turnosRes.data || [],
                auditoria: audRes.data || [],
                library_docs: (libRes.data || []).map(d => ({ ...d, user: d.user_name }))
            };
        } catch (error) {
            console.error("Error crítico cargando base de datos:", error);
            alert("No se pudo establecer conexión con Supabase. Revise sus credenciales o su conexión a internet.");
            throw error;
        }
    },

    // ---- LABS ----
    async saveLab(lab, isNew = false) {
        if (isNew) {
            return await supabaseClient.from('labs').insert([lab]);
        } else {
            return await supabaseClient.from('labs').update({ name: lab.name, location: lab.location }).eq('id', lab.id);
        }
    },
    async deleteLab(id) {
        return await supabaseClient.from('labs').delete().eq('id', id);
    },

    // ---- INVENTORY ----
    async saveInventoryItem(item, isNew = false) {
        const payload = {
            code: item.code,
            name: item.name,
            category: item.category,
            stock_actual: item.stockActual,
            stock_min: item.stockMin,
            unit: item.unit,
            location_detail: item.locationDetail,
            expiry_date: item.expiryDate || null,
            format: item.format,
            state: item.state,
            react_date: item.reactDate || null,
            comments: item.comments,
            supplier: item.supplier,
            responsible: item.responsible,
            status: item.status,
            in_use: item.inUse || false
        };

        let savedId = item.id;

        if (isNew) {
            // Generar UUID internamente o dejar que Supabase lo haga
            const { data, error } = await supabaseClient.from('inventory').insert([payload]).select('id').single();
            if (error) throw error;
            savedId = data.id;
        } else {
            const { error } = await supabaseClient.from('inventory').update(payload).eq('id', item.id);
            if (error) throw error;
        }

        // Actualizar relaciones con labs (eliminar viejas e insertar nuevas)
        if (!isNew) {
            await supabaseClient.from('inventory_labs').delete().eq('inventory_id', savedId);
        }
        
        if (item.labs && item.labs.length > 0) {
            const rels = item.labs.map(labId => ({ inventory_id: savedId, lab_id: labId }));
            await supabaseClient.from('inventory_labs').insert(rels);
        }
        
        return savedId;
    },
    async deleteInventoryItem(id) {
        return await supabaseClient.from('inventory').delete().eq('id', id);
    },
    async updateInventoryStock(id, newStock, newStatus) {
        return await supabaseClient.from('inventory').update({ stock_actual: newStock, status: newStatus }).eq('id', id);
    },
    async toggleEquipmentInUse(id, inUse) {
        return await supabaseClient.from('inventory').update({ in_use: inUse }).eq('id', id);
    },

    // ---- USERS ----
    async saveUser(user, isNew = false) {
        if (isNew) {
            return await supabaseClient.from('users').insert([{
                name: user.name,
                role: user.role,
                permissions: user.permissions,
                last_access: user.lastAccess,
                active: user.active
            }]);
        } else {
            return await supabaseClient.from('users').update({
                name: user.name,
                role: user.role,
                permissions: user.permissions
            }).eq('id', user.id);
        }
    },
    async deleteUser(id) {
        return await supabaseClient.from('users').delete().eq('id', id);
    },
    async updateUserAccess(name, timeStr) {
        return await supabaseClient.from('users').update({ last_access: timeStr }).eq('name', name);
    },

    // ---- MOVEMENTS ----
    async insertMovement(mv) {
        return await supabaseClient.from('movements').insert([{
            id: mv.id,
            type: mv.type,
            item: mv.item,
            qty: mv.qty,
            user_name: mv.user,
            target: mv.target,
            date: mv.date,
            time: mv.time
        }]);
    },
    async deleteMovement(id) {
        return await supabaseClient.from('movements').delete().eq('id', id);
    },
    async clearMovements() {
        // Precaución: Borrar todos los datos de la tabla. En producción se suele hacer un borrado suave o restringir esto.
        // Como Supabase prohíbe eliminar sin filtro por defecto si RLS está activado, asumo RLS descativado.
        const { error } = await supabaseClient.from('movements').delete().neq('id', '000');
        return { error };
    },

    // ---- REQUESTS ----
    async saveRequest(req, isNew = false) {
        if (isNew) {
            return await supabaseClient.from('requests').insert([{
                id: req.id,
                user_name: req.user,
                item: req.item,
                qty: req.qty,
                date: req.date,
                status: req.status
            }]);
        } else {
            return await supabaseClient.from('requests').update({ status: req.status }).eq('id', req.id);
        }
    },
    async deleteRequest(id) {
        return await supabaseClient.from('requests').delete().eq('id', id);
    },
    async clearRequests() {
        const { error } = await supabaseClient.from('requests').delete().neq('id', '000');
        return { error };
    },

    // ---- AGENDA ----
    async saveAgenda(item, isNew = false) {
        const payload = {
            titulo: item.titulo,
            fecha: item.fecha,
            insumos: item.insumos,
            equipo: item.equipo,
            responsable: item.responsable,
            type: item.type,
            hora_inicio: item.horaInicio || null,
            hora_fin: item.horaFin || null
        };
        
        if (isNew) {
            return await supabaseClient.from('agenda').insert([payload]);
        } else {
            return await supabaseClient.from('agenda').update(payload).eq('id', item.id);
        }
    },
    async deleteAgenda(id) {
        return await supabaseClient.from('agenda').delete().eq('id', id);
    },
    async clearAgenda() {
        const { error } = await supabaseClient.from('agenda').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        return { error };
    },

    // ---- PLANIFICACION ----
    async savePlanificacion(plan, isNew = false) {
        const payload = {
            item: plan.item,
            usuario: plan.usuario,
            fecha: plan.fecha,
            completado: plan.completado || false
        };

        if (isNew) {
            return await supabaseClient.from('planificacion').insert([payload]);
        } else {
            return await supabaseClient.from('planificacion').update(payload).eq('id', plan.id);
        }
    },
    async deletePlanificacion(id) {
        return await supabaseClient.from('planificacion').delete().eq('id', id);
    },
    async clearPlanificacion() {
        const { error } = await supabaseClient.from('planificacion').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        return { error };
    },

    // ---- MANTENIMIENTO ----
    async insertMantenimiento(mant) {
        return await supabaseClient.from('mantenimiento').insert([{
            equipo: mant.equipo,
            fecha: mant.fecha,
            hora: mant.hora,
            tipo: mant.tipo,
            obs: mant.obs
        }]);
    },

    // ---- TURNOS ----
    async insertTurno(turno) {
        return await supabaseClient.from('turnos').insert([{
            laboratorio: turno.laboratorio,
            jefe: turno.jefe,
            semana: turno.semana,
            mes: turno.mes
        }]);
    },

    // ---- AUDITORIA ----
    async saveAuditoria(aud, isNew = false) {
        const payload = {
            item: aud.item,
            usuario: aud.usuario,
            cantidad: aud.cantidad,
            fecha: aud.fecha,
            comentario: aud.comentario,
            checked: aud.checked || false
        };

        if (isNew) {
            return await supabaseClient.from('auditoria').insert([payload]);
        } else {
            return await supabaseClient.from('auditoria').update(payload).eq('id', aud.id);
        }
    },

    // ---- LIBRARY ----
    async insertLibraryDoc(doc) {
        return await supabaseClient.from('library_docs').insert([{
            id: doc.id,
            title: doc.title,
            description: doc.desc,
            file_name: doc.fileName,
            file_url: doc.fileData, // Idealmente esto debería apuntar a Storage
            date: doc.date,
            size: doc.size,
            user_name: doc.user
        }]);
    },
    async deleteLibraryDoc(id) {
        return await supabaseClient.from('library_docs').delete().eq('id', id);
    }
};
