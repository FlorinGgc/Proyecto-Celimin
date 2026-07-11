const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const baseItems = [
    { name: "Pipet Lite XLS", format: "n/a", category: "Consumibles" },
    { name: "BiocleanUltra 300Ul Pipette tips in hinged racks", format: "300ul", category: "Consumibles" },
    { name: "Magnesio nitrato Hexahidrato", format: "n/a", category: "Reactivos" },
    { name: "Acido Borico", format: "n/a", category: "Reactivos" },
    { name: "Calcio Cloruro diidrato 1kg", format: "1kg", category: "Reactivos" },
    { name: "Buffer Solution 500ml", format: "500ml", category: "Reactivos" },
    { name: "Hi 7039 500ml", format: "500ml", category: "Reactivos" },
    { name: "Hi 7039 500ml", format: "500ml", category: "Reactivos" },
    { name: "Storage Solution for ph and orp electrodes 500ml", format: "500ml", category: "Reactivos" },
    { name: "Hi7035 conducivity standard Solution hi 7035", format: "n/a", category: "Reactivos" },
    { name: "HI 70300 Storage  Solution for ph and  orp electodes 500ml", format: "500ml", category: "Reactivos" },
    { name: "HI 7033L 500ml", format: "500ml", category: "Reactivos" },
    { name: "Hi 7034 conductivity standard Solution 500ml", format: "500ml", category: "Reactivos" },
    { name: "Cleaning Solution for Ph and orp electrodes 500ml", format: "500ml", category: "Reactivos" },
    { name: "Certified Solution", format: "n/a", category: "Reactivos" },
    { name: "HI7007 buffer Solution", format: "n/a", category: "Reactivos" }
];

const itemsToInsert = baseItems.map(item => ({
    name: item.name,
    category: item.category,
    format: item.format,
    stock_actual: 6,
    stock_min: 1,
    location_detail: "Zona A",
    state: "disponibles",
    expiry_date: "2027-12-31"
}));

async function run() {
    console.log("Inserting items...");
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
        console.log("Successfully inserted and linked all items for Zona A.");
    }
}

run();
