import DebugLastestManhwaCards from '@/app/components/debug/DebugLastestManhwaCards'
import { 
    FlatList,
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
import { 
    spFetchCardAndCover, 
    spFetchCardAndCoverLatest, 
    spFetchCardAndCoverSearch    
} from '@/lib/supabase'
import PageActivityIndicator from '@/app/components/util/PageActivityIndicator'
import React, { useCallback, useEffect, useState } from 'react'
import { DebugInfo, DebugManhwaImages } from '@/helpers/types'
import ReturnButton from '@/app/components/buttons/ReturnButton'
import { TextInput } from 'react-native-gesture-handler'
import { hasOnlyDigits, hp, wp } from '@/helpers/util'
import { dbFetchDebugInfo } from '@/lib/database'
import { AppConstants } from '@/constants/AppConstants'
import { LinearGradient } from 'expo-linear-gradient'
import { Typography } from '@/constants/typography'
import Toast from 'react-native-toast-message'
import { useSQLiteContext } from 'expo-sqlite'
import Footer from '@/app/components/util/Footer'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import TopBar from '@/app/components/TopBar'
import Row from '@/app/components/util/Row'
import { Image } from 'expo-image'
import DebugForm from '@/app/components/form/DebugForm'
import DebugStats from '@/app/components/debug/DebugStats'


interface ManhwaImagesComponentProps {
    image: DebugManhwaImages
    setCardToShow: React.Dispatch<React.SetStateAction<string | null>>    
}


const ManhwaImagesComponent = ({image, setCardToShow}: ManhwaImagesComponentProps) => {

    const onPress = useCallback(() => {
        if (image.card) {
            Keyboard.dismiss()
            setCardToShow(image.card)
        }
    }, [image.card])

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


const ManhwaImageGrid = ({manhwas, setCardToShow}: {manhwas: DebugManhwaImages[], setCardToShow: any}) => {

    const keyExtractor = useCallback((item: DebugManhwaImages) => item.manhwa_id.toString(), [])

    const renderItem = ({item}: {item: DebugManhwaImages}) => {
        return (
            <ManhwaImagesComponent
                image={item} 
                setCardToShow={setCardToShow} />
        )
    }

    return (
        <FlatList
            data={manhwas}
            keyExtractor={keyExtractor}
            horizontal={true}
            renderItem={renderItem}
        />
    )
}

const DebugPage = () => {

    const db = useSQLiteContext()
    const [loading, setLoading] = useState(false)
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)    

    const [manhwaImage, setManhwaImage] = useState<DebugManhwaImages[]>([])
    const [manhwaId, setManhwaId] = useState<string>('')
    const [cardToShow, setCardToShow] = useState<string | null>(null)

    useEffect(
        () => {
            const init = async () => {            
                if (manhwaImage.length == 0) {
                    setLoading(true)
                        const m = await spFetchCardAndCoverLatest()
                        const d = await dbFetchDebugInfo(db)
                        setManhwaImage(m)
                        setDebugInfo(d)
                    setLoading(false)
                }
            }
            init()
        },
        []
    )


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
                <ReturnButton/>
            </TopBar>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' >
                    <View style={{flex: 1, gap: AppConstants.UI.GAP}} >
                        {debugInfo && <DebugStats debugInfo={debugInfo} />}

                        {/* Manhwa Images */}
                        <Text style={Typography.semibold} >Images {manhwaImage.length > 0 ? manhwaImage.length : ''}</Text>
                        <Row style={{gap: AppConstants.UI.GAP}} >
                            <TextInput
                                style={styles.input}
                                value={manhwaId.toString()}
                                onChangeText={setManhwaId}
                            />
                            <Pressable onPress={loadManhwaImage} style={styles.button} >
                                <Text style={styles.buttonText} >SET</Text>
                            </Pressable>
                        </Row>
                        <ManhwaImageGrid manhwas={manhwaImage} setCardToShow={setCardToShow} />

                        <DebugLastestManhwaCards setCardToShow={setCardToShow} />

                        { debugInfo && <DebugForm debugInfo={debugInfo} setDebugInfo={setDebugInfo} /> }

                    </View>
                    <Footer/>
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
        borderRadius: AppConstants.UI.BORDER_RADIUS
    },
    cardPreviewImage: {
        width: AppConstants.MEDIA.RANDOM_MANHWAS.MAX_WIDTH, 
        height: hp(92)
    },
    textItem: {
        ...Typography.regular, 
        ...AppStyle.defaultGridItem, 
        color: Colors.backgroundColor
    },
    title: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "flex-start",
        gap: AppConstants.UI.GAP
    },
    debugManhwaImage: {
        flexDirection: 'row',
        gap: AppConstants.UI.GAP, 
        borderRadius: AppConstants.UI.BORDER_RADIUS, 
        marginRight: AppConstants.UI.MARGIN * 2, 
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
        borderRadius: AppConstants.UI.BORDER_RADIUS, 
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
    },
    manhwaTitleContainer: {
        position: 'absolute',
        left: wp(2),
        paddingRight: wp(2),
        bottom: 10
    }
})