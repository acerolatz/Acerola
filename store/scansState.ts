import { Scan } from '@/helpers/types'
import { create } from 'zustand'


type ScanState = {
    scans: Scan[]
    setScans: (scans: Scan[]) => void
}


export const useScanState = create<ScanState>(
    (set) => ({
        scans: [],
        setScans: (scans: Scan[]) => {
            (set((state) => {return {...state, scans}}))
        }
    })
)