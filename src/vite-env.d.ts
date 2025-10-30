/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // ✅ Don't add DEV, PROD, MODE - they're already in vite/client
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
