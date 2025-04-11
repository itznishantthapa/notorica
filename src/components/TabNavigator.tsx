import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { wp, hp, fontSize } from '../utils/responsive'

interface TabNavigatorProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isDark: boolean;
}

const TabNavigator = ({ activeTab, setActiveTab, isDark }: TabNavigatorProps) => {
    return (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === 'Notes' && styles.activeTab,
                    { backgroundColor: isDark ? '#2f3239' : '#dcdcdd' }
                ]}
                onPress={() => setActiveTab('Notes')}
            >
                <Text style={[
                    styles.tabText,
                    activeTab === 'Notes' && styles.activeTabText,
                    { color: isDark ? (activeTab === 'Notes' ? '#ffffff' : '#a0a0a0') : (activeTab === 'Notes' ? '#000000' : '#808080') }
                ]}>Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === 'Docs' && styles.activeTab,
                    { backgroundColor: isDark ? '#2f3239' : '#dcdcdd' }
                ]}
                onPress={() => setActiveTab('Docs')}
            >
                <Text style={[
                    styles.tabText,
                    activeTab === 'Docs' && styles.activeTabText,
                    { color: isDark ? (activeTab === 'Docs' ? '#ffffff' : '#a0a0a0') : (activeTab === 'Docs' ? '#000000' : '#808080') }
                ]}>Docs</Text>
            </TouchableOpacity>
        </View>
    )
}

export default TabNavigator

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: wp(20),
        marginBottom: hp(15),
        borderRadius: wp(12),
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        paddingVertical: hp(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#9b9ee9',
    },
    tabText: {
        fontSize: fontSize(16),
        fontFamily: 'poppins_regular',
    },
    activeTabText: {
        fontFamily: 'poppins_semibold',
    },
}) 