/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DATA_ADAPTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
