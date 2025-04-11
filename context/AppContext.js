import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { labelColorPalette } from '../src/colors/labelColorPalette/labelColorPalette';
import { boxColorPalette, darkBoxColorPalette } from '../src/colors/boxColorPalette/boxColorPalette';
import { useColorScheme } from 'react-native';

export const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Storage keys
const STORAGE_KEY = 'notebooksAppNotes';
const DARK_MODE_KEY = 'isDarkMode';
const NEPALI_DATE_KEY = 'isNepaliDateEnabled';

// Get a random color from a palette
const getRandomColor = (palette) => {
  return palette[Math.floor(Math.random() * palette.length)];
};

// Initial empty note template
const initialUserNotes = [{
  id: "",
  title: "",
  content: "",
  date: "",
  labelBgColorForLightMode: "",
  boxBgColorForLightMode: "",
  labelBgColorForDarkMode: "",
  boxBgColorForDarkMode: "",
  type: "",
}];

// Helper to update a note with appropriate theme colors if not set
const ensureNoteHasThemeColors = (note, isDarkMode) => {
  // Skip the empty initial note
  if (note.id === "") return note;

  // Create a copy to modify
  const updatedNote = { ...note };

  // Set random colors for light mode if not already set
  if (!updatedNote.labelBgColorForLightMode) {
    updatedNote.labelBgColorForLightMode = getRandomColor(labelColorPalette);
  }
  if (!updatedNote.boxBgColorForLightMode) {
    updatedNote.boxBgColorForLightMode = getRandomColor(boxColorPalette);
  }

  // Set random colors for dark mode if not already set
  if (!updatedNote.labelBgColorForDarkMode) {
    updatedNote.labelBgColorForDarkMode = getRandomColor(labelColorPalette);
  }
  if (!updatedNote.boxBgColorForDarkMode) {
    updatedNote.boxBgColorForDarkMode = getRandomColor(darkBoxColorPalette);
  }

  return updatedNote;
};

// Reducer to handle all note operations
const userNoteReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case "ADD_NOTE": {
      // Ensure the new note has theme colors
      const noteWithColors = ensureNoteHasThemeColors(action.payload, action.isDarkMode);

      // Filter out the empty initial note if it exists
      const filteredState = state.filter(note => note.id !== "");

      // Add the new note
      newState = [...filteredState, noteWithColors];
      break;
    }
    case "DELETE_NOTE":
      newState = state.filter((note) => note.id !== action.payload);
      break;
    case "UPDATE_NOTE":
      newState = state.map((note) => note.id === action.payload.id ? action.payload : note);
      break;
    case "SET_NOTES":
      // Ensure we don't overwrite with an empty array unless explicitly intended
      if (action.payload.length === 0 && state.length > 0) {
        // User intentionally cleared notes
        newState = [];
      } else if (action.payload.length === 0) {
        // Initial load with no notes, use initial template
        newState = initialUserNotes;
      } else {
        newState = action.payload;
      }
      break;
    case "ENSURE_THEME_COLORS": {
      const isDarkMode = action.payload;
      // Make sure all notes have theme-specific colors
      newState = state.map(note => ensureNoteHasThemeColors(note, isDarkMode));
      break;
    }
    default:
      return state;
  }

  // Save to AsyncStorage
  saveNotesToStorage(newState);
  return newState;
};

// Save notes to AsyncStorage
const saveNotesToStorage = async (notes) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to storage:', error);
  }
};

// Load notes from AsyncStorage
const loadNotesToStorage = async () => {
  try {
    const storedNotes = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedNotes !== null) {
      return JSON.parse(storedNotes);
    }
    return initialUserNotes;
  } catch (error) {
    console.error('Error loading notes from storage:', error);
    return initialUserNotes;
  }
};

// Save preference to AsyncStorage
const savePreference = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} preference:`, error);
  }
};

// Load preference from AsyncStorage with fallback
const loadPreference = async (key, defaultValue) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} preference:`, error);
    return defaultValue;
  }
};

export const AppProvider = ({ children }) => {
  // Get system color scheme
  const colorScheme = useColorScheme();
  const systemIsDark = colorScheme === 'dark';

  const [isDark, setIsDark] = useState(systemIsDark);
  const [isNepaliDate, setIsNepaliDate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userNotes, dispatchUserNotes] = useReducer(userNoteReducer, initialUserNotes);

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    savePreference(DARK_MODE_KEY, newMode);
  };

  // Toggle Nepali date and save preference
  const toggleNepaliDate = () => {
    const newValue = !isNepaliDate;
    setIsNepaliDate(newValue);
    savePreference(NEPALI_DATE_KEY, newValue);
  };

  // Load user preferences on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        // Check if dark mode preference exists in storage
        const savedDarkMode = await AsyncStorage.getItem(DARK_MODE_KEY);

        if (savedDarkMode === null) {
          // No saved preference, use system theme
          setIsDark(systemIsDark);
          savePreference(DARK_MODE_KEY, systemIsDark);
        } else {
          // Use saved preference
          setIsDark(JSON.parse(savedDarkMode));
        }

        // Load Nepali date preference
        const nepaliDate = await loadPreference(NEPALI_DATE_KEY, false);
        setIsNepaliDate(nepaliDate);
      } catch (error) {
        console.error('Error loading preferences:', error);
        // Fallback to system theme
        setIsDark(systemIsDark);
      }
    };

    loadUserPreferences();
  }, [systemIsDark]);

  // Listen for system theme changes
  useEffect(() => {
    // We only update based on system theme if user hasn't set a preference
    const checkIfShouldUseSystemTheme = async () => {
      try {
        // Check if user has manually set theme before
        const userSetTheme = await AsyncStorage.getItem('userSetTheme');
        if (userSetTheme === null || userSetTheme === 'false') {
          // No manual preference set, follow system
          setIsDark(systemIsDark);
          savePreference(DARK_MODE_KEY, systemIsDark);
        }
      } catch (error) {
        console.error('Error checking theme preference:', error);
      }
    };

    checkIfShouldUseSystemTheme();
  }, [colorScheme, systemIsDark]);

  // Mark when user manually changes theme
  const setManualTheme = (isDarkMode) => {
    setIsDark(isDarkMode);
    savePreference(DARK_MODE_KEY, isDarkMode);
    AsyncStorage.setItem('userSetTheme', 'true');
  };

  // Modified toggleDarkMode to record manual changes
  const toggleDarkModeManual = () => {
    const newMode = !isDark;
    setManualTheme(newMode);
  };

  // Load notes from storage on initial app load
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      const notes = await loadNotesToStorage();

      // First set the notes as they are
      dispatchUserNotes({ type: 'SET_NOTES', payload: notes });

      // Then ensure all notes have appropriate theme colors
      dispatchUserNotes({ type: 'ENSURE_THEME_COLORS', payload: isDark });

      setIsLoading(false);
    };

    loadNotes();
  }, []);

  // Provide values and functions to components
  return (
    <AppContext.Provider
      value={{
        isDark,
        setIsDark: setManualTheme,
        toggleDarkMode: toggleDarkModeManual,
        isNepaliDate,
        toggleNepaliDate,
        userNotes,
        dispatchUserNotes,
        isLoading,
        getRandomColor,
        labelColorPalette,
        boxColorPalette,
        darkBoxColorPalette,
        systemIsDark
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
