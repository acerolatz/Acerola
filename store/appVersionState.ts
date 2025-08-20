import { ReleaseWrapper } from '@/helpers/types'
import { create } from 'zustand'


type AppVersionState = {
    localVersion: string | null
    setLocalVersion: (version: string | null) => void
    
    liveVersion: string | null
    setLiveVersion: (liveVersion: string | null) => any
    
    releasesInfo: ReleaseWrapper
    setReleasesInfo: (releasesInfo: ReleaseWrapper) => void

    shouldShowNewAppVersionWarning: boolean,
    setShouldShowNewAppVersionWarning: (shouldShowNewAppVersionWarning: boolean) => any
}


/**
 * Zustand store for managing application version information
 * 
 * This store tracks:
 *   - Current installed version (localVersion)
 *   - Latest available version (liveVersion)
 *   - Release metadata (releasesInfo)
 *   - UI flag for new version warnings (shouldShowNewAppVersionWarning)
 * 
 * State properties:
 *   - localVersion: Currently installed app version (null if unset)
 *   - setLocalVersion: Updates the local version string
 * 
 *   - liveVersion: Latest available version from server (null if unset)
 *   - setLiveVersion: Updates the live version string
 * 
 *   - releasesInfo: Container for release metadata including:
 *        - releases: Available release versions
 *        - source: Source of release information
 *   - setReleasesInfo: Updates release metadata
 * 
 *   - shouldShowNewAppVersionWarning: Flag controlling new version alerts
 *   - setShouldShowNewAppVersionWarning: Updates warning visibility state 
 */
export const useAppVersionState = create<AppVersionState>(
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