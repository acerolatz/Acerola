import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { useSQLiteContext } from 'expo-sqlite'
import { dbGetUserData } from '@/lib/database'
import { UserData } from '@/helpers/types'
import { Typography } from '@/constants/typography'
import { formatNumberWithSuffix } from '@/helpers/util'
import { Colors } from '@/constants/Colors'


const UserDataComponent = () => {

    const db = useSQLiteContext()
    const [data, setData] = useState<UserData>({
        manhwas: 0, 
        chapters: 0, 
        images: 0,
        device: ''
    })

    useEffect(
        () => {
            const init = async () => {
                const u = await dbGetUserData(db)
                setData(u)
            }
            init()
        },
        []
    )

  return (
    <View style={styles.container} >
        <View style={styles.item}>
            <Text style={styles.text}>{formatNumberWithSuffix(data.images)} images</Text>
        </View>
        <View style={styles.item}>
            <Text style={styles.text}>{formatNumberWithSuffix(data.chapters)} chapters</Text>
        </View>
        <View style={styles.item}>
            <Text style={styles.text}>{formatNumberWithSuffix(data.manhwas)} pornhwas</Text>
        </View>
        <View style={styles.item}>
            <Text style={styles.text}>{data.device}</Text>
        </View>
    </View>
  )
}


export default UserDataComponent


const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: AppConstants.GAP,
        paddingTop: AppConstants.GAP,
        alignItems: "center"
    },
    item: {
        width: '100%',
        height: AppConstants.BUTTON.SIZE,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: AppConstants.BORDER_RADIUS,
        backgroundColor: Colors.primary
    },
    text: {
        ...Typography.regular, 
        color: Colors.backgroundColor, 
        textAlign: "center"
    }
})