import HomeButton from '@/components/buttons/HomeButton'
import SignUpForm from '@/components/form/SignUpForm'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { SafeAreaView } from 'react-native'


const SignInPage = () => {
    
    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Register' titleColor={Colors.accountColor} >
                <HomeButton color={Colors.accountColor} />
            </TopBar>
            <SignUpForm/>
        </SafeAreaView>
    )
}

export default SignInPage
