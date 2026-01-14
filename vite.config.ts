import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
    server: {
        port: 5173,
        host: true,
        strictPort: true,
        open: false,
        cors: true,
        hmr: {
            overlay: true
        }
    },

    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            },
            external: ['fsevents'],
            output: {
                manualChunks: {
                    vendor: ['vite'], 
                    utils: []
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
            }
        },

        chunkSizeWarningLimit: 1000,
        cssCodeSplit: true
    },

    optimizeDeps: {
        include: [], 
        exclude: []
    },

    preview: {
        port: 4173,
        host: true,
        strictPort: true,
        cors: true
    },

   
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@utils': resolve(__dirname, 'src/utils'),
            '@assets': resolve(__dirname, 'src/assets'),
            '@styles': resolve(__dirname, 'src/styles')
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue', '.svelte']
    },

    css: {
        devSourcemap: true,
        modules: {
            localsConvention: 'camelCase'
        }
    },

    envPrefix: 'VITE_',

    worker: {
        format: 'es'
    },

    experimental: {
        renderBuiltUrl: (filename, { hostType }) => {
            if (hostType === 'js') {
                return { js: `/${filename}` }
            } else {
                return { relative: true }
            }
        }
    }
})
