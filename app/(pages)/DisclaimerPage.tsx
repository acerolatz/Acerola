import ReturnButton from '@/components/buttons/ReturnButton'
import TopBar from '@/components/TopBar'
import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import { AppStyle } from '@/styles/AppStyle'
import React from 'react'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'


const EULA = `Acerola - End-User License Agreement (EULA)

Last Updated: July 22, 2025

This End-User License Agreement ("EULA") is a legal agreement between you (either an individual or a single entity), the "Licensee", and the Acerola Team, the "Licensor", for the software product named Acerola ("Software").

By installing, copying, or otherwise using the Software, you agree to be bound by the terms of this EULA. If you do not agree to the terms of this EULA, do not install or use the Software.

Article 1: Definitions

a) "Software" refers to the Acerola application, its executable files, the associated Source Code, any media, printed materials, and "online" or electronic documentation.

b) "Source Code" refers to the human-readable programming code that comprises the Software.

c) "Use" means to install, load, run, or display the Software on a device (e.g., mobile device, or tablet).

Article 2: License Grant

The Licensor grants you the following rights, provided that you comply with all terms and conditions of this EULA:

2.1. Right to Use: The Licensor grants you a personal, limited, non-exclusive, revocable, and non-transferable license to install and use one copy of the Software on a single device owned or controlled by you for personal, non-commercial purposes.

2.2. Right to View Source Code: The Licensor grants you the right to view the Software's Source Code for the exclusive purposes of reference, security auditing, and personal learning.

2.3. Right to Compile: The Licensor grants you the non-exclusive, non-transferable right to compile the Source Code into an executable format, exclusively for your personal, non-commercial use.

Article 3: License Restrictions

The Licensee agrees NOT to perform, nor to permit third parties to perform, any of the following actions:

a) Modify or Create Derivative Works: You may not modify, adapt, or otherwise create derivative works or improvements, whether or not patentable, of the Software or its Source Code. It is expressly forbidden to use any part of the Source Code to create another application or software.

b) Reverse Engineering: You may not reverse engineer, decompile, decode, disassemble, or otherwise attempt to derive or gain access to the Source Code of the Software, other than the right to view granted in Article 2.2.

c) Removal of Notices: You may not remove, delete, alter, or obscure any trademarks or any copyright, patent, or other intellectual property or proprietary rights notices from the Software.

Article 4: Disclaimer of Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. THE LICENSOR DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

Article 5: Limitation of Liability

IN NO EVENT SHALL THE LICENSOR BE LIABLE FOR ANY SPECIAL, INCIDENTAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF BUSINESS PROFITS, BUSINESS INTERRUPTION, OR LOSS OF INFORMATION) ARISING OUT OF THE USE OF OR INABILITY TO USE THE SOFTWARE.

Article 6: Severability

If any provision of this EULA is held to be invalid, illegal, or unenforceable, such provision shall be struck out, and the remaining provisions shall continue in full force and effect.

Article 7: Termination

This EULA will terminate automatically, without notice from the Licensor, if you fail to comply with any term of this agreement. Upon termination, you must cease all use of the Software and destroy all copies thereof

Article 8: Entire Agreement

This EULA constitutes the entire agreement between the Licensee and the Licensor regarding the Software and supersedes all prior communications, proposals, or agreements, whether oral or written.

Article 9: Waiver

The Licensor's failure to enforce any right or provision of this EULA shall not constitute a waiver of such right or provision and shall not affect the Licensor's right to enforce such right or provision at a later time.`


const DISCLAIMER = `
Intellectual Property

This app does not hold any copyrights, trademarks, or other intellectual property rights to the images, illustrations, comics, or any other content (“Images”) that it stores, displays, or makes available for viewing. All Images remain the property of their respective authors, artists, publishers, and original rights holders.


Third-Party Content Usage

Images are provided by third-party sources, either fetched automatically or uploaded by users. The App functions solely as an interface for reading and temporary caching (or device storage) and is not responsible for the creation, distribution, or licensing of the material.


Purpose of Storage

Storage of Images on the user’s device is strictly for personal, non-commercial use, solely to enable offline reading and to improve performance. The App does not sell, sublicense, or otherwise commercially exploit the Images.


Limitation of Liability

The App assumes no liability for any copyright infringement or other intellectual property rights violations resulting from improper use of the Images by users. Any unauthorized use must be addressed directly between the rights holder and the infringing user.


Infringement Notification

If you are a rights holder or an authorized representative and believe your protected content is being used without authorization in the App, please contact us immediately at ${AppConstants.email}, providing the following information:\n\n • Precise identification of the copyrighted work.\n • Exact location of the infringing material within the App (title, internal URL, or screen reference).\n • A good-faith statement that use of the material is not authorized by the rights holder.\n • A statement of the truthfulness of the information provided, accepting legal responsibility for any false statements.


Amendments to This Disclaimer

We reserve the right to modify this Disclaimer at any time, without prior notice. We recommend that you review this section periodically to stay informed of any changes.`

const DisclaimerPage = () => {

    return (
        <SafeAreaView style={AppStyle.safeArea} >
            <TopBar title='EULA' titleColor={Colors.disclaimerColor} >
                <ReturnButton color={Colors.disclaimerColor} />
            </TopBar>
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false} >
                <Text style={AppStyle.textRegular}>{EULA}</Text>
                <View style={{width: '100%', height: 4, borderRadius: 4, marginVertical: 30, backgroundColor: Colors.disclaimerColor}} />
                <Text style={[AppStyle.textHeader, {color: Colors.disclaimerColor}]}>Disclaimer</Text>
                <Text style={AppStyle.textRegular}>{DISCLAIMER}</Text>
                <View style={{marginBottom: 60}} />
            </ScrollView>
        </SafeAreaView>
    )
}


export default DisclaimerPage