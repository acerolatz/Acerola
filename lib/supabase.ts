import { AppConstants } from "@/constants/AppConstants";
import { 
    AppRelease, 
    Chapter, 
    ChapterImage, 
    Collection, 
    DebugManhwaImages, 
    DonateMethod,
    Manhwa, 
    ManhwaCard, 
    Post, 
    ReleaseWrapper, 
    Scan, 
    SourceCodeLink 
} from "@/helpers/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image as CompressorImage } from 'react-native-compressor';
import { decode, hasInternetAvailable } from "@/helpers/util";
import { supabaseKey, supabaseUrl } from "./supabaseKey";
import { createClient } from '@supabase/supabase-js';
import { ToastMessages } from "@/constants/Messages";
import * as RNLocalize from 'react-native-localize';
import * as mime from 'react-native-mime-types';
import Toast from "react-native-toast-message";
import { PixelRatio } from "react-native";
import RNFS from 'react-native-fs';


export const supabase = createClient(supabaseUrl, supabaseKey as any, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
});


export async function spUpdateUserLastLogin(user_id: string) {
    const { error } = await supabase
        .from("users")
        .update([{"last_login": "now()"}])
        .eq("user_id", user_id)
    
    if (error) {
        console.log("error spUpdateUserLastLogin", error)
    }
}


export async function spGetManhwas(p_last_sync: string | null): Promise<Manhwa[] | null> {
    const { data, error } = await supabase
        .rpc("get_manhwas", { p_last_sync })        
    
    if (error) {
        console.log("error spGetManhwas", error)
        return null
    }
    
    return data
}


export async function spRegisterNewUser(user_id: string, device: string, version: string) {
    const timezone = RNLocalize.getTimeZone()
    const locales = RNLocalize.getLocales()
    const language = locales.length > 0 ? locales.slice(0, 5).map(i => i.languageTag).join(', ') : null

    try {
        const { error } = await supabase
          .from("users")
          .upsert(
            [{ user_id, device, version, language, timezone }],
            { onConflict: "user_id" }
          );
        
        if (error) {
            console.log("error spNewRun", error)
        }
    } catch (error) {
        console.log("unhandled error spNewRun", error)
    }
}


