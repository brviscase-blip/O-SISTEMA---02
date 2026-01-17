
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Credenciais fixas fornecidas pelo usuário para garantir estabilidade absoluta
const supabaseUrl = 'https://tldfcgqhdunzbkogmuwt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZGZjZ3FoZHVuemJrb2dtdXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjkwNDIsImV4cCI6MjA4NDI0NTA0Mn0.qJg2BRdP65sjoyR3QbuEhsia4vLTnBscTb5DDdwVnrs';

/**
 * NEXUS SUPABASE ENGINE (V12 - CRITICAL FIX)
 * Força a utilização da chave nos headers globais para evitar erro de 'Invalid API Key'.
 */
const client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'x-application-name': 'nexus-artifacts-v12'
    }
  }
});

export const getSupabaseClient = () => client;
export const supabase = () => client;
