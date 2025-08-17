import { Pressable, StyleSheet, Text } from 'react-native'
import React, { useCallback, useEffect, useRef } from 'react'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import TopBar from '../TopBar'
import CloseBtn from '../buttons/CloseButton'
import Row from '../util/Row'
import { Typography } from '@/constants/typography'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import Footer from '../util/Footer'
import { AppConstants } from '@/constants/AppConstants'
import { router } from 'expo-router'
import { useAppVersionState } from '@/store/appVersionState'
import { spFetchLiveVersion } from '@/lib/supabase'


const NewAppReleaseBottomSheet = () => {
    
    const bottomSheetRef = useRef<BottomSheet>(null)
    
    const { 
        shouldShowNewAppVersionWarning,
        setShouldShowNewAppVersionWarning,
        localVersion 
    } = useAppVersionState()    

    useEffect(
        () => {
            const init = async () => {
                const l = await spFetchLiveVersion()
                if (l !== null && l != localVersion && shouldShowNewAppVersionWarning) {
                    bottomSheetRef.current?.expand()
                }   
            }
            init()
        },
        []
    )

    const handleCloseBottomSheet = useCallback(() => {
        bottomSheetRef.current?.close();
    }, []);

    const openReleasesPage = () => {
        handleCloseBottomSheet()
        router.navigate("/(pages)/ReleasesPage")
    }

    const dismissNewAppVersionWarning = () => {
        setShouldShowNewAppVersionWarning(false)
        handleCloseBottomSheet()
    }

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            handleStyle={styles.handleStyle}
            backgroundStyle={styles.bottomSheetBackgroundStyle}
            enablePanDownToClose={true}>
            <BottomSheetView style={styles.bottomSheetContainer} >
                <TopBar title='New version available!'>
                    <CloseBtn onPress={handleCloseBottomSheet}/>
                </TopBar>
                <Row style={{gap: 10}} >
                    <Pressable onPress={handleCloseBottomSheet} style={AppStyle.buttonCancel} >
                        <Text style={[Typography.regular, {color: Colors.primary}]} >Close</Text>
                    </Pressable>
                    <Pressable onPress={openReleasesPage} style={AppStyle.button} >
                        <Text style={[Typography.regular, {color: Colors.backgroundColor}]} >Update!</Text>
                    </Pressable>
                </Row>
                <Pressable onPress={dismissNewAppVersionWarning} >
                    <Text style={styles.textLink}>Dismiss for now</Text>
                </Pressable>
                <Footer height={80}/>
            </BottomSheetView>
        </BottomSheet>
    )
}

export default NewAppReleaseBottomSheet

const styles = StyleSheet.create({
    bottomSheetContainer: {
        paddingHorizontal: AppConstants.SCREEN.PADDING_HORIZONTAL, 
        paddingTop: 10,
        gap: AppConstants.GAP
    },
    handleStyle: {
        backgroundColor: Colors.backgroundSecondary, 
        borderTopLeftRadius: 12, 
        borderTopEndRadius: 12
    },
    handleIndicatorStyle: {
        backgroundColor: Colors.primary
    },
    bottomSheetBackgroundStyle: {
        backgroundColor: Colors.backgroundSecondary
    },
    textLink: {
        ...Typography.light,
        marginTop: 10,
        textDecorationLine: 'underline'
    }
})