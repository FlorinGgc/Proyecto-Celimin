const fs = require('fs');
['core.js', 'inventory.js', 'users.js', 'index.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Administrador General/g, 'Administrador');
    content = content.replace(/Encargada de Inventario/g, 'Compra y Abastecimiento');
    content = content.replace(/Supervisor de Laboratorio/g, 'Investigador');
    fs.writeFileSync(file, content);
});
console.log('Done');
