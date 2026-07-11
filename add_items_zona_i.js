const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const baseItems = [
    { name: "Vasos de Vidrio AutoLab", category: "Vidriería", format: "n/a", stock_actual: 6 },
    { name: "Set Anschluss Controller Methorm x2", category: "Equipos", format: "x 2", stock_actual: 2 },
    { name: "Gasket Sealant", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "Silencer 05 1pcs", category: "Consumibles", format: "1pcs", stock_actual: 1 },
    { name: "Zubehor accesory", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Set of bent Hose nipple (3pcs )", category: "Consumibles", format: "3pcs", stock_actual: 3 },
    { name: "Thermometer PCE-T390", category: "Equipos", format: "n/a", stock_actual: 6 },
    { name: "Vacuum seal Vs-26 x2", category: "Consumibles", format: "x 2", stock_actual: 2 },
    { name: "PTFE base , NBR O-Ring FDA-cc x2", category: "Consumibles", format: "x 2", stock_actual: 2 },
    { name: "membrane clamp incl. torx wrench Tx25 Tx10", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "Silencer attached at the back of the pump", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "Screwing Set", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "Hose Barbs and  Seals Gl14", category: "Consumibles", format: "Gl14", stock_actual: 6 },
    { name: "Tuving Natural rubber 06/16mm x2", category: "Consumibles", format: "x 2", stock_actual: 2 },
    { name: "Sagar Panwar 15 simples Cot 0112-026", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Lanco Silicona Alta Temperatura", category: "Consumibles", format: "n/a", stock_actual: 6 },
    { name: "Ph 7.000 calibration Solution Safety Datasheet", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Mariene 5ml", category: "Otros", format: "5ml", stock_actual: 6 },
    { name: "Mariene 10ml", category: "Otros", format: "10ml", stock_actual: 6 },
    { name: "Marzu Lamina de  de Cobre 20 X30", category: "Otros", format: "20 X30", stock_actual: 6 },
    { name: "Ph-Fix 0-14 PT", category: "Consumibles", format: "0-14 pH", stock_actual: 6 },
    { name: "Density Bottle Calibrated 10ml", category: "Vidriería", format: "10ml", stock_actual: 6 },
    { name: "Buchert Rosas y Cia.LTDA.", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Frasco 250ml", category: "Vidriería", format: "250ml", stock_actual: 6 },
    { name: "Frasco 250ml", category: "Vidriería", format: "250ml", stock_actual: 6 },
    { name: "Broken Thermometers", category: "Otros", format: "n/a", stock_actual: 6 },
    { name: "Frasquito 2ml De-m24", category: "Vidriería", format: "2ml", stock_actual: 6 },
    { name: "Frasco 2000Ml  Medilda", category: "Vidriería", format: "2000ml", stock_actual: 6 },
    { name: "Frasco 100Ml  Medilda", category: "Vidriería", format: "100ml", stock_actual: 6 },
    { name: "Frasco 250ml  Medilda", category: "Vidriería", format: "250ml", stock_actual: 6 },
    { name: "Frasco 500ml  RyFex", category: "Vidriería", format: "500ml", stock_actual: 6 },
    { name: "Frasco medio HCL 800ML", category: "Vidriería", format: "800ml", stock_actual: 6 },
    { name: "Frasco 1000ml Duran", category: "Vidriería", format: "1000ml", stock_actual: 6 },
    { name: "Frasco 1000Ml  Duran", category: "Vidriería", format: "1000ml", stock_actual: 6 },
    { name: "Frasco 50Ml  Duran", category: "Vidriería", format: "50ml", stock_actual: 6 },
    { name: "Frasco 250Ml Ns24/40", category: "Vidriería", format: "250ml", stock_actual: 6 },
    { name: "Frasco 50ml bioquímica Boro 3,3", category: "Vidriería", format: "50ml", stock_actual: 6 },
    { name: "Frasco 1000Ml  Duran", category: "Vidriería", format: "1000ml", stock_actual: 6 },
    { name: "Frasco 250Ml  ILMaBOR TGI", category: "Vidriería", format: "250ml", stock_actual: 6 },
    { name: "Frasco 250Ml  Duran", category: "Vidriería", format: "250ml", stock_actual: 6 },
    { name: "Frasco 400Ml  Duran", category: "Vidriería", format: "400ml", stock_actual: 6 }
];

const itemsToInsert = baseItems.map(item => ({
    name: item.name,
    category: item.category,
    format: item.format,
    stock_actual: item.stock_actual,
    stock_min: 1,
    location_detail: "Zona I",
    state: "disponibles",
    expiry_date: "2027-12-31",
    status: "ok",
    in_use: false
}));

async function run() {
    console.log(`Inserting ${itemsToInsert.length} items for Zona I...`);
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
        console.log("Successfully inserted and linked all items for Zona I.");
    }
}

run();
