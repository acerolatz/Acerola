import { ReleaseWrapper } from '@/helpers/types'
import { create } from 'zustand'


type AppReleaseState = {
    localVersion: string | null
    setLocalVersion: (version: string | null) => void
    
    liveVersion: string | null
    setLiveVersion: (liveVersion: string | null) => any
    
    releasesInfo: ReleaseWrapper
    setReleasesInfo: (releasesInfo: ReleaseWrapper) => void

    shouldShowNewAppVersionWarning: boolean,
    setShouldShowNewAppVersionWarning: (shouldShowNewAppVersionWarning: boolean) => any
}


export const useAppVersionState = create<AppReleaseState>(
    (set) => ({
        liveVersion: null,
        setLiveVersion: (liveVersion: string | null) => {
            (set((state) => {return {...state, liveVersion}}))
        },
        
        localVersion: null,
        setLocalVersion: (localVersion: string | null) => {
            (set((state) => {return {...state, localVersion}}))
        },
        
        releasesInfo: {releases: [], source: []},
        setReleasesInfo: (releasesInfo: ReleaseWrapper) => {
            (set((state) => {return {...state, releasesInfo}}))
        },

        shouldShowNewAppVersionWarning: true,
        setShouldShowNewAppVersionWarning: (shouldShowNewAppVersionWarning: boolean) => {
            (set((state) => {return {...state, shouldShowNewAppVersionWarning}}))
        },
    })
)