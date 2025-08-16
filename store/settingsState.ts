import { Settings } from '@/helpers/types'
import { create } from 'zustand'


type SettingsState = {
    settings: Settings
    setSettings: (settings: Settings) => any
}


export const useSettingsState = create<SettingsState>(
    (set) => ({
        settings: {
            showLast3Chapters: false,
            drawDistance: 0, 
            onEndReachedThreshold: 0
        },
        setSettings: (settings: Settings) => {
            (set((state) => {return {...state, settings}}))
        }
    })
)