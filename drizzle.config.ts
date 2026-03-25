import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'mysql',
    schema: './src/Models/schema.ts',
    out: './drizzle',
    dbCredentials: {
        host: 'localhost',
        user: 'ShareAdmin',
        password: 'ShareAdmin',
        database: 'Sharegames',
    },
});

