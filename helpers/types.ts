

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
    manga_id: number
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
    manga_id: number
    role: string
    name: string
}

export type Manhwa = {
    manga_id: number
    title: string
    descr: string
    cover_image_url: string
    status: "OnGoing" | "Completed"
    color: string
    updated_at: string
    views: number
    genres: Genre[]
    authors: ManhwaAuthor[]
    chapters: Chapter[]
}

