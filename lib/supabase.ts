import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from '@supabase/supabase-js';


// RLS
const supabaseUrl = "https://hfflwodueiqktdhmvfzd.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZmx3b2R1ZWlxa3RkaG12ZnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDk5ODMsImV4cCI6MjA2MzIyNTk4M30.aQyHEIlQUAGvxI1anhz21h_cog2rNCO6m4gOaky9ebQ"


export const supabase = createClient(supabaseUrl, supabaseKey as any, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
});