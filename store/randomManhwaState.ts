import { ManhwaCard } from '@/helpers/types'
import { create } from 'zustand'


type ManhwaCardState = {
    cards: ManhwaCard[]
    setCards: (cards: ManhwaCard[]) => void
}


/**
 * Zustand store for managing manhwa cards displayed on the HomePage
 * 
 * This store maintains:
 *   - `cards`: Array of ManhwaCard objects representing random cards shown on HomePage
 * 
 * The `setCards` function provides a centralized way to update the entire card array
 */
export const useManhwaCardsState = create<ManhwaCardState>(
    (set) => ({
        cards: [],
        setCards: (cards: ManhwaCard[]) => {
            (set((state) => {return {...state, cards}}))
        }
    })
)