import { Colors } from '@/constants/Colors'
import { wp } from '@/helpers/util'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'
import React from 'react'

interface ProfileImageBigProps {
    image_url: string | {uri: string} | null
    width: number
    height: number
}


const MAX_WIDTH = wp(90)


const ProfileImageBig = ({image_url, width, height}: ProfileImageBigProps) => {

    const w = width >= MAX_WIDTH ? MAX_WIDTH : width
    const h = w * (height / width)

    if (!image_url) {
        return <Ionicons name='person' size={256} color={Colors.orange} />
    }

    return (
        <Image
            source={image_url} 
            style={{width: w, height: h, borderRadius: 4, alignSelf: "center"}}
            contentFit='cover' 
        />
    )
}

export default ProfileImageBig
