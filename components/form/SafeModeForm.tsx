import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import TopBar from '../TopBar'
import { AppStyle } from '@/styles/AppStyle'
import { Colors } from '@/constants/Colors'
import { Typography } from '@/constants/typography'
import { AppConstants } from '@/constants/AppConstants'
import { hasOnlyDigits, wp } from '@/helpers/util'
import Toast from 'react-native-toast-message'
import { useSQLiteContext } from 'expo-sqlite'
import { dbCreateSafeModePassword, dbSetSafeModeState } from '@/lib/database'

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
                Toast.show({
                    text1: "Invalid Password", 
                    text2: "Min 4 characters and passwords must match", 
                    type: 'error', 
                    visibilityTime: 3500
                })
                setLoadingSafeModeConfig(false)
                return
            } 
            await dbCreateSafeModePassword(db, currentSafeModePassword.trim())
            if (isSafeModeOn) {
                setIsSafeModeOn(false)
                await dbSetSafeModeState(db, false)
                Toast.show({text1: "Safe Mode Disabled!", type: "success"})
            } else {
                setIsSafeModeOn(true)
                await dbSetSafeModeState(db, true)
                Toast.show({text1: "Safe Mode Enabled!", type: "success"})
            }            
        setLoadingSafeModeConfig(false)
    }

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >        
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always' >
                <View style={{flex: 1, gap: AppConstants.COMMON.GAP, paddingHorizontal: wp(1)}} >
                    <Text style={AppStyle.error}>{isSafeModeOn ? 'enabled' : 'disabled'}</Text>
                    <Text style={Typography.regular}>When safe mode is enabled, {AppConstants.COMMON.APP_NAME} will function as a simple to-do list. To unlock the main content, you will need the numeric password you define below.</Text>
                    <Text style={{...Typography.regular, color: Colors.neonRed}}>If you forget the password, it cannot be reset or recovered. You must delete the app data via {Platform.OS} settings to regain access to the main content.</Text>
                    <Text style={{...Typography.regular, color: Colors.neonRed}}>Changes to Safe Mode settings will be applied when the app restarts.</Text>
                    
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
                            <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{safeModeOn ? 'Disable' : 'Enable'} Safe Mode</Text>
                        </View>
                        :
                        <Pressable onPress={submitPassword} style={AppStyle.formButton} >
                            <Text style={{...Typography.regular, color: Colors.backgroundColor}}>{isSafeModeOn ? 'Disable' : 'Enable'} Safe Mode</Text>
                        </Pressable>
                    }
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default SafeModeForm

const styles = StyleSheet.create({})