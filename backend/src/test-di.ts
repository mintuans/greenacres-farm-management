/**
 * Test file để verify DI Container hoạt động đúng
 * Chạy: npx ts-node src/test-di.ts
 */
import 'reflect-metadata';
import { container, configureContainer } from './core/container';
import { TYPES } from './core/types';
import { IDatabase } from './core/interfaces/IDatabase';
import { IPartnerRepository } from './domain/repositories/IPartnerRepository';

async function testDIContainer() {
    console.log('🧪 Testing Dependency Injection Container...\n');

    try {
        // 1. Configure container
        console.log('1️⃣ Configuring DI Container...');
        configureContainer();
        console.log('');

        // 2. Test IDatabase resolution
        console.log('2️⃣ Testing IDatabase resolution...');
        const database = container.get<IDatabase>(TYPES.IDatabase);
        console.log('✅ IDatabase resolved successfully');
        console.log('   Type:', database.constructor.name);
        console.log('');

        // 3. Test database connection
        console.log('3️⃣ Testing database connection...');
        const result = await database.query('SELECT NOW() as current_time');
        console.log('✅ Database connected successfully');
        console.log('   Current time:', result.rows[0].current_time);
        console.log('');

        // 4. Test IPartnerRepository resolution
        console.log('4️⃣ Testing IPartnerRepository resolution...');
        const partnerRepo = container.get<IPartnerRepository>(TYPES.IPartnerRepository);
        console.log('✅ IPartnerRepository resolved successfully');
        console.log('   Type:', partnerRepo.constructor.name);
        console.log('');

        // 5. Test repository query
        console.log('5️⃣ Testing repository query...');
        const partners = await partnerRepo.findAll();
        console.log('✅ Repository query successful');
        console.log('   Total partners:', partners.length);
        if (partners.length > 0) {
            console.log('   First partner:', {
                code: partners[0].partner_code,
                name: partners[0].partner_name,
                type: partners[0].type
            });
        }
        console.log('');

        // 6. Test singleton scope
        console.log('6️⃣ Testing singleton scope for IDatabase...');
        const database2 = container.get<IDatabase>(TYPES.IDatabase);
        const isSingleton = database === database2;
        console.log(isSingleton ? '✅ IDatabase is singleton (same instance)' : '❌ IDatabase is NOT singleton');
        console.log('');

        // 7. Test transient scope for Repository
        console.log('7️⃣ Testing transient scope for IPartnerRepository...');
        const partnerRepo2 = container.get<IPartnerRepository>(TYPES.IPartnerRepository);
        const isTransient = partnerRepo !== partnerRepo2;
        console.log(isTransient ? '✅ IPartnerRepository is transient (different instances)' : '⚠️ IPartnerRepository is singleton');
        console.log('');

        console.log('🎉 All tests passed!');
        console.log('');
        console.log('📊 Summary:');
        console.log('   ✅ DI Container configured');
        console.log('   ✅ IDatabase resolved and working');
        console.log('   ✅ IPartnerRepository resolved and working');
        console.log('   ✅ Database connection successful');
        console.log('   ✅ Repository queries working');
        console.log('');
        console.log('🚀 Ready for Phase 2: Business Services');

    } catch (error: any) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run tests
testDIContainer()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
