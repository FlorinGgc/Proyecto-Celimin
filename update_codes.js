const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sdlojkscphgijpcsigzc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbG9qa3NjcGhnaWpwY3NpZ3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDQyMDEsImV4cCI6MjA5NjAyMDIwMX0.xP0MrZzgUFDLXYilGMEbCsqeo2Cww6oZRP9psEfSQ2A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function generateCodePrefix(category) {
    if (!category) return 'UNK';
    switch (category.toLowerCase()) {
        case 'reactivos': return 'REA';
        case 'equipos': return 'EQU';
        case 'consumibles': return 'CON';
        case 'otros': return 'OTR';
        case 'vidrieria': return 'VID';
        default: return category.substring(0, 3).toUpperCase();
    }
}

async function run() {
    console.log("Fetching all items...");
    const { data: allItems, error } = await supabase.from('inventory').select('id, code, category');
    
    if (error) {
        console.error("Error fetching items:", error);
        return;
    }

    const itemsWithoutCode = allItems.filter(i => !i.code || i.code.trim() === '' || i.code === 'N/A');
    console.log(`Found ${itemsWithoutCode.length} items without code.`);

    // Find the max sequence number for each prefix
    const sequenceMap = {};
    for (const item of allItems) {
        if (item.code && item.code.includes('-')) {
            const [prefix, numStr] = item.code.split('-');
            const num = parseInt(numStr, 10);
            if (!isNaN(num)) {
                if (!sequenceMap[prefix] || sequenceMap[prefix] < num) {
                    sequenceMap[prefix] = num;
                }
            }
        }
    }

    // Assign codes
    const updates = [];
    for (const item of itemsWithoutCode) {
        const prefix = generateCodePrefix(item.category);
        if (!sequenceMap[prefix]) {
            sequenceMap[prefix] = 0;
        }
        sequenceMap[prefix]++;
        const numStr = sequenceMap[prefix].toString().padStart(3, '0');
        const newCode = `${prefix}-${numStr}`;
        
        updates.push({ id: item.id, code: newCode });
    }

    if (updates.length === 0) {
        console.log("No items to update.");
        return;
    }

    console.log("Updating items...");
    let successCount = 0;
    for (const update of updates) {
        const { error: updateError } = await supabase
            .from('inventory')
            .update({ code: update.code })
            .eq('id', update.id);
            
        if (updateError) {
            console.error(`Error updating item ${update.id}:`, updateError);
        } else {
            successCount++;
        }
    }

    console.log(`Successfully updated ${successCount} items.`);
}

run();
