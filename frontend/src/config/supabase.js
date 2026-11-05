import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas. ' +
      'Crie o arquivo .env.development (veja .env.development.example) e reinicie o "npm run dev".',
  )
}

// Sem sessão de usuário: o app não usa autenticação.
export const supabase = createClient(
  url || 'http://localhost:54321',
  anonKey || 'chave-nao-configurada',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
)
