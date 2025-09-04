// Script to generate schema content for init_schemas.js
const fs = require('fs');
const path = require('path');

const schemasDir = path.join(__dirname, '..', 'schemas');
const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.js'));

console.log('// Auto-generated schema content');
console.log('const schemaContents = {');

files.forEach(file => {
    const filePath = path.join(schemasDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const schemaName = file.replace('.js', '');
    
    // Escape quotes and newlines for JavaScript string
    const escapedContent = content
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
    
    console.log(`  '${schemaName}': '${escapedContent}',`);
});

console.log('};');
console.log('');
console.log('// Function to get schema content by name');
console.log('function getSchemaContent(schemaName) {');
console.log('  return schemaContents[schemaName] || null;');
console.log('}');
