import { Keyboard, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { AppStyle } from '@/styles/AppStyle'
import TopBar from '@/components/TopBar'
import ReturnButton from '@/components/buttons/ReturnButton'
import { useSQLiteContext } from 'expo-sqlite'
import { dbCheckPassword } from '@/lib/database'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { Colors } from '@/constants/Colors'

const SafeModeSettings = () => {

    const db = useSQLiteContext()

    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)

    const checkPassword = async () => {
        setLoading(true)
        Keyboard.dismiss()
            const success = await dbCheckPassword(db, text)
            if (success) {
                router.replace("/HomePage")
            } else {
                Toast.show({text1: "Error", text2: "Invalid password", type: "error"})
            }
        setLoading(false)
    }

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Settings' titleColor='white' >
                <ReturnButton color='white' />
            </TopBar>
            <View style={{flex: 1}} >
                <Text style={[AppStyle.textHeader, {marginBottom: 10}]}>Password</Text>
                <TextInput
                    style={AppStyle.input}
                    autoCapitalize='none'
                    onChangeText={setText}
                    value={text}
                />
                {
                    loading ?
                    <View style={[AppStyle.formButton, {backgroundColor: Colors.white}]} >
                        <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >OK</Text>
                    </View>
                :
                    <Pressable onPress={checkPassword} style={[AppStyle.formButton, {backgroundColor: Colors.white}]} >
                        <Text style={[AppStyle.textRegular, {color: Colors.backgroundColor}]} >OK</Text>
                    </Pressable>
                }
            </View>
        </SafeAreaView>
    )
}

export default SafeModeSettings

const styles = StyleSheet.create({})