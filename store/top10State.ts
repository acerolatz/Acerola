import { Manhwa } from '@/helpers/types'
import { create } from 'zustand'


type Top10ManhwasState = {
    top10manhwas: Manhwa[]
    setTop10manhwas: (top10manhwas: Manhwa[]) => void
}


/** 
 * This store maintains:
 *   - `top10manhwas`: Array of Manhwa objects representing the daily highest-ranked manhwas
 * 
 * The `setTop10manhwas` function provides a centralized way to update the daily top 10 list
 *  
 */
export const useTop10ManhwasState = create<Top10ManhwasState>(
    (set) => ({
        top10manhwas: [],
        setTop10manhwas: (top10manhwas: Manhwa[]) => {
            (set((state) => {return {...state, top10manhwas}}))
        }
    })
)