const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    console.log("Ensuring lab LMAB exists in 'labs' table...");
    const { data: existingLabs } = await supabase.from('labs').select('*');
    const lmabLab = existingLabs ? existingLabs.find(l => l.id === 'LMAB') : null;
    
    if (!lmabLab) {
        await supabase.from('labs').insert([{
            id: 'LMAB',
            name: 'Laboratorio de Materiales Avanzado de Litio y Baterias',
            location: 'Galpon Piso 1'
        }]);
    } else if (lmabLab.name !== 'Laboratorio de Materiales Avanzado de Litio y Baterias') {
        await supabase.from('labs').update({
            name: 'Laboratorio de Materiales Avanzado de Litio y Baterias'
        }).eq('id', 'LMAB');
    }

    const lpslLab = existingLabs ? existingLabs.find(l => l.id === 'LPSL') : null;
    if (!lpslLab) {
        await supabase.from('labs').insert([{
            id: 'LPSL',
            name: 'Laboratorio de Procesos Sustentables de Litio y Minerales Industriales',
            location: 'Galpon Piso 1'
        }]);
    } else if (lpslLab.name !== 'Laboratorio de Procesos Sustentables de Litio y Minerales Industriales') {
        await supabase.from('labs').update({
            name: 'Laboratorio de Procesos Sustentables de Litio y Minerales Industriales'
        }).eq('id', 'LPSL');
    }

    console.log("Fetching all inventory items...");
    const { data: items, error } = await supabase.from('inventory').select('id, location_detail');
    if (error) {
        console.error("Error fetching items:", error);
        return;
    }

    console.log(`Processing ${items.length} inventory items for lab linking...`);

    // Delete existing links in inventory_labs
    await supabase.from('inventory_labs').delete().neq('inventory_id', '00000000-0000-0000-0000-000000000000');

    const newLinks = [];
    items.forEach(item => {
        const loc = (item.location_detail || '').toUpperCase();
        // Check letter in Zona X
        const match = loc.match(/ZONA\s+([A-R])/);
        let labId = 'LPSL';
        if (match) {
            const letter = match[1];
            if (letter >= 'K' && letter <= 'R') {
                labId = 'LMAB';
            }
        }
        newLinks.push({
            inventory_id: item.id,
            lab_id: labId
        });
    });

    const { error: insertError } = await supabase.from('inventory_labs').insert(newLinks);
    if (insertError) {
        console.error("Error updating inventory_labs:", insertError);
    } else {
        console.log(`Successfully updated ${newLinks.length} lab relationships!`);
    }
}

run();
