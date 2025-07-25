import { Scan } from '@/helpers/types'
import { create } from 'zustand'


type ScanState = {
    title: string | null
    scans: Scan[]
    setScans: (scans: Scan[]) => void
    setTitle: (title: string | null) => void
}


export const useScanState = create<ScanState>(
    (set) => ({
        scans: [],
        setScans: (scans: Scan[]) => {
            (set((state) => {return {...state, scans}}))
        },
        title: null,
        setTitle: (title: string | null) => {
            (set((state) => {return {...state, title}}))
        }
    })
)