export async function spFetchManhwaById(manhwa_id: number): Promise<Manhwa | null> {
    const { data, error } = await supabase
        .from("mv_manhwas")
        .select('*')
        .eq("manhwa_id", manhwa_id)
        .single()

    if (error) {
        console.log("error spFetchManhwaById", error)
        return null
    }

    return data
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


export async function spFetchChapterImages(chapter_id: number): Promise<ChapterImage[]> {
    const { data, error } = await supabase
        .from("chapter_images")
        .select("image_url, width, height")
        .eq("chapter_id", chapter_id)
        .order('index', {ascending: true})

    if (error) {
        console.log("error spFetchChapterImages", error)
        const hasInternet = await hasInternetAvailable()
        Toast.show(!hasInternet ? 
            ToastMessages.EN.UNABLE_TO_LOAD_IMAGES_INTERNET : 
            ToastMessages.EN.UNABLE_TO_LOAD_IMAGES
        )
        return []
    }    
    
    return data.map(i => {
        const width = Math.min(i.width, AppConstants.UI.SCREEN.WIDTH)
        const height = PixelRatio.roundToNearestPixel((width * i.height) / i.width)
        return { image_url: i.image_url, width, height}
    })
}


export async function spSendRequestPornhwaForm(manhwa: string, message: string | null) {
    const { error } = await supabase
        .from("manhwa_requests")
        .insert([{manhwa, message}])

    if (error) {
        console.log("error spRequestManhwa")
    }
}


export async function spSendBugReportForm(
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


export async function spFetchDonationMethods(): Promise<DonateMethod[]> {
    const { data, error } = await supabase
        .from("app_infos")
        .select("name, value, action, created_at")
        .eq("type", "donation")
        .order("created_at", {ascending: true})

    if (error) {
        console.log("error spGetDonationMethods", error)
        return []
    }

    return data.map(i => {return {action: i.action, method: i.name, value: i.value}})
}


function normalizeRandomManhwaCardHeight(width: number, height: number): {
  normalizedWidth: number, 
  normalizedHeight: number
} {
  const normalizedHeight = height > AppConstants.MEDIA.RANDOM_MANHWAS.MAX_HEIGHT ? 
    AppConstants.MEDIA.RANDOM_MANHWAS.MAX_HEIGHT :
    height
  
  let normalizedWidth = (normalizedHeight * width) / height

  normalizedWidth = normalizedWidth > AppConstants.MEDIA.RANDOM_MANHWAS.MAX_WIDTH ?
    AppConstants.MEDIA.RANDOM_MANHWAS.MAX_WIDTH : 
    normalizedWidth
  return { normalizedWidth, normalizedHeight}
}


export async function spFetchRandomManhwaCards(p_limit: number = 30): Promise<ManhwaCard[]> {
    if (AppConstants.APP.DEBUG.ENABLED) {
        return await spFetchLatestManhwaCardsDebug(0, p_limit)
    }
    
    const { data, error } = await supabase
        .rpc("get_random_cards", { p_limit })

    if (error) {
        console.log("error spFetchRandomManhwaCards", error)
        return []
    }    
    
    return (data as ManhwaCard[]).map(i => {
        const { 
            normalizedWidth, 
            normalizedHeight 
        } = normalizeRandomManhwaCardHeight(i.width, i.height)
        return {...i, normalizedWidth, normalizedHeight}}
    )
}


export async function spFetchLatestManhwaCardsDebug(p_offset: number = 0, p_limit: number = 30): Promise<ManhwaCard[]> {
    const { data, error } = await supabase
        .from("cards")
        .select("manhwas (title, manhwa_id), image_url, width, height")
        .order("created_at", {ascending: false})
        .range(p_offset * p_limit, (p_offset + 1) * p_limit - 1)

    if (error) {
        console.log("error spFetchRandomManhwaCards", error)
        return []
    }

    return data.map(i => {
        const { 
            normalizedWidth, 
            normalizedHeight 
        } = normalizeRandomManhwaCardHeight(i.width, i.height)
        return {
            width: i.width,
            height: i.height,
            normalizedWidth,
            normalizedHeight,
            manhwa_id: (i.manhwas as any).manhwa_id,
            title: (i.manhwas as any).title,
            image_url: i.image_url
    }})
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
    const { data, error } = await supabase
        .from("collections")
        .select('collection_id, name')
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


export async function spFetchTop10(): Promise<Manhwa[]> {
    const { data, error } = await supabase.rpc("get_top_10_manhwas")

    if (error) {
        console.log("error spFetchTop10", error)
        return []
    }

    return data as Manhwa[]
}


export const spSendBugScreenshot = async (uri: string, bug_id: string, index: number) => {
    try {
        const mimeType = mime.lookup(uri) || 'image/jpeg';
        const ext = mime.extension(mimeType) || 'jpg';

        const compressedUri = await CompressorImage.compress(uri, {
            compressionMethod: 'auto',
            quality: 0.7,
            disablePngTransparency: mimeType === 'image/png'
        });            

        const fileData = await RNFS.readFile(compressedUri, 'base64');
        const filePath = `${bug_id}/${index}.${ext}`;

        const { error } = await supabase
            .storage
            .from('bugs-screenshoots')
            .upload(filePath, decode(fileData), {
                contentType: mimeType,
                upsert: false
            });
        
        await RNFS.unlink(compressedUri);

        if (error) throw error;            
    } catch (error: any) {
        console.error('error uploadToSupabase', error);
    }        
};


export async function spFetchReleasesAndSourceCode(): Promise<ReleaseWrapper> {
    const { data, error } = await supabase
        .from("app_infos")
        .select('name, value, action, type')
        .or("type.eq.source, type.eq.release")
        .order("created_at", {ascending: false})

    if (error) {
        console.log("error spFetchReleasesAndSourceCode", error)
        return {releases: [], source: []}
    }

    const releases: AppRelease[] = data
        .filter(i => i.type === "release")
        .map(i => {return {version: i.name, url: i.value, descr: i.action}})

    const source: SourceCodeLink[] = data
        .filter(i => i.type === "source")
        .map(i => {return {name: i.name, url: i.value}})

    return {releases, source}
}



export async function spFetchNews(p_offset: number = 0, p_limit: number = 30): Promise<Post[]> {
    const { data, error } = await supabase
        .from("app_infos")
        .select("name, value, created_at")
        .eq("type", "post")
        .order("created_at", {ascending: false})
        .range(p_offset * p_limit, (p_offset + 1) * p_limit - 1)

    if (error) {
        console.log("error spFetchFeedbacks", error)
        return []
    }

    return data.map(i => {return {
        title: i.name, 
        message: i.value,
        created_at: i.created_at
    }})
}


export async function spFetchLiveVersion(): Promise<string | null> {
    const { data, error } = await supabase
        .from("app_infos")
        .select("value")
        .eq("type", "live_version")
        .single()

    if (error) {
        console.log("error spFetchLiveVersion", error)
        return null
    
    }

    return data.value
}


/**
 * Uses the Supabase REST API to fetch the card image of a manhwa for display in the Random tab on the HomePage.
 * 
 * @param manhwa_id - ID of the manhwa
 * @returns Promise resolving to a ManhwaCard object with normalized width/height, title, manhwa_id, image URL, original width, and height
 */
export async function spFetchCardImage(manhwa_id: number): Promise<ManhwaCard | null> {
    const { data, error } = await supabase
        .from("cards")
        .select("manhwas (title, manhwa_id), width, height, image_url, created_at")
        .eq("manhwa_id", manhwa_id)
        .single()

    if (error) {
        console.log("error spFetchRandomManhwaCards", error)
        return null
    }

    const { 
        normalizedWidth, 
        normalizedHeight 
    } = normalizeRandomManhwaCardHeight(data.width, data.height)

    return {
        normalizedWidth: normalizedWidth,
        normalizedHeight: normalizedHeight,
        manhwa_id: (data.manhwas as any).manhwa_id,
        title: (data.manhwas as any).title,
        image_url: data.image_url,
        width: data.width,
        height: data.height
    }
}


export async function spFetchManhwaCoverImage(manhwa_id: number): Promise<string | null> {
    const { data, error } = await supabase
        .from("manhwas")
        .select("cover_image_url")
        .eq("manhwa_id", manhwa_id)
        .single()

    if (error) {
        console.log("error spFetchCoverImage", error)
        return null
    }

    return data.cover_image_url
}



export async function spFetchCardAndCover(manhwa_id: number): Promise<DebugManhwaImages> {
    const { data, error } = await supabase
        .from("manhwas")
        .select("title, cover_image_url, cards(image_url)")
        .eq("manhwa_id", manhwa_id)
        .single()

    if (error) {
        console.log("error spFetchCardAndCover", error)
        return {title: '', cover : null, card: null, manhwa_id }
    }

    try {
        return {
            title: data.title,
            cover: data.cover_image_url,
            card: (data.cards as any).image_url ?? null,
            manhwa_id
        }
    } catch (error) {
        return {title: data.title, cover : data.cover_image_url, card: null, manhwa_id }
    }
}


/**
 * Uses the Supabase REST API to search for manhwas by title, returning cover and card images.
 * 
 * @param p_search_text - Text to search in manhwa titles
 * @returns Promise resolving to an array of DebugManhwaImages
 */
export async function spFetchCardAndCoverSearch(p_search_text: string, p_offset: number = 0, p_limit: number = 32): Promise<DebugManhwaImages[]> {
    const { data, error } = await supabase
        .from("manhwas")
        .select("manhwa_id, title, cover_image_url, cards(image_url)")
        .ilike("title", `%${p_search_text}%`)
        .range(p_offset * p_limit, (p_offset + 1) * p_limit - 1)
        .order("updated_at", {ascending: false})

    if (error) {
        console.log("error spFetchCardAndCoverSearch", error)
        return []
    }

    return data.map(c => {
        try {
            return {
                title: c.title,
                cover: c.cover_image_url,
                card: (c.cards as any).image_url ?? null,
                manhwa_id: c.manhwa_id,
            }
        } catch (error) {
            return {title: c.title, cover : c.cover_image_url, card: null, manhwa_id: c.manhwa_id }
        }
    })
}



/**
 * Uses the Supabase REST API to fetch the latest manhwas with cover and card images.
 * 
 * @param p_limit - Maximum number of manhwas to fetch (default 32)
 * @returns Promise resolving to an array of DebugManhwaImages
 */
export async function spFetchCardAndCoverLatest(p_limit: number = 32): Promise<DebugManhwaImages[]> {
    const { data, error } = await supabase
        .from("manhwas")
        .select("manhwa_id, title, cover_image_url, cards(image_url)")
        .order("updated_at", {ascending: false})
        .limit(p_limit)

    if (error) {
        console.log("error spFetchCardAndCoverSearch", error)
        return []
    }

    return data.map(c => {
        try {
            return {
                title: c.title,
                cover: c.cover_image_url,
                card: (c.cards as any).image_url ?? null,
                manhwa_id: c.manhwa_id,
            }
        } catch (error) {
            return {title: c.title, cover : c.cover_image_url, card: null, manhwa_id: c.manhwa_id }
        }
    })
}