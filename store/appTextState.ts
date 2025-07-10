import { create } from 'zustand'


type TextState = {
    textMap: Map<string, string>
    setTextMap: (textMap: Map<string, string>) => void    
}


export const useTextState = create<TextState>(
    (set) => ({
        textMap: new Map<string, string>,
        setTextMap: (textMap: Map<string, string>) => {
            (set((state) => {return {...state, textMap}}))
        }        
    })
)