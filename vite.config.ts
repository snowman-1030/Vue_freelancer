import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'configure-service-worker',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith('OneSignalSDKWorker.js') || req.url?.endsWith('OneSignalSDK.sw.js')) {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Service-Worker-Allowed', '/');
          }
          next();
        });
      }
    }
  ],
  css: {
    postcss: './postcss.config.cjs', // Specify the PostCSS config file
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    headers: {
      'Service-Worker-Allowed': '/',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'OneSignalSDKWorker': resolve(__dirname, 'public/OneSignalSDKWorker.js')
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === 'OneSignalSDKWorker'
            ? '[name].js'
            : 'assets/[name]-[hash].js'
        }
      }
    },
    // Ensure service worker files are copied to dist
    copyPublicDir: true,
    sourcemap: true
  },
  optimizeDeps: {
    entries: ['src/**/*.vue'],
    exclude: ['OneSignalSDKWorker.js'],
    esbuildOptions: {
      sourcemap: true
    }
  }
})
