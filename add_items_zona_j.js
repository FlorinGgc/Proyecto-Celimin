const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const baseItems = [
    { name: "Material para corrosión", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Cables", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "frasco 300Ml autoLab", category: "Vidriería", format: "300ml", stock_actual: 6 },
    { name: "Dumy Cell", category: "Equipos", format: "n/a", stock_actual: 6 },
    { name: "Manual software", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Eletrodo de platino", category: "Equipos", format: "n/a", stock_actual: 6 },
    { name: "Eletrodo de Ag / agCl", category: "Equipos", format: "n/a", stock_actual: 6 },
    { name: "AutoLab moto Controller", category: "Equipos", format: "n/a", stock_actual: 6 },
    { name: "Frasco 600ml", category: "Vidriería", format: "600ml", stock_actual: 6 },
    { name: "Frasco Delgado de 50ml", category: "Vidriería", format: "50ml", stock_actual: 6 },
    { name: "Frasco 100ml", category: "Vidriería", format: "100ml", stock_actual: 6 },
    { name: "Frasco 100ml", category: "Vidriería", format: "100ml", stock_actual: 6 },
    { name: "Frasco 250ml", category: "Vidriería", format: "250ml", stock_actual: 6 },
    { name: "Frasco 250ml", category: "Vidriería", format: "250ml", stock_actual: 6 },
    { name: "Frasco 250ml", category: "Vidriería", format: "250ml", stock_actual: 6 },
    { name: "Frasco 1000ml", category: "Vidriería", format: "1000ml", stock_actual: 6 },
    { name: "Winatec Batería", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Frasco 5000ml", category: "Vidriería", format: "5000ml", stock_actual: 6 },
    { name: "Frasco 100ml", category: "Vidriería", format: "100ml", stock_actual: 6 },
    { name: "Frasco 1000mlln", category: "Vidriería", format: "1000ml", stock_actual: 6 },
    { name: "Barras magnéticas lisa", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "Barras magnéticas lisa 10 x 6mm KSL boe110610", category: "Consumibles", format: "10 x 6mm", stock_actual: 6 },
    { name: "Barras magnéticas lisa  40 x 7 mm KSL boe 1-0740", category: "Consumibles", format: "40 x 7 mm", stock_actual: 6 },
    { name: "Barras magnéticas lisa  25 x 6 mm KSL boe 110625", category: "Consumibles", format: "25 x 6 mm", stock_actual: 6 },
    { name: "Barras magnéticas lisa  20 x 6 mm KSL 115620", category: "Consumibles", format: "20 x 6 mm", stock_actual: 6 },
    { name: "Barras magnéticas lisa  30 x 7 mm KSL 110730", category: "Consumibles", format: "30 x 7 mm", stock_actual: 6 },
    { name: "Volumetric pipette as 25ml", category: "Vidriería", format: "25ml", stock_actual: 6 },
    { name: "Anteojos  de seguridad Atox", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Cartucho contra vapores x 5", category: "Consumibles", format: "x 5", stock_actual: 5 },
    { name: "Soft Annealed  copper tuve", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "Pressure Boost PUMP", category: "Equipos", format: "n/a", stock_actual: 6 },
    { name: "Evapor Flask 300ml", category: "Vidriería", format: "300ml", stock_actual: 6 },
    { name: "Obsah/contents 1/PK x2", category: "Otros", format: "x 2", stock_actual: 2 },
    { name: "Frasco 1000Mil", category: "Vidriería", format: "1000ml", stock_actual: 6 },
    { name: "Caja  Cuarzo Fragil", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Connection Cable", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "vapor Dust", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "pH electrode hanna Momments", category: "Equipos", format: "n/a", stock_actual: 6 },
    { name: "Ph metro Metrohm", category: "Equipos", format: "n/a", stock_actual: 6 },
    { name: "Metrohm Electrodo de Referencia", category: "Equipos", format: "n/a", stock_actual: 6 },
    { name: "Hi70825 15m KCI reference electrode fill Solution", category: "Reactivos", format: "15ml", stock_actual: 6 },
    { name: " Hi703000 Storage Solution For pH and ORP electrodes x2", category: "Reactivos", format: "x 2", stock_actual: 2 },
    { name: "Electrode Quality Certificate", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Electro de posición de Cobre", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Membrane clamp Tx25 Tx10", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "Shrane hose 3m", category: "Consumibles", format: "3m", stock_actual: 6 },
    { name: "Gasket Wd-26 - Seal 1pcs", category: "Consumibles", format: "1pcs", stock_actual: 1 },
    { name: "Set to controller 1pcs", category: "Otros", format: "1pcs", stock_actual: 1 },
    { name: "Ceys Total Cech 125ml", category: "Reactivos", format: "125ml", stock_actual: 6 },
    { name: "Acero Oxidable", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Material para  Electrodo", category: "Otros", format: "n/a", stock_actual: 6 }
];

const itemsToInsert = baseItems.map(item => ({
    name: item.name,
    category: item.category,
    format: item.format,
    stock_actual: item.stock_actual,
    stock_min: 1,
    location_detail: "Zona J",
    state: "disponibles",
    expiry_date: "2027-12-31",
    status: "ok",
    in_use: false
}));

async function run() {
    console.log(`Inserting ${itemsToInsert.length} items for Zona J...`);
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
        lab_id: 'LPSL'
    }));

    const { error: linkError } = await supabase
        .from('inventory_labs')
        .insert(labLinks);

    if (linkError) {
        console.error("Error linking labs:", linkError);
    } else {
        console.log("Successfully inserted and linked all items for Zona J.");
    }
}

run();
