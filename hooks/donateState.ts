import { DonateMethod } from '@/helpers/types'
import { create } from 'zustand'


type DonateState = {
    donates: DonateMethod[]
    setDonates: (donates: DonateMethod[]) => void
}


/**
 * Zustand store for managing donation methods
 * 
 * This store maintains:
 *   - `donates`: Array of DonateMethod objects representing available donation options
 * 
 * @note 
 *   Donation methods typically include:
 *     - Payment platforms (PayPal, etc.)
 *     - Cryptocurrency wallets
 *     - etc
 */
export const useDonateState = create<DonateState>(
    (set) => ({
        donates: [],
        setDonates: (donates: DonateMethod[]) => {
            (set((state) => {return {...state, donates}}))
        }
    })
)