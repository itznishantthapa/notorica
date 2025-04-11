import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView, Dimensions, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons'

interface DocsViewProps {
    isDark: boolean;
    noteData?: any;
    onSave: (data: { title: string; content: string }) => void;
}

// Define the structure for a sheet quadrant
interface QuadrantContent {
    type: 'text' | 'image' | 'empty';
    content: string;
    isBold?: boolean;
    isItalic?: boolean;
}

// Define the structure for a sheet
interface Sheet {
    id: string;
    quadrants: [QuadrantContent, QuadrantContent, QuadrantContent, QuadrantContent];
}

const DocsView = ({ isDark, noteData, onSave }: DocsViewProps) => {
    const [title, setTitle] = useState(noteData?.title || '')
    const [sheets, setSheets] = useState<Sheet[]>([])

    // Set initial data if editing existing note
    useEffect(() => {
        if (noteData) {
            setTitle(noteData.title || '')

            // Parse stored content if it's in the sheet format
            try {
                if (noteData.content) {
                    const parsedContent = JSON.parse(noteData.content);
                    if (Array.isArray(parsedContent)) {
                        setSheets(parsedContent);
                        return;
                    }
                }
            } catch (e) {
                // Content not in correct format, creating new sheet
            }
        }

        // Initialize with one empty sheet if no valid content or new doc
        initializeEmptySheet();
    }, [noteData])

    // Create empty sheet
    const initializeEmptySheet = () => {
        const emptyQuadrant: QuadrantContent = { type: 'empty', content: '' };
        const newSheet: Sheet = {
            id: Date.now().toString(),
            quadrants: [
                { ...emptyQuadrant },
                { ...emptyQuadrant },
                { ...emptyQuadrant },
                { ...emptyQuadrant }
            ]
        };
        setSheets([newSheet]);
    }

    // Add a new sheet
    const addNewSheet = () => {
        const emptyQuadrant: QuadrantContent = { type: 'empty', content: '' };
        const newSheet: Sheet = {
            id: Date.now().toString(),
            quadrants: [
                { ...emptyQuadrant },
                { ...emptyQuadrant },
                { ...emptyQuadrant },
                { ...emptyQuadrant }
            ]
        };
        setSheets([...sheets, newSheet]);
    }

    // Delete a sheet
    const deleteSheet = (sheetId: string) => {
        if (sheets.length <= 1) {
            Alert.alert('Cannot Delete', 'You must have at least one sheet');
            return;
        }

        setSheets(sheets.filter(sheet => sheet.id !== sheetId));
    }

    // Update a quadrant's content
    const updateQuadrantContent = (sheetId: string, quadrantIndex: number, content: string) => {
        const updatedSheets = sheets.map(sheet => {
            if (sheet.id === sheetId) {
                const updatedQuadrants = [...sheet.quadrants];
                updatedQuadrants[quadrantIndex] = {
                    ...updatedQuadrants[quadrantIndex],
                    content
                };
                return { ...sheet, quadrants: updatedQuadrants as [QuadrantContent, QuadrantContent, QuadrantContent, QuadrantContent] };
            }
            return sheet;
        });
        setSheets(updatedSheets);
    }

    // Toggle bold or italic formatting
    const toggleFormatting = (sheetId: string, quadrantIndex: number, formatType: 'bold' | 'italic') => {
        const updatedSheets = sheets.map(sheet => {
            if (sheet.id === sheetId) {
                const updatedQuadrants = [...sheet.quadrants];
                const quadrant = updatedQuadrants[quadrantIndex];

                if (formatType === 'bold') {
                    updatedQuadrants[quadrantIndex] = {
                        ...quadrant,
                        isBold: !quadrant.isBold
                    };
                } else if (formatType === 'italic') {
                    updatedQuadrants[quadrantIndex] = {
                        ...quadrant,
                        isItalic: !quadrant.isItalic
                    };
                }

                return { ...sheet, quadrants: updatedQuadrants as [QuadrantContent, QuadrantContent, QuadrantContent, QuadrantContent] };
            }
            return sheet;
        });
        setSheets(updatedSheets);
    }

    // Set quadrant type (text or image)
    const setQuadrantType = async (sheetId: string, quadrantIndex: number, type: 'text' | 'image') => {
        if (type === 'image') {
            // Request permission to access media library
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need permission to access your photos');
                return;
            }

            // Launch image picker with high quality settings
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false, // Don't allow editing/cropping
                quality: 1,
                base64: true,
                exif: true
            });


            if (!result.canceled && result.assets && result.assets.length > 0) {
                // Update the quadrant with the selected image URI
                const updatedSheets = sheets.map(sheet => {
                    if (sheet.id === sheetId) {
                        const updatedQuadrants = [...sheet.quadrants];
                        updatedQuadrants[quadrantIndex] = {
                            type: 'image',
                            content: result.assets[0].uri
                        };
                        return { ...sheet, quadrants: updatedQuadrants as [QuadrantContent, QuadrantContent, QuadrantContent, QuadrantContent] };
                    }
                    return sheet;
                });
                setSheets(updatedSheets);
            }
        } else {
            // Set to text type
            const updatedSheets = sheets.map(sheet => {
                if (sheet.id === sheetId) {
                    const updatedQuadrants = [...sheet.quadrants];
                    updatedQuadrants[quadrantIndex] = {
                        type: 'text',
                        content: '',
                        isBold: false,
                        isItalic: false
                    };
                    return { ...sheet, quadrants: updatedQuadrants as [QuadrantContent, QuadrantContent, QuadrantContent, QuadrantContent] };
                }
                return sheet;
            });
            setSheets(updatedSheets);
        }
    }

    // Handle save button press
    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for your document');
            return;
        }

        // Convert sheets to JSON string for storage
        const contentString = JSON.stringify(sheets);
        onSave({ title, content: contentString });
    }

    // Render a quadrant with its content (text or image)
    const renderQuadrant = (sheet: Sheet, quadrantIndex: number) => {
        const quadrant = sheet.quadrants[quadrantIndex];

        if (quadrant.type === 'empty') {
            return (
                <View style={styles.emptyQuadrant}>
                    <Text style={[styles.quadrantLabel, { color: isDark ? '#a0a0a0' : '#808080' }]}>
                        Quadrant {quadrantIndex + 1}
                    </Text>
                    <View style={styles.quadrantOptions}>
                        <TouchableOpacity
                            style={[styles.quadrantOption, { backgroundColor: isDark ? '#444' : '#e0e0e0' }]}
                            onPress={() => setQuadrantType(sheet.id, quadrantIndex, 'text')}
                        >
                            <MaterialIcons name="text-fields" size={24} color={isDark ? '#fff' : '#333'} />
                            <Text style={{ color: isDark ? '#fff' : '#333' }}>Text</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.quadrantOption, { backgroundColor: isDark ? '#444' : '#e0e0e0' }]}
                            onPress={() => setQuadrantType(sheet.id, quadrantIndex, 'image')}
                        >
                            <MaterialIcons name="image" size={24} color={isDark ? '#fff' : '#333'} />
                            <Text style={{ color: isDark ? '#fff' : '#333' }}>Image</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else if (quadrant.type === 'text') {
            return (
                <View style={styles.textQuadrant}>
                    <View style={styles.textFormatTools}>
                        <TouchableOpacity
                            style={[
                                styles.formatButton,
                                { backgroundColor: isDark ? '#444' : '#e0e0e0' },
                                quadrant.isBold && { backgroundColor: isDark ? '#9b9ee9' : '#000' }
                            ]}
                            onPress={() => toggleFormatting(sheet.id, quadrantIndex, 'bold')}
                        >
                            <FontAwesome name="bold" size={16} color={isDark ? '#fff' : '#333'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.formatButton,
                                { backgroundColor: isDark ? '#444' : '#e0e0e0' },
                                quadrant.isItalic && { backgroundColor: isDark ? '#9b9ee9' : '#000' }
                            ]}
                            onPress={() => toggleFormatting(sheet.id, quadrantIndex, 'italic')}
                        >
                            <FontAwesome name="italic" size={16} color={isDark ? '#fff' : '#333'} />
                        </TouchableOpacity>
                    </View>

                    <View style={[
                        styles.linesPaperContainer,
                        { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' }
                    ]}>
                        <TextInput
                            style={[
                                styles.quadrantTextInput,
                                { color: isDark ? '#ffffff' : '#000000' },
                                quadrant.isBold && styles.boldText,
                                quadrant.isItalic && styles.italicText
                            ]}
                            placeholder="Write here..."
                            placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                            value={quadrant.content}
                            onChangeText={(text) => {
                                // Count the number of line breaks
                                const lineCount = (text.match(/\n/g) || []).length + 1;
                                // If we're already at 10 lines, prevent adding more lines
                                if (lineCount > 10 && text.length > quadrant.content.length) {
                                    // Only allow deleting text or editing within existing lines
                                    if (text.split('\n').length <= quadrant.content.split('\n').length) {
                                        updateQuadrantContent(sheet.id, quadrantIndex, text);
                                    }
                                } else {
                                    updateQuadrantContent(sheet.id, quadrantIndex, text);
                                }
                            }}
                            multiline={true}
                            scrollEnabled={false}
                            textAlignVertical="top"
                            maxLength={500} // Allow enough characters for 10 lines
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={() => {
                            const updatedSheets = sheets.map(s => {
                                if (s.id === sheet.id) {
                                    const updatedQuadrants = [...s.quadrants];
                                    updatedQuadrants[quadrantIndex] = { type: 'empty', content: '' };
                                    return { ...s, quadrants: updatedQuadrants as [QuadrantContent, QuadrantContent, QuadrantContent, QuadrantContent] };
                                }
                                return s;
                            });
                            setSheets(updatedSheets);
                        }}
                    >
                        <Ionicons name="refresh" size={20} color={isDark ? '#9b9ee9' : '#666'} />
                    </TouchableOpacity>
                </View>
            );
        } else if (quadrant.type === 'image') {
            return (
                <View style={styles.imageQuadrant}>
                    <Image source={{ uri: quadrant.content }} style={styles.quadrantImage} />
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={() => {
                            const updatedSheets = sheets.map(s => {
                                if (s.id === sheet.id) {
                                    const updatedQuadrants = [...s.quadrants];
                                    updatedQuadrants[quadrantIndex] = { type: 'empty', content: '' };
                                    return { ...s, quadrants: updatedQuadrants as [QuadrantContent, QuadrantContent, QuadrantContent, QuadrantContent] };
                                }
                                return s;
                            });
                            setSheets(updatedSheets);
                        }}
                    >
                        <Ionicons name="refresh" size={20} color={isDark ? '#9b9ee9' : '#666'} />
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    }

    // Render a complete A4 sheet with four quadrants
    const renderSheet = (sheet: Sheet, index: number) => {
        return (
            <View key={sheet.id} style={[styles.sheetContainer, { backgroundColor: isDark ? '#ffffff10' : '#f9f9f9' }]}>
                <View style={styles.sheetHeader}>
                    <Text style={[styles.sheetLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                        Sheet {index + 1}
                    </Text>
                    {sheets.length > 1 && (
                        <TouchableOpacity onPress={() => deleteSheet(sheet.id)}>
                            <Ionicons name="trash-outline" size={24} color={isDark ? '#ff5555' : '#ff3333'} />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.sheetContent}>
                    <View style={styles.sheetRow}>
                        <View style={styles.quadrant}>
                            {renderQuadrant(sheet, 0)}
                        </View>
                        <View style={styles.quadrantDivider} />
                        <View style={styles.quadrant}>
                            {renderQuadrant(sheet, 1)}
                        </View>
                    </View>
                    <View style={styles.sheetDivider} />
                    <View style={styles.sheetRow}>
                        <View style={styles.quadrant}>
                            {renderQuadrant(sheet, 2)}
                        </View>
                        <View style={styles.quadrantDivider} />
                        <View style={styles.quadrant}>
                            {renderQuadrant(sheet, 3)}
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[
                styles.docsContainer,
                { backgroundColor: isDark ? '#2f3239' : '#f9f9f9' }
            ]}>
                <TextInput
                    style={[
                        styles.titleInput,
                        { color: isDark ? '#ffffff' : '#000000' }
                    ]}
                    placeholder="Document Title"
                    placeholderTextColor={isDark ? '#a0a0a0' : '#808080'}
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={styles.divider} />

                <ScrollView style={styles.sheetsScrollView}>
                    {sheets.map((sheet, index) => renderSheet(sheet, index))}

                    <TouchableOpacity
                        style={[styles.addSheetButton, { backgroundColor: isDark ? '#9b9ee9' : '#000000' }]}
                        onPress={addNewSheet}
                    >
                        <Ionicons name="add" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Save Button */}
            <View style={styles.saveButtonContainer}>
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: isDark ? '#9b9ee9' : '#000000' }]}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save Document</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default DocsView

const { width } = Dimensions.get('window');
const A4_ASPECT_RATIO = 1 / 1.414; // Width to height ratio of A4 paper
const sheetWidth = width - 60; // Account for padding
const sheetHeight = sheetWidth / A4_ASPECT_RATIO;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        position: 'relative',
    },
    docsContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 70,
    },
    titleInput: {
        fontSize: 22,
        fontFamily: 'jakarta_bold',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        marginHorizontal: 8,
    },
    sheetsScrollView: {
        flex: 1,
        padding: 10,
    },
    sheetContainer: {
        width: sheetWidth,
        minHeight: sheetHeight,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 15,
        overflow: 'hidden',
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    },
    sheetLabel: {
        fontSize: 16,
        fontFamily: 'poppins_semibold',
    },
    sheetContent: {
        flex: 1,
        width: '100%',
    },
    sheetRow: {
        flexDirection: 'row',
        flex: 1,
    },
    sheetDivider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(150, 150, 150, 0.3)',
    },
    quadrant: {
        flex: 1,
        height: sheetHeight / 2 - 30, // Account for sheet header and padding
    },
    quadrantDivider: {
        width: 1,
        backgroundColor: 'rgba(150, 150, 150, 0.3)',
    },
    emptyQuadrant: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    quadrantLabel: {
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    },
    quadrantOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    quadrantOption: {
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    textQuadrant: {
        flex: 1,
        position: 'relative',
        padding: 5,
    },
    linesPaperContainer: {
        flex: 1,
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden'
    },
    paperLine: {
        height: 1,
        width: '100%',
        position: 'absolute',
        marginTop: 18, // First line position
        marginBottom: 18 // Last line position
    },
    quadrantTextInput: {
        flex: 1,
        padding: 8,
        fontSize: 12,
        lineHeight: 18, // Match with the line spacing
        fontFamily: undefined, // Use default system font
        textAlignVertical: 'top',
        backgroundColor: 'transparent',
    },
    boldText: {
        fontWeight: 'bold',
    },
    italicText: {
        fontStyle: 'italic',
    },
    textFormatTools: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingBottom: 5,
    },
    formatButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderRadius: 4,
    },
    activeFormatButton: {

    },
    imageQuadrant: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    quadrantImage: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
    },
    resetButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        padding: 5,
    },
    addSheetButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
        marginVertical: 15,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    addSheetText: {
        color: '#ffffff',
        marginLeft: 8,
        fontSize: 16,
        fontFamily: 'poppins_semibold',
    },
    saveButtonContainer: {
        position: 'absolute',
        bottom: 10,
        left: 20,
        right: 20,
    },
    saveButton: {
        backgroundColor: '#000000',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'poppins_semibold',
    },
}) 