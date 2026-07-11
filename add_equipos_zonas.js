const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const baseEquipments = [
    { name: "Mettler Toledo", location_detail: "Zona A", responsible: null },
    { name: "Kern", location_detail: "Zona A", responsible: null },
    { name: "1A RH basic 2", location_detail: "Zona B", responsible: null },
    { name: "Nabertherm x3", location_detail: "Zona B", responsible: null },
    { name: "Cientec instrumentos científicos S.A", location_detail: "Zona D", responsible: null },
    { name: "Ika Rw20 digital", location_detail: "Zona D", responsible: null },
    { name: "Lauda  E100", location_detail: "Zona E", responsible: null },
    { name: "Mezclador PMC100", location_detail: "Zona E", responsible: null },
    { name: "Hanna instrumments", location_detail: "Zona F", responsible: "mirko" },
    { name: "Hanna instrumments", location_detail: "Zona F", responsible: "Mario" },
    { name: "Hanna instrumments", location_detail: "Zona G", responsible: "Alonso" },
    { name: "Lauda Ecoline Staredition RE107", location_detail: "Zona G", responsible: null },
    { name: "Qsonica sonicators", location_detail: "Zona H", responsible: null },
    { name: "Campana de Extracion", location_detail: "Zona H", responsible: null },
    { name: "Mezclador 220v", location_detail: "Zona I", responsible: null },
    { name: "Elmasonic P", location_detail: "Zona I", responsible: null },
    { name: "Incitec", location_detail: "Zona K", responsible: null },
    { name: "Secador a Vacio", location_detail: "Zona K", responsible: null }
];

const equipmentsToInsert = baseEquipments.map(eq => ({
    name: eq.name,
    category: "Equipos",
    location_detail: eq.location_detail,
    responsible: eq.responsible,
    stock_actual: 8,
    stock_min: 1,
    format: "n/a",
    state: "disponibles",
    expiry_date: "2027-12-31",
    status: "ok",
    in_use: false
}));

async function run() {
    console.log(`Inserting ${equipmentsToInsert.length} equipments...`);
    const { data: insertedItems, error } = await supabase
        .from('inventory')
        .insert(equipmentsToInsert)
        .select();

    if (error) {
        console.error("Error inserting equipments:", error);
        return;
    }

    console.log(`Inserted ${insertedItems.length} equipments. Now linking to lab L2...`);

    const labLinks = insertedItems.map(item => ({
        inventory_id: item.id,
        lab_id: 'L2'
    }));

    const { error: linkError } = await supabase
        .from('inventory_labs')
        .insert(labLinks);

    if (linkError) {
        console.error("Error linking labs:", linkError);
    } else {
        console.log("Successfully inserted and linked all equipment items.");
    }
}

run();
