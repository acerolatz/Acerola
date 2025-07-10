import { Chapter } from '@/helpers/types'
import { create } from 'zustand'


type ChapterState = {
    chapters: Chapter[]
    currentChapterIndex: number
    setChapters: (chapters: Chapter[]) => void
    setCurrentChapterIndex: (currentChapterIndex: number) => void
    setChapterState: (chapters: Chapter[], currentChapterIndex: number ) => void
}


export const useChapterState = create<ChapterState>(
    (set) => ({
        chapters: [],
        currentChapterIndex: -1,
        setChapters: (chapters: Chapter[]) => {set((state) => {
            return {...state, chapters}
        })},
        setCurrentChapterIndex: (currentChapterIndex: number) => {set((state) => {
            return {...state, currentChapterIndex}
        })},
        setChapterState: (chapters: Chapter[], currentChapterIndex: number ) => {set((state) => {
            return {...state, chapters, currentChapterIndex}
        })}
    })
)