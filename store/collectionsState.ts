import { Collection } from '@/helpers/types'
import { create } from 'zustand'


type CollectionState = {
    collections: Collection[]
    setCollections: (collections: Collection[]) => void
}


/**
 * Zustand store for managing pornhwa collections
 * 
 * This store maintains:
 *   - `collections`: Array of Collection objects
 * 
 * The `setCollections` function provides a centralized way to update the entire collections array
 * 
 * @note Collections represent groups of manhwas such as:
 *     - MILF
 *     - Inverted Nipples
 *     - Threesomes
 *     - etc
 */
export const useCollectionState = create<CollectionState>(
    (set) => ({
        collections: [],
        setCollections: (collections: Collection[]) => {set((state) => {
            return {...state, collections}
        })}
    })
)