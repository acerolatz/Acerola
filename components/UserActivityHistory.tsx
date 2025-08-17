import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AppConstants } from '@/constants/AppConstants'
import { useSQLiteContext } from 'expo-sqlite'
import { dbGetUserHistory } from '@/lib/database'
import { UserHistory } from '@/helpers/types'
import { Typography } from '@/constants/typography'
import { formatNumberWithSuffix } from '@/helpers/util'
import { Colors } from '@/constants/Colors'


const UserActivityHistory = () => {

    const db = useSQLiteContext()
    const [userHistory, setUserHistory] = useState<UserHistory>({manhwas: 0, chapters: 0, images: 0})

    useEffect(
        () => {
            const init = async () => {
                const u = await dbGetUserHistory(db)
                setUserHistory(u)
            }
            init()
        },
        []
    )

  return (
    <View style={styles.container} >
        <View style={styles.item}>
            <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{formatNumberWithSuffix(userHistory.images)} images</Text>
        </View>
        <View style={styles.item}>
            <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{formatNumberWithSuffix(userHistory.chapters)} chapters</Text>
        </View>
        <View style={styles.item}>
            <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{formatNumberWithSuffix(userHistory.manhwas)} pornhwas</Text>
        </View>
    </View>
  )
}

export default UserActivityHistory

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
    }
})