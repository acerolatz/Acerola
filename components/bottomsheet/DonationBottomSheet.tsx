import { Pressable, StyleSheet, Text } from 'react-native'
import React, { useCallback, useRef } from 'react'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import CloseBtn from '../buttons/CloseButton'
import TopBar from '../TopBar'
import Row from '../util/Row'
import Footer from '../util/Footer'
import { useSQLiteContext } from 'expo-sqlite'
import { dbIsChapterMilestoneReached, dbSetShouldAskForDonation } from '@/lib/database'
import { router, useFocusEffect } from 'expo-router'
import { AppStyle } from '@/styles/AppStyle'


const DonationBottomSheet = () => {

    const db = useSQLiteContext()
    const bottomSheetRef = useRef<BottomSheet>(null)

    const handleOpenDonationBottomSheet = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);
    
    const handleCloseDonationBottomSheet = useCallback(() => {
        bottomSheetRef.current?.close();        
    }, []);    
    
    const neverShowDonationMessageAgain =  async () => {
        await dbSetShouldAskForDonation(db, '0')
        handleCloseDonationBottomSheet()
    }
    
    const openDonatePage = () => {
        handleCloseDonationBottomSheet()
        router.navigate("/(pages)/DonatePage")
    }

    useFocusEffect(
        useCallback(
            () => {
                const reload = async () => {
                    await dbIsChapterMilestoneReached(db)
                        .then(s => s ? handleOpenDonationBottomSheet() : null)
                }
                reload()
            },
            []
        )
    )

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            handleIndicatorStyle={styles.handleIndicatorStyle}
            handleStyle={styles.handleStyle}
            backgroundStyle={styles.bottomSheetBackgroundStyle}
            enablePanDownToClose={true}>
            <BottomSheetView style={styles.bottomSheetContainer} >
                <TopBar title={AppConstants.DONATION.BOTTOMSHEET.TITLE}>
                    <CloseBtn onPress={handleCloseDonationBottomSheet}/>
                </TopBar>
                <Text style={Typography.regular}>{AppConstants.DONATION.BOTTOMSHEET.MESSAGE}</Text>
                <Row style={{gap: 10}} >
                    <Pressable onPress={handleCloseDonationBottomSheet} style={AppStyle.buttonCancel} >
                        <Text style={[Typography.regular, {color: Colors.primary}]} >Close</Text>
                    </Pressable>
                    <Pressable onPress={openDonatePage} style={AppStyle.button} >
                        <Text style={[Typography.regular, {color: Colors.backgroundSecondary}]} >Donate</Text>
                    </Pressable>
                </Row>
                <Pressable onPress={neverShowDonationMessageAgain} hitSlop={AppConstants.HIT_SLOP.LARGE} >
                    <Text style={styles.textLink}>Never show again.</Text>
                </Pressable>
                <Footer height={80}/>
            </BottomSheetView>
        </BottomSheet>
  )
}

export default DonationBottomSheet

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