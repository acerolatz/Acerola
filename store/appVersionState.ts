import { AppRelease } from '@/helpers/types'
import { create } from 'zustand'


type AppReleaseState = {
    localVersion: string | null
    setLocalVersion: (version: string | null) => void
    allReleases: AppRelease[]
    setAllReleases: (allReleases: AppRelease[]) => void
}


export const useAppVersionState = create<AppReleaseState>(
    (set) => ({
        localVersion: null,
        setLocalVersion: (localVersion: string | null) => {
            (set((state) => {return {...state, localVersion}}))
        },
        allReleases: [],
        setAllReleases: (allReleases: AppRelease[]) => {
            (set((state) => {return {...state, allReleases}}))
        }
    })
)