

export type OugiUser = {
    username: string
    user_id: string
    profile_image_url: string
    profile_image_width: number
    profile_image_height: number
}

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
    genres: Genre[]
    authors: ManhwaAuthor[]
    chapters: Chapter[]
    updated_at: string
}

export type AppRelease = {
    release_id: number
    version: string
    url: string
    descr: string | null
    created_at: string
}

export type ManhwaGenre = {
    manhwa_id: number
    genre_id: number
    genre: string
}