import ReturnButton from '@/app/components/buttons/ReturnButton'
import BugReportForm from '@/app/components/form/BugReportForm'
import { useLocalSearchParams } from 'expo-router'
import { AppStyle } from '@/styles/AppStyle'
import { SafeAreaView } from 'react-native'
import TopBar from '@/app/components/TopBar'
import React from 'react'


const BugReport = () => {

    const params = useLocalSearchParams()
    const title: string | undefined = params.title as any

    return (
        <SafeAreaView style={AppStyle.safeArea} >            
            <TopBar title='Bug Report'>
                <ReturnButton/>
            </TopBar>
            <BugReportForm title={title}/>
        </SafeAreaView>
    )
}

export default BugReport
