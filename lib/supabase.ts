import { AppRelease, Chapter, ChapterImage, Collection, DonateMethod, Manhwa, ManhwaCard, Post, Scan } from "@/helpers/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from '@supabase/supabase-js';
import * as RNLocalize from 'react-native-localize';
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


export async function spNewRun(user_id: string, device: string) {
    const timezone = RNLocalize.getTimeZone()
    const locales = RNLocalize.getLocales()
    const language = locales.length > 0 ? locales.slice(0, 5).map(i => i.languageTag).join(', ') : null

    const { error } = await supabase
        .from("users")
        .insert([{ language, timezone, user_id, device}])
    
    if (error) {
        console.log("error spNewRun", error)
    }
}


export async function spFetchNews(page: number = 0, limit: number = 10): Promise<Post[]> {
    const { data, error } = await supabase
        .from("news")
        .select('*')
        .order("created_at", {ascending: false})
        .range(page * limit, (page + 1) * limit)

    if (error) {
        console.log("error spFetchNews", error)
    }

    return data ? data as Post[] : []
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
    bug_type: string,
    device: string | null,
    descr: string | null
): Promise<number | null> {
    const { data, error } = await supabase
        .from("bug_reports")
        .insert([{title, descr, bug_type, device}])
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


export async function spFetchManhwaAltName(manhwa_id: number): Promise<string[]> {
    console.log("fetching alt names for", manhwa_id)
    const { data, error } = await supabase
        .from("alt_titles")
        .select("title")
        .eq("manhwa_id", manhwa_id)

    if (error) {
        console.log("error spFetchManhwaAltName", error)
        return []
    }

    return data.map(i => i.title)
}

export async function spFetchRandomManhwaCards(p_limit: number = 30): Promise<ManhwaCard[]> {
    const { data, error } = await supabase
        .rpc("get_random_cards", { p_limit })

    if (error) {
        console.log("error spFetchRandomManhwaCards", error)
    }    
    
    return data as ManhwaCard[]
}


export async function spAddNewManhwaRating(manhwa_id: number, user_id: string, rate: number) {
    const { error } = await supabase
        .from("manhwa_rates")
        .upsert({manhwa_id, user_id, rate})

    console.log(manhwa_id, user_id, rate)
    if (error) {
        console.log("error spAddNewManhwaRating", error)
    }
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