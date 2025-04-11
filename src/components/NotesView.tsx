import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Keyboard, InputAccessoryView, Platform, Alert } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { wp, hp, fontSize } from '../utils/responsive'

interface NotesViewProps {
    isDark: boolean;
    noteData?: any;
    onSave: (data: { title: string; content: string }) => void;
}

const NotesView = ({ isDark, noteData, onSave }: NotesViewProps) => {
    const [title, setTitle] = useState(noteData?.title || '')
    const [content, setContent] = useState(noteData?.content || '')
    const scrollViewRef = useRef(null)
    const contentInputRef = useRef(null)
    const inputAccessoryViewID = 'contentInput'

    // Get the appropriate background color based on theme and note data
    const noteContainerBgColor = noteData
        ? isDark
            ? noteData.boxBgColorForDarkMode || '#2f3239'
            : noteData.boxBgColorForLightMode || '#dcdcdd'
        : isDark
            ? '#2f3239'
            : '#dcdcdd'

    // Set initial data if editing existing note
    useEffect(() => {
        if (noteData) {
            setTitle(noteData.title || '')
            setContent(noteData.content || '')
        }
    }, [noteData])

    // Handle keyboard show event
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                // Do not auto-scroll to end on keyboard show as this can hide the editing point
                // Let the selection position naturally determine the scroll position
            }
        )

        return () => {
            keyboardDidShowListener.remove()
        }
    }, [])

    // Handle content changes without auto-scrolling to end
    const handleContentChange = (text) => {
        setContent(text)
        // No automatic scrolling to end - let natural selection position drive scrolling
    }

    // Handle save button press
    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for your note');
            return;
        }

        onSave({ title, content });
    }

    return (
        <View style={styles.container}>
            <View style={[
                styles.noteContainer,
                { backgroundColor: noteContainerBgColor }
            ]}>
                {/* Title/Heading input */}
                <TextInput
                    style={[
                        styles.titleInput,
                        { color: isDark ? '#ffffff' : '#000000' }
                    ]}
                    placeholder="Topic or Heading"
                    placeholderTextColor={isDark ? '#a0a0a0' : '#808080'}
                    value={title}
                    onChangeText={setTitle}
                    multiline={false}
                    returnKeyType="next"
                    onSubmitEditing={() => contentInputRef.current?.focus()}
                />

                <View style={styles.divider} />

                {/* Content input in ScrollView */}
                <TextInput
                    ref={contentInputRef}
                    style={[
                        styles.contentInput,
                        { color: isDark ? '#ffffff' : '#000000' }
                    ]}
                    placeholder="Start typing your notes here..."
                    placeholderTextColor={isDark ? '#a0a0a0' : '#808080'}
                    value={content}
                    onChangeText={handleContentChange}
                    multiline={true}
                    scrollEnabled={true}
                    textAlignVertical="top"
                    inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
                />
            </View>

            {/* iOS Input Accessory View for keyboard */}
            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID={inputAccessoryViewID}>
                    <View style={[styles.inputAccessory, { backgroundColor: isDark ? '#2f3239' : '#f9f9f9' }]}>
                        <TouchableOpacity
                            onPress={() => Keyboard.dismiss()}
                            style={styles.doneButton}
                        >
                            <Text style={[styles.doneButtonText, { color: '#9b9ee9' }]}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </InputAccessoryView>
            )}

            {/* Save Button */}
            <View style={styles.saveButtonContainer}>
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: isDark ? '#9b9ee9' : '#000000' }]}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save Note</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default NotesView

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(20),
        position: 'relative',
    },
    noteContainer: {
        flex: 1,
        borderRadius: wp(12),
        overflow: 'hidden',
        marginBottom: hp(70), // Space for the save button
    },
    titleInput: {
        fontSize: fontSize(22),
        fontFamily: 'jakarta_bold',
        paddingHorizontal: wp(16),
        paddingVertical: hp(14),
    },
    divider: {
        height: hp(1),
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        marginHorizontal: wp(8),
    },
    contentInput: {
        flex: 1,
        fontSize: fontSize(14),
        fontFamily: 'poppins_regular',
        lineHeight: hp(22),
        padding: wp(16),
        paddingTop: hp(16),
        minHeight: '85%', // Ensure the input takes most of the available space
    },
    inputAccessory: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: wp(8),
        paddingVertical: hp(8),
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    doneButton: {
        padding: wp(8),
    },
    doneButtonText: {
        fontSize: fontSize(16),
        fontWeight: '600',
    },
    saveButtonContainer: {
        position: 'absolute',
        bottom: hp(10),
        left: wp(20),
        right: wp(20),
    },
    saveButton: {
        backgroundColor: '#000000',
        borderRadius: wp(12),
        paddingVertical: hp(14),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(2) },
        shadowOpacity: 0.2,
        shadowRadius: hp(3),
        elevation: 3,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: fontSize(16),
        fontFamily: 'poppins_semibold',
    },
}) 