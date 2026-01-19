const fs = require('fs');
const path = require('path');

console.log('🚀 Creating SOLID API files for frontend...\n');

const baseDir = path.join(__dirname, '..');
const apiDir = path.join(baseDir, 'src/api');

// Modules to migrate
const modules = [
    { name: 'partner', endpoint: 'partners' },
    { name: 'work-schedule', endpoint: 'work-schedules' },
    { name: 'inventory', endpoint: 'inventory' },
    { name: 'transaction', endpoint: 'transactions' },
    { name: 'season', endpoint: 'seasons' },
    { name: 'payroll', endpoint: 'payrolls' },
    { name: 'job-type', endpoint: 'job-types' },
    { name: 'work-shift', endpoint: 'work-shifts' },
    { name: 'warehouse-type', endpoint: 'warehouse-types' }
];

let successCount = 0;
let skipCount = 0;

modules.forEach(module => {
    const oldFile = path.join(apiDir, `${module.name}.api.ts`);
    const newFile = path.join(apiDir, `${module.name}-solid.api.ts`);

    // Check if old file exists
    if (!fs.existsSync(oldFile)) {
        console.log(`⚠️  ${module.name}.api.ts not found, skipping...`);
        skipCount++;
        return;
    }

    // Check if new file already exists
    if (fs.existsSync(newFile)) {
        console.log(`⏭️  ${module.name}-solid.api.ts already exists, skipping...`);
        skipCount++;
        return;
    }

    // Read old file
    let content = fs.readFileSync(oldFile, 'utf8');

    // Replace /management/ with /solid/
    content = content.replace(/\/management\//g, '/solid/');

    // Replace /payroll with /solid/payrolls (special case)
    content = content.replace(/\/payroll(?!s)/g, '/solid/payrolls');

    // Add header comment
    const header = `/**
 * SOLID API - Clean Architecture
 * 
 * This file uses the new SOLID architecture backend endpoints.
 * Endpoints: /api/solid/${module.endpoint}
 * 
 * Features:
 * - Clean Architecture
 * - SOLID Principles
 * - Dependency Injection
 * - Type-safe
 * - Better error handling
 */

`;

    content = header + content;

    // Write new file
    fs.writeFileSync(newFile, content);
    console.log(`✅ Created ${module.name}-solid.api.ts`);
    successCount++;
});

console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log(`  ✅ Created: ${successCount} files`);
console.log(`  ⏭️  Skipped: ${skipCount} files`);
console.log(`  📁 Total: ${modules.length} modules`);
console.log('='.repeat(50));

if (successCount > 0) {
    console.log('\n📝 Next Steps:');
    console.log('  1. Review the generated files');
    console.log('  2. Update component imports:');
    console.log('     - import { ... } from "@/api/partner.api"');
    console.log('     + import { ... } from "@/api/partner-solid.api"');
    console.log('  3. Test each module thoroughly');
    console.log('  4. Remove old API files when migration is complete');
    console.log('\n✨ SOLID API files are ready to use!');
}
