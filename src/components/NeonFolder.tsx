import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable, ViewStyle, Alert, ToastAndroid, Platform } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { labelColorPalette } from '../colors/labelColorPalette/labelColorPalette';
import { darkBoxColorPalette, boxColorPalette } from '../colors/boxColorPalette/boxColorPalette';
import MenuModal from './MenuModal';
import ColorPickerModal from './ColorPickerModal';
import { AppContext } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { wp, hp, fontSize, responsiveDimensions } from '../utils/responsive';

// Define the menu option type with correct MaterialIcons name type
type MenuOption = {
    icon: keyof typeof MaterialIcons.glyphMap | string;
    text: string;
    color: string;
    action: () => void;
};

const samplePreviews = [
    "Today I learned about the importance of...",
    "Meeting notes: Discussed project timeline...",
    "Remember to call John about the upcoming...",
    "Ideas for new project: 1) Create a mobile...",
    "Shopping list: Milk, Eggs, Bread, Cheese...",
    "Book recommendations from Sarah: 1984...",
    "Today's weather was perfect for hiking...",
    "Tasks for tomorrow: Complete presentation..."
];

interface NeonFolderProps {
    folder: any;
    onPress: () => void;
    isSettings?: boolean;
    settingsOptions?: MenuOption[];
}

