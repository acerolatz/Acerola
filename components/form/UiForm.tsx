import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import TopBar from '../TopBar'
import { Typography } from '@/constants/typography'
import Checkmark from '../util/Checkmark'
import { getYesterday, wp } from '@/helpers/util'
import { AppConstants } from '@/constants/AppConstants'
import ChapterLink from '../chapter/ChapterLink'
import { useSQLiteContext } from 'expo-sqlite'
import { dbSetInfo } from '@/lib/database'
import { useSettingsState } from '@/store/settingsState'


interface DummyChapterLinkProps {
    index: number
}

const DummyChapterLink = ({index}: DummyChapterLinkProps) => {
    
    return (
        <ChapterLink 
            chapter_name={(index + 1).toString()}
            chapter_id={3}
            manhwa_id={42}
            manhwa_title=''
            index={1}
            shouldShowChapterDate={true}
            enabled={false}
            chapter_created_at={getYesterday(index).toISOString()} />
    )
}

const DummyLast3Chapters = () => {
    return (
        <>
            <Text style={Typography.regular}>Last 3 Chapter Component look like this: </Text>
            <View style={{width: wp(46), gap: AppConstants.COMMON.MARGIN}} >
                <DummyChapterLink index={2} />
                <DummyChapterLink index={1} />
                <DummyChapterLink index={0} />
            </View>
        </>
    )
}

const UiForm = () => {

    const db = useSQLiteContext()
    const [enable3LastChapter, setEnable3LastChapter] = useState(false)
    const { settings, setSettings } = useSettingsState()

    const setLast3 = async () => {
        const newState = !enable3LastChapter
        await dbSetInfo(db, 'show_last_3_chapters', newState ? '1' : '0')
        setEnable3LastChapter(newState)
        setSettings({...settings, showLast3Chapters: newState})
    }

    return (
        <>
            <TopBar title='UI'/>
            <Text style={Typography.semibold} >Home Page</Text>
            <Checkmark 
                title='Enable Last 3 Chapters Component in Latest Updates e Most Popular grid' 
                value={enable3LastChapter}
                check={setLast3} />
            <DummyLast3Chapters/>
        </>
    )
}

export default UiForm

const styles = StyleSheet.create({})