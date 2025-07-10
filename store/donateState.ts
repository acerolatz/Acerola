import { DonateMethod } from '@/helpers/types'
import { create } from 'zustand'


type DonateState = {
    donates: DonateMethod[]
    setDonates: (donates: DonateMethod[]) => void
}


export const useDonateState = create<DonateState>(
    (set) => ({
        donates: [],
        setDonates: (donates: DonateMethod[]) => {
            (set((state) => {return {...state, donates}}))
        }
    })
)