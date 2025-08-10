

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
    descr: string
    cover_image_url: string
    status: "OnGoing" | "Completed"
    color: string
    views: number
    daily_views: number
    rate: number
    genres: Genre[]
    authors: ManhwaAuthor[]
    chapters: Chapter[]
    updated_at: string
    alt_titles: string[]
}

export type AppRelease = {
    version: string
    url: string
    action: string | null
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
    news_id: number
    title: string
    descr: string
    image_url: string | null
    image_width: number | null
    image_height: number | null
    created_at: string
}


export type UserHistory = {
    manhwas: number
    chapters: number
    images: number
}


export type Todo = {
    todo_id: number
    title: string
    completed: number
    created_at: string
}