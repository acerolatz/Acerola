import { Manhwa } from '@/helpers/types'
import { create } from 'zustand'


type Top10State = {
    top10Manhwas: Manhwa[]
    setTop10Manhwas: (manhwas: Manhwa[]) => void
}


export const useTop10State = create<Top10State>(
    (set) => ({
        top10Manhwas: [],
        setTop10Manhwas: (top10Manhwas: Manhwa[]) => {
            (set((state) => {return {...state, top10Manhwas}}))
        }
    })
)