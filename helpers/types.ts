

export type Genre = {
    genre: string
    genre_id: number    
}


export type Chapter = {
    chapter_id: number
    manhwa_id: number
    chapter_name: string
    chapter_num: number
    created_at: string
}


export type Author = {
    author_id: number
    name: string
    role: string
}

export type ManhwaAuthor = {
    author_id: number
    manhwa_id: number
    role: string
    name: string
}

export type Manhwa = {
    manhwa_id: number
    title: string
    views: number
    descr: string
    cover_image_url: string
    status: "OnGoing" | "Completed"
    updated_at: string
    color: string
    chapters: Chapter[]
    genres: Genre[]
    authors: ManhwaAuthor[]
    alt_titles: string[]
}

export type AppRelease = {
    version: string
    url: string
    descr: string | null
}

export type ManhwaGenre = {
    manhwa_id: number
    genre_id: number
}

export type ChapterImage = {
    image_url: string
    width: number
    height: number
}

export type DonateMethod = {
    method: string
    value: string
    action: string
}

export type ManhwaCard = {
    title: string
    manhwa_id: number
    image_url: string
    width: number
    height: number
    normalizedWidth: number
    normalizedHeight: number
}

export type Scan = {
    name: string
    url: string
}

export type Collection = {
    collection_id: number
    name: string
}

export type Post = {
    title: string
    message: string
    created_at: string
}


export type UserData = {
    chapters: number
    images: number
    supportedAbis: string
}


export type Todo = {
    todo_id: number
    title: string
    descr: string | null
    completed: number
    created_at: string
    finished_at: string | null
}


export type SourceCodeLink = {
    name: string // GitLab, GitHub etc
    url: string
}

export type BugType = "Bug" | "ImagesOutOfOrder" | "MissingImages" | "Broken" | "Other" | "Sugestion"


export type ReleaseWrapper = {
    releases: AppRelease[],
    source: SourceCodeLink[]
}

export type Feedback = {
    title: string
    descr: string
    created_at: string
}

export type DownloadProgress = {
  current: number
  total: number
  percentage: number
}


export type DebugInfo = {
    device: string
    first_run: number
    should_ask_for_donation: number
    last_sync_time: string
    images: number
    current_chapter_milestone: number
    total_manhwas: number
    total_authors: number
    total_genres: number
    total_manhwa_genres: number
    total_manhwa_authors: number
    total_reading_status: number
    total_reading_history: number;
    read_chapters: number
}


export type DebugManhwaImages = {
    title: string
    manhwa_id: number
    cover: string | null
    card: string | null
}

export type Log = {
    title: string
    descr: string | null
    created_at: number
}
