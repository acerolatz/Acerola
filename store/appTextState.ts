import { create } from 'zustand'


type TextState = {
    textMap: Map<string, string>
    setTextMap: (textMap: Map<string, string>) => void    
}


/**
 * Zustand store for managing text content
 * 
 * State properties:
 *   - textMap: Map storing key-value pairs of text identifiers and their localized content
 *   - setTextMap: Function to replace the entire textMap with a new instance
 * 
 */
export const useTextState = create<TextState>(
    (set) => ({
        textMap: new Map<string, string>,
        setTextMap: (textMap: Map<string, string>) => {
            (set((state) => {return {...state, textMap}}))
        }        
    })
)