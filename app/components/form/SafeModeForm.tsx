import { 
    Keyboard, 
    Platform, 
    Pressable, 
    ScrollView,
    StyleSheet,
    Text, 
    TextInput, 
    View 
} from 'react-native'
import { dbCreateSafeModePassword, dbSetSafeModeState } from '@/lib/database'
import { AppConstants } from '@/constants/AppConstants'
import { ToastMessages } from '@/constants/Messages'
import { Typography } from '@/constants/typography'
import { hasOnlyDigits, wp } from '@/helpers/util'
import Toast from 'react-native-toast-message'
import { useSQLiteContext } from 'expo-sqlite'
import { AppStyle } from '@/styles/AppStyle'
import React, { useState } from 'react'
import Footer from '../util/Footer'


interface SafeModeFormProps {
    safeModePassword: string 
    safeModeOn: boolean
}


const SafeModeForm = ({safeModePassword, safeModeOn}: SafeModeFormProps) => {

    const db = useSQLiteContext()
    const [currentSafeModePassword, setCurrentSafeModePassword] = useState(safeModePassword)
    const [confirmPassword, setConfirmPassword] = useState(safeModePassword)
    const [isSafeModeOn, setIsSafeModeOn] = useState(safeModeOn)
    const [loadingSafeModeConfig, setLoadingSafeModeConfig] = useState(false)

    const isValidPassword = (p: string): boolean  => {
        return p.trim().length >= 4 && hasOnlyDigits(p)
    }
    
    const submitPassword = async () => {
        Keyboard.dismiss()
        setLoadingSafeModeConfig(true)
            const check1 = isValidPassword(currentSafeModePassword)
            const check2 = isValidPassword(confirmPassword)
            const check3 = currentSafeModePassword.trim() === confirmPassword.trim()
            if (!(check1 && check2 && check3)) {
                Toast.show(ToastMessages.EN.INVALID_PASSWORD)
                setLoadingSafeModeConfig(false)
                return
            } 
            await dbCreateSafeModePassword(db, currentSafeModePassword.trim())
            if (isSafeModeOn) {
                setIsSafeModeOn(false)
                await dbSetSafeModeState(db, false)
                Toast.show(ToastMessages.EN.SAFE_MODE_DISABLED)
            } else {
                setIsSafeModeOn(true)
                await dbSetSafeModeState(db, true)
                Toast.show(ToastMessages.EN.SAFE_MODE_ENABLED)
            }            
        setLoadingSafeModeConfig(false)
    }

    return (
        <ScrollView style={AppStyle.flex} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' >
            <View style={styles.container} >
                <Text style={AppStyle.error}>{isSafeModeOn ? 'enabled' : 'disabled'}</Text>
                <Text style={Typography.regular}>When safe mode is enabled, {AppConstants.APP.NAME} will function as a simple to-do list. To unlock the main content, you will need the numeric password you define below.</Text>
                <Text style={Typography.regularRed}>If you forget the password, it cannot be reset or recovered. You must delete the app data via {Platform.OS} settings to regain access to the main content.</Text>
                <Text style={Typography.regularRed}>Changes to Safe Mode settings will be applied when the app restarts.</Text>
                
                <Text style={Typography.regular} >Password</Text>
                <TextInput
                    style={AppStyle.input}
                    keyboardType='numeric'
                    onChangeText={setCurrentSafeModePassword}
                    value={currentSafeModePassword.toString()}/>

                <Text style={Typography.regular} >Confirm Password</Text>
                <TextInput
                    style={AppStyle.input}
                    keyboardType='numeric'
                    onChangeText={setConfirmPassword}
                    value={confirmPassword.toString()}/>

                {
                    loadingSafeModeConfig ?
                    <View style={AppStyle.formButton} >
                        <Text style={Typography.regularBlack}>{safeModeOn ? 'Disable' : 'Enable'} Safe Mode</Text>
                    </View>
                    :
                    <Pressable onPress={submitPassword} style={AppStyle.formButton} >
                        <Text style={Typography.regularBlack}>{isSafeModeOn ? 'Disable' : 'Enable'} Safe Mode</Text>
                    </Pressable>
                }
            </View>
            <Footer/>
        </ScrollView>        
    )
}

export default SafeModeForm


const styles = StyleSheet.create({
    container: {
        flex: 1, 
        gap: AppConstants.UI.GAP, 
        paddingHorizontal: wp(1)
    }
})