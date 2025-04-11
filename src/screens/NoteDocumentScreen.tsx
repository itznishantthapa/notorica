import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppContext } from '../../context/AppContext'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { wp, hp, fontSize } from '../utils/responsive'

interface NoteDocumentScreenProps {
    route: {
        params: {
            noteData: any
        }
    }
}

const NoteDocumentScreen = () => {
    const { isDark, userNotes } = useContext(AppContext)
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const [noteData, setNoteData] = useState(route.params?.noteData)

    // Refresh note data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            // Get the latest note data from userNotes
            if (noteData && noteData.id) {
                const updatedNote = userNotes.find(note => note.id === noteData.id)
                if (updatedNote) {
                    setNoteData(updatedNote)
                }
            }
        }, [userNotes])
    )

    // Check if we have valid note data
    if (!noteData) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1c22' : '#ffffff' }]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Note data not found. Please go back and try again.
                    </Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: isDark ? '#9b9ee9' : '#000000' }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    // Get the appropriate background color based on theme
    const backgroundColor = isDark
        ? noteData.boxBgColorForDarkMode || '#1a1c22'
        : noteData.boxBgColorForLightMode || '#ffffff'

    // Format current date in a readable format
    const formatDate = (dateString: string) => {
        if (!dateString) return ''

        // Direct use of the date string or use lastEdited timestamp if available
        return noteData.lastEdited
            ? new Date(noteData.lastEdited).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : dateString
    }

    // Handle edit button press
    const handleEditPress = () => {
        navigation.navigate('CreateNote', { noteData })
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundColor}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={isDark ? '#ffffff' : '#000000'}
                    />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                    View Note
                </Text>
            </View>

            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Title */}
                <Text style={[styles.title, { color: isDark ? '#ffffff' : '#000000' }]}>
                    {noteData.title || 'Untitled'}
                </Text>

                {/* Date */}
                <Text style={[styles.date, { color: isDark ? '#9b9ee9' : '#555555' }]}>
                    {formatDate(noteData.date)}
                </Text>

                {/* Content */}
                <Text style={[styles.content, { color: isDark ? '#ffffff' : '#000000' }]}>
                    {noteData.content || 'No content available'}
                </Text>
            </ScrollView>

            {/* Edit Button - Floating Action Button */}
            <TouchableOpacity
                style={[
                    styles.floatingEditButton,
                    { backgroundColor: isDark ? '#9b9ee9' : '#000000' }
                ]}
                onPress={handleEditPress}
            >
                <Ionicons
                    name="create-outline"
                    size={24}
                    color="#ffffff"
                />
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default NoteDocumentScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(20),
    },
    errorText: {
        fontSize: fontSize(18),
        textAlign: 'center',
        marginBottom: hp(20),
        fontFamily: 'poppins_regular',
    },
    backButton: {
        marginRight: wp(15),
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: fontSize(16),
        fontFamily: 'poppins_semibold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(20),
        paddingVertical: hp(10),
    },
    headerTitle: {
        fontSize: fontSize(20),
        fontFamily: 'jakarta_bold',
        flex: 1,
    },
    scrollContent: {
        flex: 1,
    },
    contentContainer: {
        padding: wp(20),
        paddingTop: hp(10),
    },
    title: {
        fontSize: fontSize(28),
        fontFamily: 'jakarta_bold',
        marginBottom: hp(8),
    },
    date: {
        fontSize: fontSize(14),
        fontFamily: 'poppins_regular',
        marginBottom: hp(16),
    },
    content: {
        fontSize: fontSize(16),
        lineHeight: hp(24),
        fontFamily: 'poppins_regular',
    },
    floatingEditButton: {
        position: 'absolute',
        bottom: hp(30),
        right: wp(30),
        width: wp(56),
        height: wp(56),
        borderRadius: wp(28),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(2) },
        shadowOpacity: 0.3,
        shadowRadius: hp(4),
        elevation: 5,
    }
})
