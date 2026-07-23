const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const itemsToInsertRaw = [
    { name: "Iron (II) sulfate heptahydrate", unit: "250 g", total: 3, nueva: 2, supplier: "SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Iron (II) sulfate heptahydrate", unit: "1000 g", total: 1, nueva: 1, supplier: "Supelco", zone: "Zona Q" },
    { name: "Magnesium chloride hexahydrate", unit: "1000 g", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "Ethylene carbonate", unit: "500 g", total: 4, nueva: 2, supplier: "SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Ammonia solution 25%", unit: "2500 ml", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "Ammonia solution 25%", unit: "2500 ml", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "di-Ammonium hydrogen phosphate", unit: "500 g", total: 2, nueva: 2, supplier: "Merck", zone: "Zona Q" },
    { name: "Nickel (II) acetate tetrahydrate", unit: "250 g", total: 4, nueva: 3, supplier: "ALDRICH", zone: "Zona Q" },
    { name: "Isopropyl alcohol", unit: "500 ml", total: 1, nueva: 0, supplier: "SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Lithium acetate dihydrate", unit: "250 g", total: 3, nueva: 2, supplier: "SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Lithium carbonate", unit: "500 g", total: 2, nueva: 1, supplier: "SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Manganese (II) acetate tetrahydrate", unit: "250 g", total: 3, nueva: 2, supplier: "SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Manganese (II) acetate tetrahydrate (Chino)", unit: "500 g", total: 2, nueva: 1, supplier: "CHEMICAL REAGENT", zone: "Zona Q" },
    { name: "Sodium hydroxide (pellets)", unit: "1000 g", total: 2, nueva: 1, supplier: "Merck", zone: "Zona Q" },
    { name: "Cobalt (II) acetate tetrahydrate", unit: "1000 g", total: 3, nueva: 1, supplier: "SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Magnesium hydroxide", unit: "250 g", total: 2, nueva: 2, supplier: "SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Magnesium hydroxide", unit: "250 g", total: 1, nueva: 0, supplier: "Fluka Analytical / SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Manganese (II) sulfate monohydrate", unit: "250 g", total: 2, nueva: 1, supplier: "Supelco", zone: "Zona Q" },
    { name: "Zirconium (IV) oxide", unit: "100 g", total: 2, nueva: 1, supplier: "ALDRICH", zone: "Zona Q" },
    { name: "Tetraethylene glycol dimethyl ether", unit: "250 g", total: 1, nueva: 1, supplier: "ALDRICH", zone: "Zona Q" },
    { name: "Sodium carbonate", unit: "1000 g", total: 1, nueva: 1, supplier: "Merck", zone: "Zona Q" },
    { name: "Copper (II) chloride dihydrate", unit: "250 g", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "Magnesium nitrate hexahydrate", unit: "500 g", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "Lithium peroxide", unit: "50 g", total: 1, nueva: 1, supplier: "ALDRICH", zone: "Zona Q" },
    { name: "Lithium hydroxide 56%", unit: "100 g", total: 1, nueva: 1, supplier: "Merck", zone: "Zona Q" },
    { name: "Lithium hydroxide 56%", unit: "1000 g", total: 1, nueva: 1, supplier: "Merck", zone: "Zona Q" },
    { name: "Lithium hydroxide monohydrate", unit: "1000 g", total: 1, nueva: 0, supplier: "SIGMA", zone: "Zona Q" },
    { name: "Citric acid monohydrate", unit: "5000 g", total: 1, nueva: 1, supplier: "Merck", zone: "Zona Q" },
    { name: "Citric acid monohydrate", unit: "5000 g", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "Nickel (II) sulfate hexahydrate", unit: "1000 g", total: 2, nueva: 1, supplier: "Merck", zone: "Zona Q" },
    { name: "Aluminium chloride hexahydrate", unit: "1000 g", total: 1, nueva: 1, supplier: "Merck", zone: "Zona Q" },
    { name: "Manganese (II) sulfate monohydrate", unit: "250 g", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "Cobalt (II) sulfate heptahydrate", unit: "250 g", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "Glicerina", unit: "200 ml", total: 1, nueva: 0, supplier: "Necesito Megaplast", zone: "Zona Q" },
    { name: "Acetic acid (glacial) 100%", unit: "2500 ml", total: 1, nueva: 1, supplier: "Merck", zone: "Zona Q" },
    { name: "Dimethyl carbonate", unit: "2000 ml", total: 1, nueva: 0, supplier: "SIGMA-ALDRICH", zone: "Zona Q" },
    { name: "Hydrochloric acid fuming 37%", unit: "2500 ml", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "Ethanol", unit: "2500 ml", total: 9, nueva: 7, supplier: "Merck", zone: "Zona Q" },
    { name: "Ethylene glycol", unit: "2500 ml", total: 1, nueva: 0, supplier: "Merck", zone: "Zona Q" },
    { name: "Silicon dioxide", unit: "1000 g", total: 1, nueva: 0, supplier: "SIGMA-ALDRICH", zone: "Zona R" },
    { name: "Grafito natural", unit: "1000 g", total: 1, nueva: 0, supplier: "Hitachi Chemical", zone: "Zona R" },
    { name: "Acetona 99.5%", unit: "2500 ml", total: 1, nueva: 0, supplier: "LOBA CHEMIE", zone: "Zona B" },
    { name: "Ortho-Phosphoric acid 85%", unit: "1000 ml", total: 2, nueva: 1, supplier: "Merck", zone: "Zona P" },
    { name: "Hydroquinone", unit: "100 g", total: 1, nueva: 0, supplier: "SIGMA-ALDRICH", zone: "Zona N" },
    { name: "Manganese (II) carbonate", unit: "250 g", total: 1, nueva: 1, supplier: "SIGMA-ALDRICH", zone: "Zona R" }
];

