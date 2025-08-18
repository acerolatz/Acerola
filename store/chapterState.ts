import { Chapter } from '@/helpers/types'
import { create } from 'zustand'


type ChapterState = {
    chapters: Chapter[]
    currentChapterIndex: number
    setChapters: (chapters: Chapter[]) => void
    setCurrentChapterIndex: (currentChapterIndex: number) => void
    setChapterState: (chapters: Chapter[], currentChapterIndex: number ) => void
}


/**
 * Zustand store for managing chapter navigation state
 * 
 * This store maintains:
 *   - List of chapters (chapters)
 *   - Index of the currently active chapter (currentChapterIndex)
 * 
 * State management functions:
 *   - setChapters: Updates the entire chapter list
 *   - setCurrentChapterIndex: Updates only the active chapter index
 *   - setChapterState: Updates both chapter list and active index simultaneously
 */
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