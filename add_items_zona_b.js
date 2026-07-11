const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const baseItems = [
    { name: "sol conductividad 111800 us/cm 500ml", format: "500ml", category: "Reactivos" },
    { name: "Desp,turbus norte Grande Xv,I,II hasta10kg", format: "10kg", category: "Otros" },
    { name: "1mb AHA A.sssy", format: "n/a", category: "Consumibles" },
    { name: "1mb cmb Hth ew", format: "n/a", category: "Consumibles" },
    { name: "Nafion", format: "n/a", category: "Reactivos" },
    { name: "1mb cmb New", format: "n/a", category: "Consumibles" },
    { name: "Brand QmBh + Co kg", format: "n/a", category: "Consumibles" },
    { name: "Tubing Connectors", format: "n/a", category: "Consumibles" },
    { name: "Silver trace metals Basis wire Diam", format: "n/a", category: "Reactivos" },
    { name: "Brand tubing adapter Pe-HD For tub", format: "n/a", category: "Consumibles" },
    { name: "Corning Disposable pasteur pipettes", format: "n/a", category: "Consumibles" },
    { name: "Hanna Instruments", format: "n/a", category: "Equipos" },
    { name: "Silver Wire Diam", format: "n/a", category: "Reactivos" }
];

const itemsToInsert = baseItems.map(item => ({
    name: item.name,
    category: item.category,
    format: item.format,
    stock_actual: 6,
    stock_min: 1,
    location_detail: "Zona B",
    state: "disponibles",
    expiry_date: "2027-12-31"
}));

async function run() {
    console.log("Inserting items for Zona B...");
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
        console.log("Successfully inserted and linked all items for Zona B.");
    }
}

run();
