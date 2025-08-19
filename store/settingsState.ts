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
 */
export const useSettingsState = create<SettingsState>(
    (set) => ({
        settings: {
            windowSize: AppConstants.DEFAULT_WINDOW_SIZE, 
            maxToRenderPerBatch: AppConstants.DEFAULT_MAX_TO_RENDER_PER_BATCH,
            updateCellsBatchingPeriod: AppConstants.DEFAULT_UPDATE_CELLS_BATCHING_PERIOD            
        },
        setSettings: (settings: Settings) => {
            (set((state) => {return {...state, settings}}))
        }
    })
)