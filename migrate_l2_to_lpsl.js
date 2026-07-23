const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    console.log("Migrating lab ID from 'L2' to 'LPSL'...");

    // 1. Ensure lab 'LPSL' exists in 'labs'
    const { data: existingLabs } = await supabase.from('labs').select('*');
    const lpslExists = existingLabs ? existingLabs.some(l => l.id === 'LPSL') : false;

    if (!lpslExists) {
        console.log("Inserting lab 'LPSL'...");
        const { error: insertLabErr } = await supabase.from('labs').insert([{
            id: 'LPSL',
            name: 'Laboratorio de Procesos Sustentables de Litio y Minerales Industriales',
            location: 'Galpon Piso 1'
        }]);
        if (insertLabErr) {
            console.error("Error inserting LPSL lab:", insertLabErr);
            return;
        }
    } else {
        console.log("Lab 'LPSL' already exists. Updating name/location if needed...");
        await supabase.from('labs').update({
            name: 'Laboratorio de Procesos Sustentables de Litio y Minerales Industriales',
            location: 'Galpon Piso 1'
        }).eq('id', 'LPSL');
    }

    // 2. Update inventory_labs links: convert all 'L2' to 'LPSL'
    console.log("Updating 'inventory_labs' references from 'L2' to 'LPSL'...");
    const { data: l2Links, error: fetchLinksErr } = await supabase
        .from('inventory_labs')
        .select('*')
        .eq('lab_id', 'L2');

    if (fetchLinksErr) {
        console.error("Error fetching L2 links:", fetchLinksErr);
    } else if (l2Links && l2Links.length > 0) {
        console.log(`Found ${l2Links.length} inventory links with lab_id 'L2'. Re-linking to 'LPSL'...`);
        
        // Delete old 'L2' links
        await supabase.from('inventory_labs').delete().eq('lab_id', 'L2');
        
        // Insert new 'LPSL' links
        const newLpslLinks = l2Links.map(l => ({
            inventory_id: l.inventory_id,
            lab_id: 'LPSL'
        }));

        const { error: insertLinksErr } = await supabase.from('inventory_labs').insert(newLpslLinks);
        if (insertLinksErr) {
            console.error("Error inserting new LPSL links:", insertLinksErr);
        } else {
            console.log(`Successfully migrated ${newLpslLinks.length} inventory links to 'LPSL'!`);
        }
    } else {
        console.log("No links with lab_id 'L2' found.");
    }

    // 3. Delete old 'L2' record from 'labs' table
    console.log("Deleting old 'L2' lab record...");
    await supabase.from('labs').delete().eq('id', 'L2');

    // 4. Verify final labs list
    const { data: finalLabs } = await supabase.from('labs').select('*');
    console.log("Migration complete! Current Labs in DB:", finalLabs);
}

run();
