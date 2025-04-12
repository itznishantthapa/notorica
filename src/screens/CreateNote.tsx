import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar } from 'react-native'
import React, { useState, useContext } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppContext } from '../../context/AppContext'
import { Ionicons } from "@expo/vector-icons"
import NotesView from '../components/NotesView'
import { wp, hp, fontSize } from '../utils/responsive'

const CreateNote = ({ navigation, route }) => {
  const {
    isDark,
    userNotes,
    dispatchUserNotes,
    getRandomColor,
    labelColorPalette,
    boxColorPalette,
    darkBoxColorPalette
  } = useContext(AppContext)
  const noteData = route.params?.noteData
  const isEditing = !!noteData

  // Handle back navigation
  const handleBack = () => {
    navigation.goBack()
  }

  // Save note to context
  const handleSaveNote = (data) => {
    const now = new Date();
    const currentDate = now.toLocaleDateString();

    // Format time with leading zeros for consistent parsing
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    const timestamp = now.getTime();

    if (isEditing) {
      // Update existing note
      const updatedNote = {
        ...noteData,
        title: data.title,
        content: data.content,
        date: currentDate,
        time: currentTime,
        lastEdited: timestamp, // Store timestamp for sorting
      }

      dispatchUserNotes({
        type: 'UPDATE_NOTE',
        payload: updatedNote
      })
    } else {
      // Create new note with random colors
      const newNote = {
        id: timestamp.toString(),
        title: data.title,
        content: data.content,
        date: currentDate,
        time: currentTime,
        created: timestamp, // Store timestamp for sorting
        lastEdited: timestamp,
        labelBgColorForLightMode: getRandomColor(labelColorPalette),
        labelBgColorForDarkMode: getRandomColor(labelColorPalette),
        boxBgColorForLightMode: getRandomColor(boxColorPalette),
        boxBgColorForDarkMode: getRandomColor(darkBoxColorPalette),
        type: 'note',
      }

      dispatchUserNotes({
        type: 'ADD_NOTE',
        payload: newNote,
        isDarkMode: isDark
      })
    }

    // Navigate back to dashboard after saving
    navigation.goBack()
  }

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#1a1c22' : '#ffffff' }
    ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#1a1c22' : '#ffffff'}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? '#ffffff' : '#000000'}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
          {isEditing ? 'Edit Note' : 'Create Note'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <NotesView
          isDark={isDark}
          noteData={noteData}
          onSave={handleSaveNote}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default CreateNote

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(20),
    paddingVertical: hp(10),
  },
  backButton: {
    marginRight: wp(15),
  },
  headerTitle: {
    fontSize: fontSize(20),
    fontFamily: 'jakarta_bold',
  }
})