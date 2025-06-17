import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      {
        name: 'configure-response-headers',
        configureServer: (server) => {
          server.middlewares.use((req, res, next) => {
            // Set correct MIME type for WebAssembly files
            if (req.url?.endsWith('.wasm')) {
              res.setHeader('Content-Type', 'application/wasm');
            }
            next();
          });
        }
      }
    ],
    server: {
      port: 3000,
      host: true,
    },
    optimizeDeps: {
      exclude: ['@breeztech/breez-sdk-liquid']
    },
    build: {
      // Don't chunk and hash wasm files
      assetsInlineLimit: 0,
    }
  }
})
