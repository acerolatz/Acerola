import { AppRelease, Chapter, ChapterImage, Collection, DonateMethod, Manhwa, ManhwaCard, Scan } from "@/helpers/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from '@supabase/supabase-js';
import { supabaseKey, supabaseUrl } from "./supabaseKey";


export const supabase = createClient(supabaseUrl, supabaseKey as any, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
});


export async function spGetManhwas(): Promise<Manhwa[]> {
    const { data, error } = await supabase.from("mv_manhwas").select("*")
    
    if (error) {
        console.log("error spGetManhwas", error)
        return []
    }
    
    return data
}

export async function spNewRun() {
    const { error } = await supabase
        .from("app_runs")
        .insert([{local_time: new Date().toLocaleString()}])
    
    if (error) {
        console.log("error spNewRun", error)
    }
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


export async function spFetchChapterImages(chapter_id: number): Promise<ChapterImage[]> {
    const { data, error } = await supabase
        .from("chapter_images")
        .select("image_url, width, height")
        .eq("chapter_id", chapter_id)
        .order('index', {ascending: true})

    if (error) {
        console.log("error spFetchChapterImages", error)
        return []
    }

    return data
}

export async function spRequestManhwa(manhwa: string, message: string | null) {
    const { error } = await supabase
        .from("manhwa_requests")
        .insert([{manhwa, message}])

    if (error) {
        console.log("error spRequestManhwa")
    }
}

export async function spReportBug(
    title: string, 
    descr: string | null, 
    bug_type: string
): Promise<number | null> {
    const { data, error } = await supabase
        .from("bug_reports")
        .insert([{title, descr, bug_type}])
        .select("bug_id")
        .single()
    
    if (error) {
        console.log("error spReportBug", error)
        return null
    }
    
    return data.bug_id
}

export async function spGetDonationMethods(): Promise<DonateMethod[]> {
    const { data, error } = await supabase
        .from("donate_methods")
        .select("method, value, action")

    if (error) {
        console.log("error spGetDonationMethods", error)
        return []
    }

    return data
}

export async function spFetchRandomManhwaCards(p_offset: number = 0, p_limit: number = 30): Promise<ManhwaCard[]> {
    const { data, error } = await supabase
        .rpc("get_random_cards", {p_offset, p_limit})

    if (error) {
        console.log("error spFetchRandomManhwaCards", error)
    }

    return data as ManhwaCard[]
}

export async function spFetchScans(): Promise<Scan[]> {
    const { data, error } = await supabase
        .from("scans")
        .select("name, url")

    if (error) {
        console.log("error spFetchScans", error)
        return []
    }
    
    return data
}

export async function spSearchManhwas(p_search_term: string, p_offset: number = 0, p_limit: number = 30): Promise<Manhwa[]> {
    const { data, error } = await supabase
        .rpc("search_manhwas", { p_search_term, p_limit, p_offset })

    if (error) {
        console.log("error spSearchManhwas", error)
        return []
    }

    return data
}

export async function spFetchCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
        .from("collections")
        .select('*')
        .order('name', {ascending: true})
    
    if (error) {
        console.log('error spFetchCollections', error)
        return []
    }

    return data
}


export async function spFetchCollectionItems(
    p_collection_id: number,
    p_offset: number = 0,
    p_limit: number = 30
): Promise<Manhwa[]> {
    const { data, error } = await supabase
        .rpc('get_manhwas_by_collection', { p_collection_id, p_offset, p_limit })

    if (error) {
        console.log('error spFetchCollectionItems', error)
        return []
    }
    
    return data
}