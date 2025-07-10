import { Manhwa, OugiUser } from "@/helpers/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, Session } from '@supabase/supabase-js';


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


export async function spGetSession(): Promise<Session | null> {
    const { data: {session} } = await supabase.auth.getSession()
    return session
}


export async function spFetchUser(
    user_id: string
): Promise<OugiUser | null> {

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user_id)
        .single()

    if (error) {
        console.log("error spFetchUser", error)
        return null
    }

    if (!data) {
        console.log("no user found", user_id)
        return null
    }

    return data
}


export async function spGetManhwas(): Promise<Manhwa[]> {
    const { data, error } = await supabase.from("mv_manhwas").select("*")
    
    if (error) {
        console.log("error spGetManhwas", error)
        return []
    }
    
    return data
}