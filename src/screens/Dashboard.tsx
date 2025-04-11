"use client"

import { useState, useEffect, useContext } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar, ActivityIndicator, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import NeonFolder from "../components/NeonFolder"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { AppContext } from "../../context/AppContext"
import React from "react"
import NepaliDate from 'nepali-datetime'

const { width: SCREEN_WIDTH } = Dimensions.get("window")

// Format the Nepali date to a readable format
const formatNepaliDate = () => {
  try {
    // Create a NepaliDate object for the current date
    const nepaliDate = new NepaliDate();

    // Get the Nepali month name
    const nepaliMonths = [
      'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
      'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत्र'
    ];
    const monthIndex = nepaliDate.getMonth(); // 0-based index
    const nepaliMonth = nepaliMonths[monthIndex];

    // Get the Nepali day and convert to Nepali digits
    const day = nepaliDate.getDate();
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const toNepaliNumeral = (num) => {
      return num.toString().split('').map(digit => nepaliDigits[parseInt(digit)]).join('');
    };

    // Format as "चैत्र २८"
    return `${nepaliMonth} ${toNepaliNumeral(day)}`;
  } catch (error) {
    console.error('Error formatting Nepali date:', error);
    return ''; // Return empty string if there's an error
  }
};

const Dashboard = () => {
  const {
    isDark,
    userNotes,
    dispatchUserNotes,
    isLoading,
    toggleDarkMode,
    toggleNepaliDate,
    isNepaliDate,
    getRandomColor,
    labelColorPalette,
    boxColorPalette,
    darkBoxColorPalette
  } = useContext(AppContext);

  const navigation = useNavigation<any>();
  const [currentDate, setCurrentDate] = useState("")
  const [nepaliDate, setNepaliDate] = useState("")
  const [dayProgress, setDayProgress] = useState(0)

  // Calculate current date and day progress
  useEffect(() => {
    // Format current date
    const date = new Date()

    // Always format the English date
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })
    setCurrentDate(formatter.format(date));

    // Format the Nepali date if enabled
    if (isNepaliDate) {
      setNepaliDate(formatNepaliDate());
    } else {
      setNepaliDate('');
    }

    // Calculate day progress (0-100%)
    const currentHour = date.getHours()
    const currentMinute = date.getMinutes()
    const totalMinutesInDay = 24 * 60
    const minutesPassed = (currentHour * 60) + currentMinute
    const progress = (minutesPassed / totalMinutesInDay) * 100
    setDayProgress(progress)

    // Update every minute
    const timer = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const minutesPassed = (hours * 60) + minutes
      const newProgress = (minutesPassed / totalMinutesInDay) * 100
      setDayProgress(newProgress)

      // Update date formats
      const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })
      setCurrentDate(formatter.format(now));

      // Update Nepali date if enabled
      if (isNepaliDate) {
        setNepaliDate(formatNepaliDate());
      }
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [isNepaliDate])

  // Create a special "Create Note" entry instead of the settings note
  const createNoteEntry = {
    id: "create-note-entry",
    title: "Create Note",
    content: "Tap to start a new note",
    date: new Date().toLocaleDateString(),
    labelBgColorForLightMode: "#9b9ee9",
    labelBgColorForDarkMode: "#9b9ee9",
    boxBgColorForLightMode: "#f2f4f8",
    boxBgColorForDarkMode: "#20262c",
    type: "create",
    isCreateNote: true,
  };

  // Settings note
  const settingsNote = {
    id: "settings-note",
    title: "Settings",
    content: "Configure app settings, theme, language options, and more. Long press to access all settings.",
    date: new Date().toLocaleDateString(),
    labelBgColorForLightMode: "#9b9ee9",
    labelBgColorForDarkMode: "#9b9ee9",
    boxBgColorForLightMode: "#f2f4f8",
    boxBgColorForDarkMode: "#20262c",
    type: "settings",
    isSettings: true,
  };

  // Handle settings options
  const handleToggleDarkMode = () => {
    toggleDarkMode();
  };

  const handleToggleNepaliDate = () => {
    toggleNepaliDate();
  };

  const handleClearAllNotes = () => {
    Alert.alert(
      'Clear All Notes',
      'Are you sure you want to delete all your notes? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => dispatchUserNotes({ type: "SET_NOTES", payload: [] })
        }
      ]
    );
  };

  // Settings options
  const settingsOptions = [
    {
      icon: isDark ? 'sunny' : 'moon',
      text: isDark ? 'Light Mode' : 'Dark Mode',
      color: '#555',
      action: handleToggleDarkMode
    },
    {
      icon: 'calendar',
      text: isNepaliDate ? 'Disable Nepali Date' : 'Enable Nepali Date',
      color: '#555',
      action: handleToggleNepaliDate
    },
    {
      icon: 'delete',
      text: 'Clear All Notes',
      color: '#ff3b30',
      action: handleClearAllNotes
    },
  ];

  // Filter out the empty initial note if it exists
  const filteredNotes = userNotes.filter(note => note.id !== "");

  // Sort notes by creation/edit time in descending order (newest first)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Use the lastEdited timestamp if available, otherwise fall back to created timestamp or date
    const timeA = a.lastEdited || a.created || new Date(a.date).getTime();
    const timeB = b.lastEdited || b.created || new Date(b.date).getTime();
    return timeB - timeA;
  });

  // Combine notes with create note entry at the beginning and settings note at the end
  const allNotes = [];

  // Always add create note entry at the beginning
  if (!isLoading) {
    allNotes.push(createNoteEntry);
  }

  // Add sorted user notes in the middle (newest first)
  allNotes.push(...sortedNotes);

  // Add settings note at the end
  if (!isLoading) {
    allNotes.push(settingsNote);
  }

  // Split folders differently to ensure newer notes are at the top
  // First, separate the special entries (Create Note and Settings) from regular notes
  const createNoteEntryOnly = allNotes.find(note => note.isCreateNote);
  const settingsNoteOnly = allNotes.find(note => note.isSettings);
  const regularNotes = allNotes.filter(note => !note.isCreateNote && !note.isSettings);

  // Create balanced columns with newer notes at the top of each column
  // Left column gets Create Note entry and even-indexed notes (0, 2, 4...)
  // Right column gets odd-indexed notes (1, 3, 5...) and Settings entry at the bottom

  const leftColumnFolders = [];
  const rightColumnFolders = [];

  // Always put Create Note entry at the top of left column
  if (createNoteEntryOnly) {
    leftColumnFolders.push(createNoteEntryOnly);
  }

  // Distribute regular notes evenly between columns (top to bottom in each column)
  const leftColumnNotes = [];
  const rightColumnNotes = [];

  regularNotes.forEach((note, index) => {
    // First half of notes go to left column, second half to right column
    if (index < Math.ceil(regularNotes.length / 2)) {
      leftColumnNotes.push(note);
    } else {
      rightColumnNotes.push(note);
    }
  });

  // Add regular notes to columns
  leftColumnFolders.push(...leftColumnNotes);
  rightColumnFolders.push(...rightColumnNotes);

  // Add Settings entry at the bottom of right column
  if (settingsNoteOnly) {
    rightColumnFolders.push(settingsNoteOnly);
  }

  // Handle folder press to view/edit note
  const handleFolderPress = (folder) => {
    // If it's the create note entry, navigate to create note screen
    if (folder.isCreateNote) {
      navigation.navigate('CreateNote');
      return;
    }

    // Skip navigation for settings note
    if (folder.isSettings) {
      return;
    }

    // Navigate to document view screen to view the note/document in detail
    navigation.navigate('NoteDocument', { noteData: folder });
  }

  // Render a folder
  const renderFolder = (folder) => {
    return (
      <View key={folder.id} style={styles.folderContainer}>
        <NeonFolder
          folder={folder}
          onPress={() => handleFolderPress(folder)}
          isSettings={folder.isSettings}
          settingsOptions={folder.isSettings ? settingsOptions : undefined}
        />
      </View>
    )
  }

  // Day progress component
  const renderDayProgress = () => {
    return (
      <View style={styles.dayProgressContainer}>
        <Text style={[styles.dateText, { color: isDark ? '#ffffff' : '#000000' }]}>
          {currentDate}{isNepaliDate && nepaliDate ? ` | ${nepaliDate}` : ''}
        </Text>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarLabel}>
            <Text style={[styles.progressLabelText, { color: isDark ? '#ffffff' : '#000000' }]}>Day Progress</Text>
            <Text style={[styles.progressPercentText, { color: isDark ? '#ffffff' : '#000000' }]}>{dayProgress.toFixed(0)}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#3a3c44' : '#f5f5f5' }]}>
            <View style={[
              styles.progressBarFill,
              {
                backgroundColor: isDark ? '#9b9ee9' : '#000000',
                width: `${dayProgress}%`
              }
            ]} />
          </View>
        </View>
      </View>
    )
  }

  // Display message when no notes available
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={[styles.emptyStateText, { color: isDark ? '#ffffff' : '#333333' }]}>
          You don't have any notes yet.
        </Text>
        <Text style={[styles.emptyStateSubText, { color: isDark ? '#a0a0a0' : '#666666' }]}>
          Tap the + button to create your first note.
        </Text>
      </View>
    );
  }

  // Render loading indicator
  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDark ? '#9b9ee9' : '#000000'} />
        <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#333333' }]}>
          Loading your notes...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#1a1c22' : '#ffffff'} />
      <View style={[styles.container, { backgroundColor: isDark ? '#1a1c22' : '#ffffff' }]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.welcomeText, { color: isDark ? '#ffffff' : '#333333' }]}>notorica</Text>
        </View>

        {isLoading ? (
          renderLoading()
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              filteredNotes.length === 0 && { flexGrow: 1 }
            ]}
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            {allNotes.length > 1 ? (
              <View style={styles.columnsContainer}>
                {/* Left Column - with date and progress bar */}
                <View style={styles.column}>
                  {renderDayProgress()}
                  {leftColumnFolders.map((item) => renderFolder(item))}
                </View>

                {/* Right Column - Now starts at the top */}
                <View style={styles.column}>
                  {rightColumnFolders.map((item) => renderFolder(item))}
                </View>
              </View>
            ) : (
              <>
                <View style={styles.progressOnlyContainer}>
                  {renderDayProgress()}
                </View>
                <View style={styles.emptyNotesList}>
                  <View style={styles.folderWrapper}>
                    {renderFolder(createNoteEntryOnly)}
                  </View>
                  <View style={styles.folderWrapper}>
                    {renderFolder(settingsNoteOnly)}
                  </View>
                  {renderEmptyState()}
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#eff2f4",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingVertical: 4,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "500",
    color: "#333333",
    letterSpacing: -0.3,
    fontFamily: "jakarta_bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'poppins_regular',
  },
  columnsContainer: {
    flexDirection: "row",
    width: "100%",
  },
  column: {
    width: "50%",
    paddingHorizontal: 6,
    alignItems: "center",
  },
  progressOnlyContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  emptyNotesList: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  folderWrapper: {
    marginBottom: 10,
  },
  dayProgressContainer: {
    width: '100%',
    height: 70,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    fontFamily: "jakarta_bold",
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabelText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'jakarta_regular',
  },
  progressPercentText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
    fontFamily: 'jakarta_regular',
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 3,
  },
  folderContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'jakarta_bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    fontFamily: 'poppins_regular',
    textAlign: 'center',
  },
})

export default Dashboard
