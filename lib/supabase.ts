import { AppRelease, Chapter, Manhwa, OugiUser } from "@/helpers/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, Session } from '@supabase/supabase-js';


// RLS
const supabaseUrl = "https://amqgqpnbtwbnmjuqxiqb.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcWdxcG5idHdibm1qdXF4aXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA0OTIsImV4cCI6MjA2NjQ0NjQ5Mn0.zHaLOyRyRPihVYgFoyRCaWYJYpLsTJH3SMWmpk_YqKA"


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

export async function spFetchManhwasByLastUpdate(p_offset: number = 0, p_limit: number = 30): Promise<Manhwa[]> {
    const { data, error } = await supabase
        .from("mv_manhwas")
        .select('*')
        .range(p_offset * p_limit, (p_offset + 1) * p_limit)
        .order("updated_at", {ascending: false})

    if (error) {
        console.log("error spFetchManhwasByLastUpdate", error)
        return []
    }

    return data as Manhwa[]
}


export async function spFetchChapterList(manhwa_id: number): Promise<Chapter[]> {
    
    const { data, error } = await supabase
        .from("chapters")
        .select("chapter_id, manhwa_id, chapter_name, chapter_num, created_at")
        .eq("manhwa_id", manhwa_id)
        .order("chapter_num", {ascending: true})

    if (error) {
        console.log("error spFetchChapterList", error)
        return []
    }

    return data
}


export async function spUpdateManhwaViews(p_manhwa_id: number) {
    const { error } = await supabase
        .rpc('increment_manhwa_views', { p_manhwa_id  });

    if (error) {
        console.error('error spUpdateMangaViews', error);
        return null;
    }  
}


export async function spGetReleases(): Promise<AppRelease[]> {
    const { data, error } = await supabase
        .from("releases")
        .select("release_id, version, url, descr, created_at")
        .order("created_at", {ascending: false})
        
    if (error) { 
        console.log("error spGetAllAppVersions", error)
        return [] 
    }    

    return data as AppRelease[]
}

