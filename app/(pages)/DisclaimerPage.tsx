import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'


const DATA = [
    {
        title: "Intellectual Property",
        message: "This app does not hold any copyrights, trademarks, or other intellectual property rights to the images, illustrations, comics, or any other content (“Images”) that it stores, displays, or makes available for viewing. All Images remain the property of their respective authors, artists, publishers, and original rights holders."
    },
    {
        title: "Third-Party Content Usage",
        message: "Images are provided by third-party sources, either fetched automatically or uploaded by users. The App functions solely as an interface for reading and temporary caching (or device storage) and is not responsible for the creation, distribution, or licensing of the material."
    },
    {
        title: "Purpose of Storage",
        message: "Storage of Images on the user’s device is strictly for personal, non-commercial use, solely to enable offline reading and to improve performance. The App does not sell, sublicense, or otherwise commercially exploit the Images."
    },
    {
        title: "Limitation of Liability",
        message: "The App assumes no liability for any copyright infringement or other intellectual property rights violations resulting from improper use of the Images by users. Any unauthorized use must be addressed directly between the rights holder and the infringing user."
    },
    {
        title: "Infringement Notification",
        message: "If you are a rights holder or an authorized representative and believe your protected content is being used without authorization in the App, please contact us immediately at ougireader@proton.me, providing the following information:\n\n • Precise identification of the copyrighted work.\n • Exact location of the infringing material within the App (title, internal URL, or screen reference).\n • A good-faith statement that use of the material is not authorized by the rights holder.\n • A statement of the truthfulness of the information provided, accepting legal responsibility for any false statements."
    },
    {
        title: "Amendments to This Disclaimer",
        message: "We reserve the right to modify this Disclaimer at any time, without prior notice. We recommend that you review this section periodically to stay informed of any changes."
    }
]

const DisclaimerText = ({title, message}: {title: string, message: string}) => {
    return (
        <View style={{width: '100%', gap: 10, backgroundColor: Colors.disclaimerColor, borderRadius: 4, marginBottom: 20, padding: 10}}>
            <Text style={[AppStyle.textHeader, {color: Colors.backgroundColor}]}>{title}</Text>
            <Text style={[AppStyle.textRegular, {fontSize: 18, color: Colors.backgroundColor}]}>{message}</Text>
        </View>
    )
}


const DisclaimerPage = () => {

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='Disclaimer' titleColor={Colors.disclaimerColor} >
                <ReturnButton color={Colors.disclaimerColor} />
            </TopBar>
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <View style={{width: '100%'}} >
                    {
                        DATA.map((item, index) => <DisclaimerText key={index} title={item.title} message={item.message} />)
                    }            
                </View>
                <View style={{marginBottom: 50}} />
            </ScrollView>
        </SafeAreaView>
    )
}


export default DisclaimerPage