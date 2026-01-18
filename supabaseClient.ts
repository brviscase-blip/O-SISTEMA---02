
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://tldfcgqhdunzbkogmuwt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZGZjZ3FoZHVuemJrb2dtdXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjkwNDIsImV4cCI6MjA4NDI0NTA0Mn0.qJg2BRdP65sjoyR3QbuEhsia4vLTnBscTb5DDdwVnrs';

/**
 * NEXUS SUPABASE ENGINE - AUTH ENABLED
 * Configurado para persistir a sessão do Caçador no navegador.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const getSupabaseClient = () => supabase;
