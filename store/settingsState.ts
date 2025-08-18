import { AppConstants } from '@/constants/AppConstants'
import { Settings } from '@/helpers/types'
import { create } from 'zustand'


type SettingsState = {
    settings: Settings
    setSettings: (settings: Settings) => any
}


/**
 * Zustand store for managing application settings
 * 
 * This store maintains:
 *   - `settings`: Object containing various user-configurable options
 * 
 * Current settings include:
 *   - showLast3Chapters: Toggles display of only recent chapters (default: false)
 *   - drawDistance: Virtualized list rendering distance optimization (default: 0)
 *   - onEndReachedThreshold: Threshold for triggering list end detection (default: 0)
 *  
 */
export const useSettingsState = create<SettingsState>(
    (set) => ({
        settings: {
            showLast3Chapters: false,
            drawDistance: AppConstants.DEFAULT_DRAW_DISTANCE, 
            onEndReachedThreshold: AppConstants.DEFAULT_ON_END_REACHED_THRESHOLD            
        },
        setSettings: (settings: Settings) => {
            (set((state) => {return {...state, settings}}))
        }
    })
)