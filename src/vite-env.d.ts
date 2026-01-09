/// <reference types="vite/client" />

interface ImportMetaEnv {
  // tipos das variáveis do .env
  readonly VITE_API_URL: string;
  readonly VITE_FRONTEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
