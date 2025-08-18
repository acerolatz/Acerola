import { Keyboard, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import { DebugInfo } from '@/helpers/types'
import { useSQLiteContext } from 'expo-sqlite'
import { dbDebugSetNumChapterRead, dbFetchDebugInfo, dbSetDebugInfo } from '@/lib/database'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import Row from '@/components/util/Row'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import BooleanRotatingButton from '@/components/buttons/BooleanRotatingButton'
import { Typography } from '@/constants/typography'
import { TextInput } from 'react-native-gesture-handler'
import Footer from '@/components/util/Footer'
import Toast from 'react-native-toast-message'
import { ToastMessages } from '@/constants/Messages'

const DebugPage = () => {

    const db = useSQLiteContext()
    const [info, setInfo] = useState<DebugInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [firstRun, setFirstRun] = useState<string>(info ? info.first_run! : '0')
    const [shouldAskForDonation, setShouldAskForDonation] = useState<string>(info ? info.should_ask_for_donation! : '0')
    const [readChapters, setReadChapters] = useState<string>(info ? info.read_chapters!.toString() : '0')

    const reload = async () => {
        setLoading(true)
            const d = await dbFetchDebugInfo(db)
            setInfo(d)
        setLoading(false)
    }

    const saveReadChapters = async () => {
        Keyboard.dismiss()
        await dbDebugSetNumChapterRead(db, parseInt(readChapters))
        await reload()
    }

    useEffect(
        () => {
            reload()
        },
        []
    )

    const save = async (debug: DebugInfo) => {
        Keyboard.dismiss()
        await dbSetDebugInfo(db, debug)
        await reload()
    }

    if (loading) {
        return (
            <SafeAreaView style={AppStyle.safeArea} >
                <TopBar title='Debug' >
                    <ReturnButton/>
                </TopBar>
                <PageActivityIndicator/>
            </SafeAreaView>    
        )   
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Debug' >
                <Row style={{gap: AppConstants.ICON.SIZE}} >
                    <BooleanRotatingButton onPress={reload} iconColor={Colors.primary} />
                    <ReturnButton/>
                </Row>
            </TopBar>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' >
                    <View style={{flex: 1, gap: AppConstants.GAP}} >
                        <Text style={Typography.regular}>manhwas: {info?.total_manhwas}</Text>
                        <Text style={Typography.regular}>chapters: {info?.total_chapters}</Text>
                        <Text style={Typography.regular}>authors: {info?.total_authors}</Text>
                        <Text style={Typography.regular}>manhwa_authors: {info?.total_manhwa_authors}</Text>
                        <Text style={Typography.regular}>genres: {info?.total_genres}</Text>
                        <Text style={Typography.regular}>manhwa_genres: {info?.total_manhwa_genres}</Text>
                        <Text style={Typography.regular}>reading_status: {info?.total_reading_status}</Text>
                        <Text style={Typography.regular}>reading_history: {info?.total_reading_history}</Text>
                        <Text style={Typography.regular}>device: {info?.device}</Text>
                        <Text style={Typography.regular}>first_run: {info?.first_run}</Text>
                        <Text style={Typography.regular}>should_ask_for_donation: {info?.should_ask_for_donation}</Text>
                        <Text style={Typography.regular}>show_last_3_chapters: {info?.show_last_3_chapters}</Text>
                        <Text style={Typography.regular}>images: {info?.images}</Text>
                        <Text style={Typography.regular}>current_chapter_milestone: {info?.current_chapter_milestone}</Text>
                        <Text style={Typography.regular}>read_chapters: {info?.read_chapters}</Text>

                        {/* First Run */}
                        <Text style={Typography.semibold} >First Run</Text>
                        <Row style={{gap: AppConstants.GAP}} >
                            <TextInput
                                style={styles.input}
                                value={firstRun}
                                keyboardType='numeric'
                                maxLength={1}
                                onChangeText={setFirstRun}
                            />
                            <Pressable onPress={() => save({...info, first_run: firstRun!} as any)} style={styles.button} >
                                <Text style={styles.buttonText} >SET</Text>
                            </Pressable>
                        </Row>

                        {/* Should Ask for Donation */}
                        <Text style={Typography.semibold} >Should Ask for Donation</Text>
                        <Row style={{gap: AppConstants.GAP}} >
                            <TextInput
                                style={styles.input}
                                value={shouldAskForDonation}
                                keyboardType='numeric'
                                maxLength={1}
                                onChangeText={setShouldAskForDonation}
                            />
                            <Pressable onPress={() => save({...info, should_ask_for_donation: shouldAskForDonation} as DebugInfo)} style={styles.button} >
                                <Text style={styles.buttonText} >SET</Text>
                            </Pressable>
                        </Row>

                        {/* Num Chapter Readed */}
                        <Text style={Typography.semibold} >Num Read Chapterss</Text>
                        <Row style={{gap: AppConstants.GAP}} >
                            <TextInput
                                style={styles.input}
                                value={readChapters.toString()}
                                keyboardType='numeric'
                                onChangeText={setReadChapters}
                            />
                            <Pressable onPress={saveReadChapters} style={styles.button} >
                                <Text style={styles.buttonText} >SET</Text>
                            </Pressable>
                        </Row>
                    </View>
                    <Footer/>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default DebugPage

const styles = StyleSheet.create({
    input: {
        ...AppStyle.input, 
        flex: 0.8
    },
    button: {
        ...AppStyle.button, 
        flex: 0.2
    },
    buttonText: {
        ...Typography.regular, 
        color: Colors.backgroundColor
    }
})