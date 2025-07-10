import ReturnButton from '@/components/buttons/ReturnButton'
import BugReportForm from '@/components/form/BugReportForm'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { SafeAreaView } from 'react-native'


const BugReport = () => {

    const params = useLocalSearchParams()
    const title: string | undefined = params.title as any

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Bug Report' titleColor={Colors.BugReportColor} >
                <ReturnButton color={Colors.BugReportColor} />
            </TopBar>
            <BugReportForm title={title}/>
        </SafeAreaView>
    )
}

export default BugReport
