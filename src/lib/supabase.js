import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uxsyfqurxduzwbeyloya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4c3lmcXVyeGR1endiZXlsb3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzU4MzYsImV4cCI6MjA3Mjk1MTgzNn0.IxHovu7QMUITp09pByWKJc6VTa6mWhP4Bg_R9pp3nqM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);