import { defineConfig } from 'vitest/config';


export default defineConfig({
    test: {
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
            '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            '**/e2e/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            '**/tests/e2e/**',
            '**/playwright/**',
            '**/*.playwright.{spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],

        include: [
            '**/*.{test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],

        globals: false,
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json', 'lcov'],
            reportsDirectory: './coverage',
            include: ['src/**/*.{js,ts}'],
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/coverage/**',
                '**/*.config.{js,ts}',
                '**/*.{test,spec}.{js,ts}',
                '**/e2e/**',
                '**/playwright/**',
                '**/lib/**'
            ],
        },
    },
});
