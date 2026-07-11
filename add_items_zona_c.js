const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const baseItems = [
    { name: "3,5M Electrodos", format: "n/a", category: "Consumibles" },
    { name: "Solucion de ph 1,68 460ml", format: "460ml", category: "Reactivos" },
    { name: "solución de ph 4,01 - Bt460mL", format: "460ml", category: "Reactivos" },
    { name: "solución de ph 7,01 Bot 460ml", format: "460ml", category: "Reactivos" },
    { name: "solución de Ph 10,01 bot 500ml", format: "500ml", category: "Reactivos" },
    { name: "solución de limpieza electrodos de pH", format: "n/a", category: "Reactivos" },
    { name: "solución de almacenamiento electrodos 500ml", format: "500ml", category: "Reactivos" },
    { name: "sol conductividad 84 us/cm / 500 ml", format: "500ml", category: "Reactivos" },
    { name: "sol conductividad 5000 us/cm 500ml", format: "500ml", category: "Reactivos" },
    { name: "sol conductividad 80.000 Us/cm 500ml", format: "500ml", category: "Reactivos" }
];

const itemsToInsert = baseItems.map(item => ({
    name: item.name,
    category: item.category,
    format: item.format,
    stock_actual: 6,
    stock_min: 1,
    location_detail: "Zona C",
    state: "disponibles",
    expiry_date: "2027-12-31"
}));

async function run() {
    console.log("Inserting items for Zona C...");
    const { data: insertedItems, error } = await supabase
        .from('inventory')
        .insert(itemsToInsert)
        .select();

    if (error) {
        console.error("Error inserting items:", error);
        return;
    }

    console.log(`Inserted ${insertedItems.length} items. Now linking to lab L2...`);

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
        console.log("Successfully inserted and linked all items for Zona C.");
    }
}

run();
