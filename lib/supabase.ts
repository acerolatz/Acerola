import { AppConstants } from "@/constants/AppConstants";
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


export async function spGetManhwas(p_last_sync: string | null): Promise<Manhwa[]> {
    const { data, error } = await supabase
        .rpc("get_manhwas", { p_last_sync })
    
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

export async function spUpdateChapterView(p_chapter_id: number) {
    const { error } = await supabase
        .rpc("increment_chapter_view", { p_chapter_id })

    if (error) {
        console.log("error spUpdateChapterView", error)
    }
}

export async function spUpdateManhwaCardView(p_manhwa_id: number) {
    const { error } = await supabase
        .rpc("increment_manhwa_card_view", { p_manhwa_id })

    if (error) {
        console.error('error spUpdateManhwaCardView', error);
    }
}

export async function spUpdateManhwaViews(p_manhwa_id: number) {
    const { error } = await supabase
        .rpc('increment_manhwa_views', { p_manhwa_id  });

    if (error) {
        console.error('error spUpdateMangaViews', error);
    }  
}


export async function spGetReleases(): Promise<AppRelease[]> {
    const { data, error } = await supabase
        .from("app_infos")
        .select("name, value, action")
        .order("created_at", {ascending: false})
        .eq("type", "release")
        
    if (error) { 
        console.log("error spGetAllAppVersions", error)
        return [] 
    }    

    return data.map(r => {return {version: r.name, url: r.value, action: r.action}})
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
    descr: string | null,
    has_images: boolean
): Promise<number | null> {
    const { data, error } = await supabase
        .from("bug_reports")
        .insert([{title, descr, bug_type, device, has_images}])
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
        .from("app_infos")
        .select("name, value, action")
        .eq("type", "donation")

    if (error) {
        console.log("error spGetDonationMethods", error)
        return []
    }

    return data.map(i => {return {action: i.action, method: i.name, value: i.value}})
}


export async function spFetchRandomManhwaCards(p_limit: number = 30): Promise<ManhwaCard[]> {
    if (AppConstants.COMMON.DEBUG_MODE) {
        const { data, error } = await supabase
            .from("cards")
            .select("manhwas (title, manhwa_id), width, height, image_url, created_at")
            .order("created_at", {ascending: false})
            .limit(32)

        if (error) {
            console.log("error spFetchRandomManhwaCards", error)
            return []
        }

        return data.map(i => {return {
            manhwa_id: (i.manhwas as any).manhwa_id,
            title: (i.manhwas as any).title,
            image_url: i.image_url,
            width: i.width,
            height: i.height
        }})
    }

    const { data, error } = await supabase
        .rpc("get_random_cards", { p_limit })

    if (error) {
        console.log("error spFetchRandomManhwaCards", error)
        return []
    }    
    
    return data as ManhwaCard[]
}


export async function spFetchScans(): Promise<Scan[]> {
    const { data, error } = await supabase
        .from("app_infos")
        .select("name, value")
        .eq("type", "scan")
        .order('name')

    if (error) {
        console.log("error spFetchScans", error)
        return []
    }
    
    return data.map(s => {return {name: s.name, url: s.value}})
}


export async function spFetchEulaAndDisclaimer(): Promise<{name: string, value: string}[]> {
    const { data, error } = await supabase
        .from("app_infos")
        .select("name, value")
        .or('name.eq.eula, name.eq.disclaimer')

    if (error) {
        console.log("error spFetchEulaAndDisclaimer", error)
        return []
    }

    return data
}


export async function spFetchCollections(): Promise<Collection[]> {
    console.log("fetching collections")
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


export async function spGetTodayTop10(): Promise<Manhwa[]> {
    const { data, error } = await supabase.rpc("get_top_10_manhwas")

    if (error) {
        console.log("error spGetTodayTop10", error)
        return []
    }

    return data as Manhwa[]
}