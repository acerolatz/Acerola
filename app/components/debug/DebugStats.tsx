import { ScrollView,  StyleSheet, Text } from 'react-native'
import { Typography } from '@/constants/typography'
import { AppStyle } from '@/styles/AppStyle'
import { DebugInfo } from '@/helpers/types'
import { Colors } from '@/constants/Colors'
import Row from '../util/Row'
import React from 'react'


const DebugStats = ({debugInfo}: {debugInfo: DebugInfo}) => {
    return (
        <ScrollView style={styles.container} horizontal={true} showsHorizontalScrollIndicator={false} >
            <Row>
                <Text style={styles.textItem}>manhwas: {debugInfo.total_manhwas}</Text>
                <Text style={styles.textItem}>images: {debugInfo.images}</Text>
                <Text style={styles.textItem}>reading_status: {debugInfo.total_reading_status}</Text>
                <Text style={styles.textItem}>reading_history: {debugInfo.total_reading_history}</Text>
                <Text style={styles.textItem}>authors: {debugInfo.total_authors}</Text>
                <Text style={styles.textItem}>manhwa_authors: {debugInfo.total_manhwa_authors}</Text>
                <Text style={styles.textItem}>genres: {debugInfo.total_genres}</Text>
                <Text style={styles.textItem}>manhwa_genres: {debugInfo.total_manhwa_genres}</Text>
                <Text style={styles.textItem}>device: {debugInfo.device}</Text>
            </Row>
        </ScrollView>
    )
}


export default DebugStats


const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    textItem: {
        ...Typography.regular, 
        ...AppStyle.defaultGridItem, 
        color: Colors.backgroundColor
    }
})