import { OugiUser } from '@/helpers/types'
import { Session } from '@supabase/supabase-js'
import { create } from 'zustand'


type AuthState = {
    user: OugiUser | null
    session: Session | null
    changeUserName: (username: string) => void
    changeProfileImage: (image_url: string, width: number, height: number) => void
    setUser: (user: OugiUser | null) => void,
    login: (user: OugiUser, session: Session | null) => void
    logout: () => void
}


export const useAuthState = create<AuthState>(
    (set) => ({
        user: null,
        session: null,
        login: (user: OugiUser, session: Session | null) => {
            (set((state) => {return {...state, user, session}}))
        },
        logout: () => {
            set((state) => {return {...state, user: null, session: null}})
        },
        setUser: (user: OugiUser | null) => {
            set((state) => {return {...state, user: user}})
        },
        changeUserName: (username: string) => {
            set((state) => {
                return {
                    ...state, 
                    user: {
                        user_id: state.user!.user_id, 
                        username, 
                        profile_image_url: state.user!.profile_image_url, 
                        profile_image_width: state.user!.profile_image_width, 
                        profile_image_height: state.user!.profile_image_height
                    }}
            })
        },
        changeProfileImage: (image_url: string, width: number, height: number) => {
            set((state) => {
                return {
                    ...state, 
                    user: {
                        user_id: state.user!.user_id, 
                        username: state.user!.username, 
                        profile_image_url: image_url,
                        profile_image_width: width, 
                        profile_image_height: height
                    }}
            })
        }
    })
)