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
import RNFS from 'react-native-fs';
import { normalizeRandomManhwaCardHeight } from "@/helpers/normalize";
import { PixelRatio } from "react-native";


export const supabase = createClient(supabaseUrl, supabaseKey as any, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
});


/**
 * Fetches the complete list of manhwas from Supabase via an RPC call.
 *
 * Uses the `get_manhwas` RPC function in the database to check whether the
 * client's data is outdated based on the provided `p_last_sync` timestamp.
 *
 * - If the client provides `null`, it is treated as an initial sync, fetching all data.
 * - If the server determines that the client's data is outdated, it returns the full list of manhwas.
 * - If the client is already up to date, the server returns an empty array.
 *
 * @param p_last_sync - The timestamp (ISO 8601 string) of the client's last successful sync, or `null` for an initial sync.
 * @returns A promise that resolves with an array of `Manhwa` objects. 
 * Returns an empty array if the client is up to date or if an error occurs during the fetch.
 */
export async function spGetManhwas(p_last_sync: string | null): Promise<Manhwa[]> {
    const { data, error } = await supabase
        .rpc("get_manhwas", { p_last_sync })        
    
    if (error) {
        console.log("error spGetManhwas", error)
        return []
    }
    
    return data
}


/**
 * Registers or updates a user run in the `users` table.
 *
 * Collects the device information, user language preferences (up to 5),
 * and timezone from the device, then performs an UPSERT operation on Supabase. 
 *
 * @param user_id - Unique identifier for the user.
 * @param device - Device identifier or description.
 * @returns A promise that resolves when the operation completes.
 */
export async function spNewRun(user_id: string, device: string) {
    const timezone = RNLocalize.getTimeZone()
    const locales = RNLocalize.getLocales()
    const language = locales.length > 0 ? locales.slice(0, 5).map(i => i.languageTag).join(', ') : null

    try {
        const { error } = await supabase
          .from("users")
          .upsert(
            [{ user_id, device, language, timezone }],
            { onConflict: "user_id" }
          );
        
        if (error) {
            console.log("error spNewRun", error)
        }
    } catch (error) {
        console.log("unhandled error spNewRun", error)
    }
}


/**
 * Fetches a single manhwa from Supabase by its unique identifier.
 *
 * @param manhwa_id - The unique numeric identifier of the manhwa to fetch.
 * @returns A promise that resolves with a `Manhwa` object if found, or `null` if no record exists or an error occurs.
 */
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


/**
 * Fetches the list of chapters for a given manhwa from Supabase.
 * 
 * @param manhwa_id - The unique numeric identifier of the manhwa whose chapters are to be fetched.
 * @returns A promise that resolves with an array of `Chapter` objects, or an empty array if no records are found or an error occurs.
 */
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



/**
 * Updates the view count for a specific chapter.
 * 
 * @param p_chapter_id - The unique identifier of the chapter to update
 */
export async function spUpdateChapterView(p_chapter_id: number) {
    const { error } = await supabase
        .rpc("increment_chapter_view", { p_chapter_id })

    if (error) {
        console.log("error spUpdateChapterView", error)
    }
}


/**
 * Updates the view count for a manhwa card displayed on the HomePage.
 * 
 * This function is used for the random manhwa cards that appear on the HomePage.
 * 
 * @param p_manhwa_id - The unique identifier of the manhwa card to update
 */
export async function spUpdateManhwaCardView(p_manhwa_id: number) {
    const { error } = await supabase
        .rpc("increment_manhwa_card_view", { p_manhwa_id })

    if (error) {
        console.error('error spUpdateManhwaCardView', error);
    }
}


/**
 * Updates the total view count for a specific manhwa.
 * 
 * @param p_manhwa_id - The unique identifier of the manhwa to update
 */
export async function spUpdateManhwaViews(p_manhwa_id: number) {
    const { error } = await supabase
        .rpc('increment_manhwa_views', { p_manhwa_id  });

    if (error) {
        console.error('error spUpdateMangaViews', error);
    }  
}


/**
 * Retrieves application release information from the database. 
 * 
 * @returns Promise resolving to an array of AppRelease objects. Returns empty array on error.
 */
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


