const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rawItems = [
    // Zona M
    { name: "Caja de accesorios MACCOR", zone: "Zona M" },
    { name: "Caja Potensiostato", zone: "Zona M" },
    { name: "Otras baterías", zone: "Zona M" },
    { name: "Caja de baterías nuevas", zone: "Zona M" },

    // Zona N
    { name: "Caja de cables y conecciones", zone: "Zona N" },
    { name: "Caja con repuestos de MACCOR", zone: "Zona N" },
    { name: "Guantes MBraun", zone: "Zona N" },
    { name: "Caja de guantes MTI", zone: "Zona N" },
    { name: "Pantalla - Caja de guantes MTI", zone: "Zona N" },
    { name: "Panel de circuito soldador ultrasónico", zone: "Zona N" },
    { name: "Residuos baterías pouch", zone: "Zona N" },
    { name: "Caja soportes celdas coin", zone: "Zona N" },

    // Zona O
    { name: "Caja de lubricantes", zone: "Zona O" },
    { name: "Caja separadores", zone: "Zona O" },
    { name: "Caja de herramientas", zone: "Zona O" },
    { name: "Caja de elementos EPP", zone: "Zona O" },
    { name: "Regulador", zone: "Zona O" },
    { name: "Carcasas Li-Aire", zone: "Zona O" },
    { name: "Alambre y cobre sobrante", zone: "Zona O" },
    { name: "Plástico sobrante", zone: "Zona O" },
    { name: "Metales sobrantes", zone: "Zona O" },
    { name: "Caja de tornillos", zone: "Zona O" },
    { name: "Bolsa con lijas", zone: "Zona O" },
    { name: "Caja de repuestos", zone: "Zona O" },

    // Zona P
    { name: "Sonda de ultrasonido", zone: "Zona P" },
    { name: "Caja de mangueras", zone: "Zona P" },
    { name: "Accesorios compresor", zone: "Zona P" },
    { name: "Conexiones mangueras", zone: "Zona P" },
    { name: "Frascos con residuos liq-sol", zone: "Zona P" },
    { name: "Caja de muestras N°1", zone: "Zona P" },
    { name: "Caja de muestras N°2", zone: "Zona P" },
    { name: "Caja de muestras N°3", zone: "Zona P" },
    { name: "Caja de muestras N°4", zone: "Zona P" },
    { name: "Caja de muestras N°5", zone: "Zona P" },
    { name: "Caja de muestras N°6", zone: "Zona P" },
    { name: "Caja de materiales para armar puch", zone: "Zona P" },
    { name: "Porta frascos", zone: "Zona P" },
    { name: "Caja sobras Cu-Al", zone: "Zona P" },
    { name: "Caja de residuos", zone: "Zona P" },

    // Zona Q
    { name: "Caja herramientas negra", zone: "Zona Q" },
    { name: "Cesta blanca", zone: "Zona Q" },
    { name: "Vaso rojo utensilios", zone: "Zona Q" },
    { name: "Vaso rojo lápices", zone: "Zona Q" },
    { name: "Caja de frascos", zone: "Zona Q" }
];

async function run() {
    console.log(`Preparing ${rawItems.length} items to insert into Supabase...`);

    const itemsToInsert = rawItems.map(item => ({
        name: item.name,
        category: "Equipos y Accesorios",
        location_detail: item.zone,
        stock_actual: 1,
        stock_min: 1,
        format: "n/a",
        state: "disponibles",
        expiry_date: "2027-12-31",
        status: "ok"
    }));

    const { data: insertedItems, error } = await supabase
        .from('inventory')
        .insert(itemsToInsert)
        .select();

    if (error) {
        console.error("Error inserting items into Supabase:", error);
        return;
    }

    console.log(`Inserted ${insertedItems.length} items. Now linking to LMAB lab...`);

    const labLinks = insertedItems.map(item => ({
        inventory_id: item.id,
        lab_id: 'LMAB'
    }));

    const { error: linkError } = await supabase
        .from('inventory_labs')
        .insert(labLinks);

    if (linkError) {
        console.error("Error linking to LMAB:", linkError);
    } else {
        console.log("Successfully inserted and linked all items to LMAB.");
    }
}

run();
