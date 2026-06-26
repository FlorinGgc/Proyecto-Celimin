const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const items = [
    // ZONA F - Usado
    { name: "Acido sulfurico", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "licH", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "acido oxálico dihidrato", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "acido clorihidrico", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "acido orto fosforico 250g x2", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "acido sulfurico", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "acido cloridrico fumante 500g x 1", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "Phosphoric acid 250g", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "Naoh 250g", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "Hidroxido litio monohidratado 250g", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "magnesio hidrato hexahidrato", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },
    { name: "Cal Viva - CaO", category: "Reactivos", location_detail: "Zona F", state: "Usado", stock_actual: 1, stock_min: 1 },

    // ZONA G - Nuevo
    { name: "acido sulfurico", category: "Reactivos", location_detail: "Zona G", state: "Nuevo", stock_actual: 1, stock_min: 1 },
    { name: "LicH", category: "Reactivos", location_detail: "Zona G", state: "Nuevo", stock_actual: 1, stock_min: 1 },
    { name: "lIOH", category: "Reactivos", location_detail: "Zona G", state: "Nuevo", stock_actual: 1, stock_min: 1 },
    { name: "Etilenoglicol", category: "Reactivos", location_detail: "Zona G", state: "Nuevo", stock_actual: 1, stock_min: 1 },
    { name: "LiCl", category: "Reactivos", location_detail: "Zona G", state: "Nuevo", stock_actual: 1, stock_min: 1 },
    { name: "Acido Oxalico dihidrato", category: "Reactivos", location_detail: "Zona G", state: "Nuevo", stock_actual: 1, stock_min: 1 },
    { name: "acido clorhidrico", category: "Reactivos", location_detail: "Zona G", state: "Nuevo", stock_actual: 1, stock_min: 1 },
    { name: "acido orto fosforico 250g x1", category: "Reactivos", location_detail: "Zona G", state: "Nuevo", stock_actual: 1, stock_min: 1 },
    { name: "Magnesium hydroxide 250 g", category: "Reactivos", location_detail: "Zona G", state: "Nuevo", stock_actual: 1, stock_min: 1 },

    // ZONA H - Abierto
    { name: "acido cloridrico fumante 500g x 1", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "Phosphoric acid 250g", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "Lio 1m 250g", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "NaOH 250g", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "ammomonoium hydroxide Solution x1", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "Hidroxido litio monohidratado 250g", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "Magnesio hidrato hexahidrato", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "nafion ion - Exchange resin 20", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "solución recup síntesis Mn", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "Diethylene glicol", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "Srm4", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "Cal Viva - CaO", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 },
    { name: "Magnesium hydroxide 250 g", category: "Reactivos", location_detail: "Zona H", state: "Abierto", stock_actual: 1, stock_min: 1 }
];

async function run() {
    const { data, error } = await supabase.from('inventory').insert(items);
    if (error) {
        console.error("Error inserting items:", error);
    } else {
        console.log("Items inserted successfully!", data);
    }
}

run();