/**
 * Fetches images for a specific chapter from the database. 
 * 
 * @param chapter_id - ID of the chapter to fetch images for
 * @returns Promise resolving to an array of ChapterImage objects. Returns empty array on error
 */
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
        const width = Math.min(i.width, AppConstants.SCREEN.WIDTH)
        const height = PixelRatio.roundToNearestPixel((width * i.height) / i.width)
        return { image_url: i.image_url, width, height}
    })
}


/**
 * Submits a request to add a new manhwa to the application.
 * 
 * @param manhwa - Title of the manhwa being requested
 * @param message - Optional additional context or message about the request
 */
export async function spRequestManhwa(manhwa: string, message: string | null) {
    const { error } = await supabase
        .from("manhwa_requests")
        .insert([{manhwa, message}])

    if (error) {
        console.log("error spRequestManhwa")
    }
}


/**
 * Submits a bug report.
 * 
 * Creates a new bug report record with provided details and returns the generated bug ID.
 * 
 * @param title - Short description of the bug
 * @param bug_type - Category/classification of the bug
 * @param device - Optional device information where bug occurred
 * @param descr - Optional detailed description of the bug
 * @param has_images - Flag indicating if bug report includes screenshots
 * @returns Promise resolving to the generated bug ID or null on failure
 */
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


/**
 * Retrieves available donation methods from the database.
 * 
 * @returns Promise resolving to an array of donation methods. Returns empty array on error.
 */
export async function spGetDonationMethods(): Promise<DonateMethod[]> {
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


/**
 * Fetches random manhwa cards for display on the HomePage.
 * 
 * Behavior varies based on debug mode:
 *   - In debug: Returns most recently created cards from cards table
 *   - In production: Calls optimized RPC function for random card selection
 * 
 * @param p_limit - Maximum number of cards to retrieve (default: 30)
 * @returns Promise resolving to array of ManhwaCard objects. Returns empty array on error
 */
export async function spFetchRandomManhwaCards(p_limit: number = 30): Promise<ManhwaCard[]> {
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

export async function spFetchLatestManhwaCardsDebug(p_limit: number = 30): Promise<{
    title: string,
    manhwa_id: number,
    image_url: string
}[]> {
    const { data, error } = await supabase
        .from("cards")
        .select("manhwas (title, manhwa_id), image_url")
        .order("created_at", {ascending: false})
        .limit(p_limit)

    if (error) {
        console.log("error spFetchRandomManhwaCards", error)
        return []
    }
    
    return data.map(i => {
        return {
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


export async function spGetTodayTop10(): Promise<Manhwa[]> {
    const { data, error } = await supabase.rpc("get_top_10_manhwas")

    if (error) {
        console.log("error spGetTodayTop10", error)
        return []
    }

    return data as Manhwa[]
}


export const uploadBugScreenshot = async (uri: string, bug_id: string, index: number) => {
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

    if (error) {
        console.log("error spFetchReleasesAndSourceCode", error)
        return {releases: [], source: []}
    }

    const releases: AppRelease[] = data
        .filter(i => i.type === "release")
        .map(i => {return {version: i.name, url: i.value, action: i.action}})

    const source: SourceCodeLink[] = data
        .filter(i => i.type === "source")
        .map(i => {return {name: i.name, url: i.value}})

    return {releases, source}
}

export async function spFetchSourceCodeLinks(): Promise<SourceCodeLink[]> {
    const { data, error } = await supabase
        .from("app_infos")
        .select('name, value')
        .eq("type", "source")
        .eq("type", "release")

    if (error) {
        console.log("error spFetchSourceCodeLinks", error)
        return []
    }

    return data.map(
        s => {return {
            name: s.name,
            url: s.value
        }}
    )
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


/**
 * Retrieves the current live version of the application from the database.
 * 
 * Fetches the 'live_version' record from the app_infos table. 
 * 
 * @returns Promise resolving to the version string if found, null on error or if not available
 */
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


export async function spFetchCoverImage(manhwa_id: number): Promise<string | null> {
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


export async function spFetchCardAndCoverSearch(p_search_text: string): Promise<DebugManhwaImages[]> {
    const { data, error } = await supabase
        .from("manhwas")
        .select("manhwa_id, title, cover_image_url, cards(image_url)")
        .ilike("title", `%${p_search_text}%`)

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