const NeonFolder = ({ folder, onPress, isSettings = false, settingsOptions }: NeonFolderProps) => {
    const { isDark, dispatchUserNotes, getRandomColor, labelColorPalette, boxColorPalette, darkBoxColorPalette } = useContext(AppContext);
    const navigation = useNavigation<any>();

    const { title, date, id, content, type } = folder;
    const isCreateNote = folder.isCreateNote || false;

    // Get the appropriate colors based on the current theme
    const getCurrentLabelColor = () => {
        if (isSettings || isCreateNote) return "#9b9ee9";

        if (isDark) {
            return folder.labelBgColorForDarkMode || folder.labelBgColor || "#9b9ee9";
        } else {
            return folder.labelBgColorForLightMode || folder.labelBgColor || "#9b9ee9";
        }
    };

    const getCurrentBoxColor = () => {
        if (isSettings || isCreateNote) return isDark ? "#20262c" : "#f2f4f8";

        if (isDark) {
            return folder.boxBgColorForDarkMode || folder.boxBgColor || "#212226";
        } else {
            return folder.boxBgColorForLightMode || folder.boxBgColor || "#fefeff";
        }
    };

    const [primaryGlow, setPrimaryGlow] = useState(getCurrentLabelColor());
    const [boxColor, setBoxColor] = useState(getCurrentBoxColor());
    const [menuVisible, setMenuVisible] = useState(false);
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [boxColorPickerVisible, setBoxColorPickerVisible] = useState(false);
    const [folderPosition, setFolderPosition] = useState({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);
    const [timeAgo, setTimeAgo] = useState('');
    const [timeValue, setTimeValue] = useState(0);

    // Update colors when theme changes
    useEffect(() => {
        setPrimaryGlow(getCurrentLabelColor());
        setBoxColor(getCurrentBoxColor());
    }, [isDark, folder.labelBgColorForDarkMode, folder.labelBgColorForLightMode,
        folder.boxBgColorForDarkMode, folder.boxBgColorForLightMode]);

    // Calculate time ago from the date (skip for special notes)
    useEffect(() => {
        if (!isSettings && !isCreateNote && date) {
            // Parse the date string (assuming format MM/DD/YYYY)
            const parts = date.split('/');
            if (parts.length === 3) {
                const month = parseInt(parts[0]) - 1; // Month is 0-indexed in JS Date
                const day = parseInt(parts[1]);
                const year = parseInt(parts[2]);

                // Also parse time if available (assuming format HH:MM)
                let hours = 0;
                let minutes = 0;
                if (folder.time) {
                    const timeParts = folder.time.split(':');
                    if (timeParts.length >= 2) {
                        hours = parseInt(timeParts[0]);
                        minutes = parseInt(timeParts[1]);
                    }
                }

                const savedDate = new Date(year, month, day, hours, minutes);
                const now = new Date();

                // Calculate the difference in milliseconds
                const differenceMs = now.getTime() - savedDate.getTime();

                // Convert to appropriate time unit
                const minuteMs = 60 * 1000;
                const hourMs = 60 * minuteMs;
                const dayMs = 24 * hourMs;

                // Store total minutes for sorting (will be used by parent component)
                const totalMinutes = Math.floor(differenceMs / minuteMs);
                setTimeValue(totalMinutes);

                if (differenceMs < minuteMs) {
                    // Less than a minute
                    setTimeAgo('Just now');
                } else if (differenceMs < hourMs) {
                    // Less than an hour
                    const mins = Math.floor(differenceMs / minuteMs);
                    setTimeAgo(`${mins} ${mins === 1 ? 'min' : 'mins'} ago`);
                } else if (differenceMs < dayMs) {
                    // Less than a day
                    const hours = Math.floor(differenceMs / hourMs);
                    setTimeAgo(`${hours} ${hours === 1 ? 'hour' : 'hours'} ago`);
                } else {
                    // Days
                    const days = Math.floor(differenceMs / dayMs);
                    setTimeAgo(`${days} ${days === 1 ? 'day' : 'days'} ago`);
                }
            }
        }
    }, [date, isSettings, isCreateNote]);

    // Get the preview text (either from content or sample data)
    const getPreviewText = () => {
        if (isCreateNote) {
            return "Tap to start notes";
        } else if (isSettings) {
            return "Long Press Me!";
        } else if (content) {
            // Use actual content if available, trim it for preview
            return content.length > 100 ? content.substring(0, 100) + '...' : content;
        } else {
            // Fallback to sample previews
            const previewIndex = parseInt(id) % samplePreviews.length;
            return samplePreviews[previewIndex];
        }
    };

    // Handle long press to show menu
    const handleLongPress = (event) => {
        // Skip for create note entry
        if (isCreateNote) return;

        // Get the position of the touch
        const { pageX, pageY } = event.nativeEvent;
        setFolderPosition({ x: pageX, y: pageY });
        setMenuVisible(true);
        setIsActive(true);
    };

    // Close menu and deactivate
    const handleCloseMenu = () => {
        setMenuVisible(false);
        setIsActive(false);
    };

    // Copy note content
    const handleCopyContent = async () => {
        const textToCopy = `${title}\n\n${content || getPreviewText()}`;
        await Clipboard.setStringAsync(textToCopy);

        // Show feedback
        if (Platform.OS === 'android') {
            ToastAndroid.show('Content copied to clipboard', ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied', 'Note content copied to clipboard');
        }

        setMenuVisible(false);
        setIsActive(false);
    };

    // Navigate to edit screen
    const handleEditNote = () => {
        setMenuVisible(false);
        setIsActive(false);

        // Navigate to CreateNote with folder data
        navigation.navigate('CreateNote', { noteData: folder });
    };

    // Delete note with confirmation
    const handleDeleteNote = () => {
        Alert.alert(
            'Delete Note',
            `Are you sure you want to delete "${title}"?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        setMenuVisible(false);
                        setIsActive(false);
                    }
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // Dispatch delete action
                        dispatchUserNotes({ type: "DELETE_NOTE", payload: id });
                        setMenuVisible(false);
                        setIsActive(false);
                    }
                }
            ]
        );
    };

    // Handle label color selection
    const handleLabelColorSelect = (color) => {
        setPrimaryGlow(color);
        setColorPickerVisible(false);
        setMenuVisible(false);
        setIsActive(false);

        // Update the appropriate theme color in the note
        const updatedNote = { ...folder };

        if (isDark) {
            updatedNote.labelBgColorForDarkMode = color;
        } else {
            updatedNote.labelBgColorForLightMode = color;
        }

        // Ensure both theme colors exist
        if (!updatedNote.labelBgColorForLightMode) {
            updatedNote.labelBgColorForLightMode = getRandomColor(labelColorPalette);
        }
        if (!updatedNote.labelBgColorForDarkMode) {
            updatedNote.labelBgColorForDarkMode = getRandomColor(labelColorPalette);
        }

        dispatchUserNotes({ type: "UPDATE_NOTE", payload: updatedNote });
    };

    // Handle box color selection
    const handleBoxColorSelect = (color) => {
        setBoxColor(color);
        setBoxColorPickerVisible(false);
        setMenuVisible(false);
        setIsActive(false);

        // Update the appropriate theme color in the note
        const updatedNote = { ...folder };

        if (isDark) {
            updatedNote.boxBgColorForDarkMode = color;
        } else {
            updatedNote.boxBgColorForLightMode = color;
        }

        // Ensure both theme colors exist
        if (!updatedNote.boxBgColorForLightMode) {
            updatedNote.boxBgColorForLightMode = getRandomColor(boxColorPalette);
        }
        if (!updatedNote.boxBgColorForDarkMode) {
            updatedNote.boxBgColorForDarkMode = getRandomColor(darkBoxColorPalette);
        }

        dispatchUserNotes({ type: "UPDATE_NOTE", payload: updatedNote });
    };

    // Show color picker
    const showLabelColorPicker = () => {
        setMenuVisible(false);
        setColorPickerVisible(true);
    };

    // Show box color picker
    const showBoxColorPicker = () => {
        setMenuVisible(false);
        setBoxColorPickerVisible(true);
    };

    // Menu options with valid MaterialIcons names
    const menuOptions: MenuOption[] = isSettings
        ? settingsOptions || []
        : [
            { icon: 'content-copy', text: 'Copy Text', color: '#555', action: handleCopyContent },
            { icon: 'edit', text: 'Edit', color: '#555', action: handleEditNote },
            { icon: 'label', text: 'Set Label Color', color: '#555', action: showLabelColorPicker },
            { icon: 'palette', text: 'Set Box Color', color: '#555', action: showBoxColorPicker },
            { icon: 'delete', text: 'Delete', color: '#ff3b30', action: handleDeleteNote },
        ];

    // Calculate menu position with proper typing
    const menuPosition = (): ViewStyle => {
        // Position menu to the right if there's enough space, otherwise to the left
        const isRightSide = folderPosition.x > responsiveDimensions.window.width / 2;

        return {
            position: 'absolute',
            top: Math.max(folderPosition.y - hp(100), hp(50)), // Ensure menu stays in visible area
            left: isRightSide ? undefined : folderPosition.x + wp(20),
            right: isRightSide ? responsiveDimensions.window.width - folderPosition.x + wp(20) : undefined,
        };
    };

    return (
        <>
            <TouchableOpacity
                onPress={onPress}
                onLongPress={handleLongPress}
                delayLongPress={300}
                activeOpacity={0.8}
            >
                <View style={[
                    styles.mainContainer,
                    isActive && styles.activeContainer
                ]}>
                    <View style={styles.topContainer}>
                        <View style={[styles.leftIconHeader, { backgroundColor: isDark ? '#2f3239' : primaryGlow }]}></View>
                        <View style={{ height: '100%', width: '100%', justifyContent: 'flex-end' }}>
                            <View style={[styles.rightIconHeader, { backgroundColor: isDark ? '#2f3239' : primaryGlow }]}></View>
                        </View>
                    </View>
                    <View style={[
                        styles.bottomContainer,
                        {
                            backgroundColor: boxColor,
                        }
                    ]}>
                        <View style={[
                            styles.noteCountBadge,
                            {
                                backgroundColor: isDark ? primaryGlow : '#f1f6fa',
                            }
                        ]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                                {isCreateNote ? (
                                    <Ionicons
                                        name="add-circle-outline"
                                        size={wp(15)}
                                        color={isDark ? '#ffffff' : primaryGlow}
                                    />
                                ) : isSettings ? (
                                    <Ionicons
                                        name="settings"
                                        size={wp(15)}
                                        color={isDark ? '#ffffff' : primaryGlow}
                                    />
                                ) : (
                                    <FontAwesome
                                        name={type === "doc" ? "file-text-o" : "sticky-note-o"}
                                        size={wp(15)}
                                        color={isDark ? '#ffffff' : primaryGlow}
                                    />
                                )}
                                <Text style={{
                                    color: isDark ? '#ffffff' : '#000000',
                                    fontSize: fontSize(12),
                                    fontWeight: 'bold',
                                    fontFamily: 'poppins_semibold'
                                }}>
                                    {isCreateNote ? "Let's go" : isSettings ? 'mySettings' : timeAgo}
                                </Text>
                            </View>
                        </View>

                        {/* Preview text area */}
                        <View style={styles.previewContainer}>
                            <Text
                                style={[
                                    styles.previewText,
                                    { color: isDark ? '#a0a0a0' : '#808080' }
                                ]}
                                numberOfLines={2}
                            >
                                {getPreviewText()}
                            </Text>
                        </View>

                        <View style={styles.titleContainer}>
                            <Text
                                style={[
                                    styles.titleText,
                                    { color: isDark ? '#ffffff' : '#000000' },
                                    (isCreateNote || isSettings) && styles.specialNoteTitleText
                                ]}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            <MenuModal
                menuVisible={menuVisible}
                handleCloseMenu={handleCloseMenu}
                menuOptions={menuOptions}
                menuPosition={menuPosition}
                isDark={isDark}
            />

            {!isSettings && !isCreateNote && (
                <>
                    <ColorPickerModal
                        colorPickerVisible={colorPickerVisible}
                        setColorPickerVisible={setColorPickerVisible}
                        isDark={isDark}
                        folderPosition={folderPosition}
                        handleColorSelect={handleLabelColorSelect}
                        colorPalette={labelColorPalette}
                        selectedColor={primaryGlow}
                        title={`Select Label Color (${isDark ? 'Dark' : 'Light'} Mode)`}
                    />

                    <ColorPickerModal
                        colorPickerVisible={boxColorPickerVisible}
                        setColorPickerVisible={setBoxColorPickerVisible}
                        isDark={isDark}
                        folderPosition={folderPosition}
                        handleColorSelect={handleBoxColorSelect}
                        colorPalette={isDark ? darkBoxColorPalette : boxColorPalette}
                        selectedColor={boxColor}
                        title={`Select Box Color (${isDark ? 'Dark' : 'Light'} Mode)`}
                    />
                </>
            )}
        </>
    )
}

export default NeonFolder

const styles = StyleSheet.create({
    mainContainer: {
        width: wp(212),
        height: hp(200),
        marginVertical: hp(10),
    },
    activeContainer: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    topContainer: {
        flexDirection: 'row',
        height: hp(50),
        width: '100%',
    },
    leftIconHeader: {
        width: '50%',
        height: '100%',
        backgroundColor: '#2f3239',
        borderTopRightRadius: wp(20),
        borderTopLeftRadius: wp(30)
    },
    rightIconHeader: {
        width: '50%',
        height: '65%',
        backgroundColor: '#2f3239',
        borderTopRightRadius: wp(30),
    },
    bottomContainer: {
        height: hp(150),
        width: '100%',
        backgroundColor: '#212226',
        borderBottomLeftRadius: wp(30),
        borderBottomRightRadius: wp(30),
        justifyContent: 'space-between',
        paddingHorizontal: wp(15),
        paddingVertical: hp(10)
    },
    noteCountBadge: {
        paddingHorizontal: wp(10),
        paddingVertical: hp(8),
        borderRadius: wp(20),
        alignSelf: 'flex-end',
        marginTop: hp(4)
    },
    previewContainer: {
        width: '100%',
        marginTop: hp(6),
        marginBottom: hp(4),
        flex: 1,
        justifyContent: 'center',
    },
    previewText: {
        fontSize: fontSize(11),
        fontFamily: 'poppins_regular',
        lineHeight: hp(14),
    },
    titleContainer: {
        height: '35%',
        width: '100%',
        justifyContent: 'center',
    },
    titleText: {
        color: "#ffffff",
        fontSize: fontSize(16),
        fontFamily: 'jakarta_bold'
    },
    specialNoteTitleText: {
        textDecorationLine: 'underline',
        fontSize: fontSize(18),
    },
});