async function run() {
    console.log(`Preparing ${itemsToInsertRaw.length} items to insert...`);

    // Fetch existing REA sequence number
    const { data: existingItems, error: fetchErr } = await supabase
        .from('inventory')
        .select('code');
    
    if (fetchErr) {
        console.error("Error fetching existing items for codes:", fetchErr);
        return;
    }

    let maxNum = 0;
    existingItems.forEach(i => {
        if (i.code && i.code.startsWith('REA-')) {
            const num = parseInt(i.code.split('-')[1], 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    });

    const itemsToInsert = itemsToInsertRaw.map(item => {
        maxNum++;
        const code = `REA-${maxNum.toString().padStart(3, '0')}`;
        const used = Math.max(0, item.total - item.nueva);
        const commentParts = [];
        if (item.nueva > 0) commentParts.push(`Nuevas: ${item.nueva}`);
        if (used > 0) commentParts.push(`Usadas: ${used}`);
        const comments = commentParts.join(', ');

        return {
            code: code,
            name: item.name,
            category: "Reactivos",
            format: item.unit,
            unit: item.unit,
            stock_actual: item.total,
            stock_min: 1,
            supplier: item.supplier,
            location_detail: item.zone,
            state: item.nueva > 0 ? "Nuevo" : "Usado",
            status: item.total <= 1 ? "low" : "ok",
            comments: comments,
            expiry_date: "2027-12-31",
            in_use: false
        };
    });

    console.log("Inserting items into 'inventory' table...");
    const { data: insertedItems, error: insertError } = await supabase
        .from('inventory')
        .insert(itemsToInsert)
        .select();

    if (insertError) {
        console.error("Error inserting items:", insertError);
        return;
    }

    console.log(`Successfully inserted ${insertedItems.length} items. Now linking to lab LPSL...`);

    const labLinks = insertedItems.map(item => ({
        inventory_id: item.id,
        lab_id: 'LPSL'
    }));

    const { error: linkError } = await supabase
        .from('inventory_labs')
        .insert(labLinks);

    if (linkError) {
        console.error("Error linking to inventory_labs:", linkError);
    } else {
        console.log(`Successfully linked ${insertedItems.length} items to lab LPSL!`);
    }
}

run();
