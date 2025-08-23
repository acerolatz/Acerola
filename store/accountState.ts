import { User } from '@/helpers/types'
import { create } from 'zustand'


type UserState = {
    user: User
    setUser: (user: User) => void    
}


export const useUserState = create<UserState>(
    (set) => ({
        user: {username: null , userCoverImageUrl: null, user_id: null},
        setUser: (user: User) => {
            (set((state) => {return {...state, user}}))
        }        
    })
)