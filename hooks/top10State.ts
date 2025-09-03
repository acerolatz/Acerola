import { Manhwa } from '@/helpers/types'
import { create } from 'zustand'


type Top10ManhwasState = {
    top10manhwas: Manhwa[]
    setTop10manhwas: (top10manhwas: Manhwa[]) => void
}


export const useTop10ManhwasState = create<Top10ManhwasState>(
    (set) => ({
        top10manhwas: [],
        setTop10manhwas: (top10manhwas: Manhwa[]) => {
            (set((state) => {return {...state, top10manhwas}}))
        }
    })
)