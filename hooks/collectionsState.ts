import { Collection } from '@/helpers/types'
import { create } from 'zustand'


type CollectionState = {
    collections: Collection[]
    setCollections: (collections: Collection[]) => void
}


export const useCollectionState = create<CollectionState>(
    (set) => ({
        collections: [],
        setCollections: (collections: Collection[]) => {set((state) => {
            return {...state, collections}
        })}
    })
)