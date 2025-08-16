import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Typography } from '@/constants/typography'
import Checkmark from '../util/Checkmark'
import { formatTimestamp, getYesterday, hp, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import { useSQLiteContext } from 'expo-sqlite'
import { dbSetInfo } from '@/lib/database'
import { useSettingsState } from '@/store/settingsState'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import Row from '../util/Row'
import Footer from '../util/Footer'


interface DummyChapterLinkProps {
    index: number
}

const DummyChapterLink = ({index}: DummyChapterLinkProps) => {
    
    return (
        <Row style={{justifyContent: "space-between", paddingRight: 6}} >
            <Text style={[Typography.regular, {fontSize: hp(1.4)}]}>Chapter {index}</Text>
            <Text numberOfLines={1} style={[Typography.regular, {fontSize: hp(1.4)}]}>{formatTimestamp(getYesterday(3 - index).toISOString())}</Text>
        </Row>        
    )
}


const DummyManhwaCard = () => {
    return (
        <View style={{width: wp(45), height: hp(36)}} >
            <Image
                source={require("@/assets/images/Addicted to My Mom.webp")} 
                style={{width: '100%', height: hp(36), borderRadius: AppConstants.COMMON.BORDER_RADIUS}}
                contentFit='cover'
                transition={AppConstants.COMMON.IMAGE_TRANSITION}
                />
            <LinearGradient 
                colors={['transparent', 'transparent', 'rgba(0, 0, 0, 0.7)']} 
                style={StyleSheet.absoluteFill} />
            <View style={styles.manhwaTitleContainer} >
                <Text style={Typography.semibold}>Addicted to My Mom</Text>
            </View>
        </View>
    )
}

const DummyLast3Chapters = ({showLast3Chapters = true}: {showLast3Chapters?: boolean}) => {
    return (
        <View style={{gap: AppConstants.COMMON.GAP, marginRight: wp(1)}} >            
            <DummyManhwaCard/>
            {
            showLast3Chapters &&
                <View style={{width: wp(45), gap: AppConstants.COMMON.MARGIN}} >
                    <DummyChapterLink index={3} />
                    <DummyChapterLink index={2} />
                    <DummyChapterLink index={1} />
                </View>
            }
        </View>
    )
}

const UiForm = () => {

    const db = useSQLiteContext()
    const { settings, setSettings } = useSettingsState()
    const [enable3LastChapter, setEnable3LastChapter] = useState(settings.showLast3Chapters)

    const setLast3 = async () => {
        const newState = !enable3LastChapter
        await dbSetInfo(db, 'show_last_3_chapters', newState ? '1' : '0')
        setEnable3LastChapter(newState)
        setSettings({...settings, showLast3Chapters: newState})
    }

    return (
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always' >
            <View style={{flex: 1, gap: AppConstants.COMMON.GAP, paddingHorizontal: wp(1)}} >
                <Checkmark 
                    title='Last3Chapters' 
                    value={settings.showLast3Chapters}
                    check={setLast3} />
                <Row style={{alignItems: "flex-start"}} >
                    <DummyLast3Chapters />
                    <DummyLast3Chapters showLast3Chapters={false} />
                </Row>
            </View>
            <Footer/>
        </ScrollView>
    )
}

export default UiForm

const styles = StyleSheet.create({
    manhwaTitleContainer: {
        position: 'absolute',
        left: wp(1),
        bottom: wp(1),
        paddingRight: wp(1.2)
    }
})
