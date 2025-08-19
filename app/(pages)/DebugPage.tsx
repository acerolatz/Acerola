import { 
    Keyboard, 
    KeyboardAvoidingView, 
    Platform, 
    Pressable, 
    SafeAreaView, 
    ScrollView, 
    StyleSheet, 
    Text, 
    View 
} from 'react-native'
import { dbFetchDebugInfo, dbSetDebugInfo } from '@/lib/database'
import BooleanRotatingButton from '@/components/buttons/BooleanRotatingButton'
import PageActivityIndicator from '@/components/util/PageActivityIndicator'
import { spFetchCardAndCover, spFetchCardAndCoverLatest, spFetchCardAndCoverSearch } from '@/lib/supabase'
import ReturnButton from '@/components/buttons/ReturnButton'
import { TextInput } from 'react-native-gesture-handler'
import { DebugInfo, DebugManhwaImages } from '@/helpers/types'
import { AppConstants } from '@/constants/AppConstants'
import { Typography } from '@/constants/typography'
import React, { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import Footer from '@/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import TopBar from '@/components/TopBar'
import Row from '@/components/util/Row'
import { Image } from 'expo-image'
import { hasOnlyDigits, hp, sleep, wp } from '@/helpers/util'
import Toast from 'react-native-toast-message'
import { LinearGradient } from 'expo-linear-gradient'


interface ManhwaImagesComponentProps {
    image: DebugManhwaImages
    setCardToShow: React.Dispatch<React.SetStateAction<string | null>>    
}


const ManhwaImagesComponent = ({image, setCardToShow}: ManhwaImagesComponentProps) => {

    const onPress = () => {
        if (image.card) {
            Keyboard.dismiss()
            setCardToShow(image.card)
        }
    }

    return (
        <Pressable onPress={onPress} >
            <View style={styles.debugManhwaImage}>
                { image.cover &&  <Image source={image.cover} style={styles.image} contentFit='cover' /> }
                { image.card && <Image source={image.card} style={styles.image} contentFit='contain' /> }
                <Text style={styles.debugManhwaImageManhwaId} >{image.manhwa_id}</Text>
                <LinearGradient colors={['rgba(0, 0, 0, 0.7)', 'transparent', 'transparent']} style={StyleSheet.absoluteFill} />
                <Text style={styles.debugManhwaImageManhwaTitle} >{image.title}</Text>
            </View>
        </Pressable>
    )
}


const DebugPage = () => {

    const db = useSQLiteContext()
    const [info, setInfo] = useState<DebugInfo | null>(null)
    const [loading, setLoading] = useState(false)
    const [firstRun, setFirstRun] = useState<string>('')
    const [shouldAskForDonation, setShouldAskForDonation] = useState<string>('')
    const [readChapters, setReadChapters] = useState<string>('')
    const [manhwaImage, setManhwaImage] = useState<DebugManhwaImages[]>([])
    const [manhwaId, setManhwaId] = useState<string>('')
    const [cardToShow, setCardToShow] = useState<string | null>(null)
    const [chapterMilestone, setChapterMilestone] = useState('')
    
    useEffect(
        () => {
            const init = async () => {            
                if (manhwaImage.length == 0) {
                    setLoading(true)
                        const m = await spFetchCardAndCoverLatest()
                        setManhwaImage(m)
                        const d = await dbFetchDebugInfo(db)
                        setInfo(d)
                    setLoading(false)
                }
            }
            init()
        },
        []
    )

    const reload = async () => {
        await sleep(150)
        const d = await dbFetchDebugInfo(db)
        setInfo(d)
    }

    const loadManhwaImage = async () => {
        Keyboard.dismiss()
        if (hasOnlyDigits(manhwaId)) {
            const d = await spFetchCardAndCover(parseInt(manhwaId))
            if (d.cover === null) {
                Toast.show({text1: "Not found", type: "error"})
                setManhwaImage([])
            } else {
                setManhwaImage([d])
            }
        } else {
         const d = await spFetchCardAndCoverSearch(manhwaId)
            if (d.length === 0) {
                Toast.show({text1: "No Manhwas found", type: "error"})
            }
            setManhwaImage(d)
        }
    }

    const save = async (debug: DebugInfo) => {
        Keyboard.dismiss()
        await dbSetDebugInfo(db, debug)
        await reload()
    }

    const saveAskForDonation = async () => {
        await save({...info, should_ask_for_donation: shouldAskForDonation === '1' ? '1' : '0'} as any)
    }

    const saveFirstRun = async () => {
        await save({...info, firstRun: firstRun === '1' ? '1' : '0'} as any)
    }

    const saveReadChapters = async () => {
        await save({...info, read_chapters: readChapters !== '' ? parseInt(readChapters) : 0} as any)
    }
    
    const saveMilestone = async () => {
        await save({...info, current_chapter_milestone: chapterMilestone !== '' ? parseInt(chapterMilestone) : 0} as any)
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
                        <ScrollView style={{width: '100%'}} horizontal={true} showsHorizontalScrollIndicator={false} >
                            <Row>                                
                                <Text style={styles.textItem}>manhwas: {info?.total_manhwas}</Text>
                                <Text style={styles.textItem}>chapters: {info?.total_chapters}</Text>
                                <Text style={styles.textItem}>authors: {info?.total_authors}</Text>
                                <Text style={styles.textItem}>images: {info?.images}</Text>
                                <Text style={styles.textItem}>manhwa_authors: {info?.total_manhwa_authors}</Text>
                                <Text style={styles.textItem}>genres: {info?.total_genres}</Text>
                                <Text style={styles.textItem}>manhwa_genres: {info?.total_manhwa_genres}</Text>
                                <Text style={styles.textItem}>reading_status: {info?.total_reading_status}</Text>
                                <Text style={styles.textItem}>reading_history: {info?.total_reading_history}</Text>
                                <Text style={styles.textItem}>device: {info?.device}</Text>
                            </Row>
                        </ScrollView>

                        {/* Manhwa Images */}
                        <Text style={Typography.semibold} >Manhwa Images {manhwaImage.length > 0 ? manhwaImage.length : ''}</Text>
                        <Row style={{gap: AppConstants.GAP}} >
                            <TextInput
                                style={styles.input}
                                value={manhwaId.toString()}
                                onChangeText={setManhwaId}
                            />
                            <Pressable onPress={loadManhwaImage} style={styles.button} >
                                <Text style={styles.buttonText} >SET</Text>
                            </Pressable>
                        </Row>
                        {
                            manhwaImage.length > 0 &&
                            <ScrollView style={{width: '100%'}} horizontal={true} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps='handled' >
                                { 
                                    manhwaImage.map((item, index) => 
                                        <ManhwaImagesComponent 
                                        key={index} 
                                        image={item} 
                                        setCardToShow={setCardToShow} />
                                    ) 
                                }
                            </ScrollView>
                        }

                        {/* First Run */}
                        <View style={styles.title} >
                            <Text style={Typography.semibold} >First Run</Text>
                            <Text style={AppStyle.textOptional} >{info?.first_run}</Text>
                        </View>
                        <Row style={{gap: AppConstants.GAP}} >
                            <TextInput
                                style={styles.input}
                                value={firstRun}
                                keyboardType='numeric'
                                maxLength={1}
                                onChangeText={setFirstRun}
                            />
                            <Pressable onPress={saveFirstRun} style={styles.button} >
                                <Text style={styles.buttonText} >SET</Text>
                            </Pressable>
                        </Row>

                        {/* Should Ask for Donation */}
                        <View style={styles.title} >
                            <Text style={Typography.semibold} >Should Ask for Donation</Text>
                            <Text style={AppStyle.textOptional} >{info?.should_ask_for_donation}</Text>
                        </View>
                        <Row style={{gap: AppConstants.GAP}} >
                            <TextInput
                                style={styles.input}
                                value={shouldAskForDonation}
                                keyboardType='numeric'
                                maxLength={1}
                                onChangeText={setShouldAskForDonation}
                            />
                            <Pressable onPress={saveAskForDonation} style={styles.button} >
                                <Text style={styles.buttonText} >SET</Text>
                            </Pressable>
                        </Row>

                        {/* Num Chapter Readed */}
                        <View style={styles.title} >
                            <Text style={Typography.semibold} >Num Read Chapters</Text>
                            <Text style={AppStyle.textOptional} >{info?.read_chapters}/{info?.current_chapter_milestone}</Text>
                        </View>
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

                        {/* Chapter Milestone */}
                        <View style={styles.title} >
                            <Text style={Typography.semibold} >Chapter Milestone</Text>
                            <Text style={AppStyle.textOptional} >{info?.current_chapter_milestone}</Text>
                        </View>
                        <Row style={{gap: AppConstants.GAP}} >
                            <TextInput
                                style={styles.input}
                                value={chapterMilestone.toString()}
                                keyboardType='numeric'
                                onChangeText={setChapterMilestone}
                            />
                            <Pressable onPress={saveMilestone} style={styles.button} >
                                <Text style={styles.buttonText} >SET</Text>
                            </Pressable>
                        </Row>

                    </View>
                    <Footer height={120} />
                </ScrollView>
            </KeyboardAvoidingView>
            {
                cardToShow &&
                <View style={styles.cardPreviewContainer} >
                    <Pressable onPress={() => setCardToShow(null)} >
                        <Image 
                            source={cardToShow} 
                            style={styles.cardPreviewImage} 
                            contentFit='contain' />
                    </Pressable>
                </View>
            }
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
    },
    image: {
        width: wp(46), 
        height: hp(35), 
        borderRadius: AppConstants.BORDER_RADIUS
    },
    cardPreviewImage: {
        width: AppConstants.RANDOM_MANHWAS.MAX_WIDTH, 
        height: hp(92)
    },
    textItem: {
        ...Typography.light, 
        ...AppStyle.defaultGridItem, 
        color: Colors.backgroundColor
    },
    title: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start",
        gap: AppConstants.GAP
    },
    debugManhwaImage: {
        flexDirection: 'row',
        gap: AppConstants.GAP, 
        borderRadius: AppConstants.BORDER_RADIUS, 
        marginRight: AppConstants.MARGIN * 2, 
        padding: 10, 
        backgroundColor: Colors.white
    },
    debugManhwaImageManhwaTitle: {
        ...Typography.semibold, 
        position: 'absolute', 
        width: '100%', 
        flexShrink: 1, 
        left: 10, 
        top: 10
    },
    debugManhwaImageManhwaId: {
        ...Typography.regular, 
        padding: 10, 
        backgroundColor: Colors.backgroundColor, 
        borderRadius: AppConstants.BORDER_RADIUS, 
        position: 'absolute', 
        flexShrink: 1, 
        left: 10, 
        bottom: 10
    },
    cardPreviewContainer: {
        position: 'absolute', 
        width: wp(100), 
        height: hp(110), 
        left: 0, 
        top: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        alignItems: "center", 
        justifyContent: "center"
    }
})