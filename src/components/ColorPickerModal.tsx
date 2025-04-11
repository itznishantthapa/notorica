import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { wp, hp, fontSize, responsiveDimensions } from '../utils/responsive';

const ColorPickerModal = ({
    colorPickerVisible,
    setColorPickerVisible,
    isDark,
    folderPosition,
    handleColorSelect,
    colorPalette,
    selectedColor,
    title
}) => {
    return (
        <Modal
            transparent={true}
            visible={colorPickerVisible}
            animationType="fade"
            onRequestClose={() => setColorPickerVisible(false)}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={() => setColorPickerVisible(false)}
            >
                <View
                    style={[
                        styles.colorPickerContainer,
                        {
                            backgroundColor: isDark ? '#212226' : '#ffffff',
                            top: Math.max(folderPosition.y - hp(150), hp(50))
                        }
                    ]}
                >
                    <Text style={[styles.colorPickerTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                        {title || "Select Color"}
                    </Text>
                    <View style={styles.colorGrid}>
                        {colorPalette.map((color, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.colorOption,
                                    { backgroundColor: color },
                                    selectedColor === color && styles.selectedColor
                                ]}
                                onPress={() => handleColorSelect(color)}
                            />
                        ))}
                    </View>
                </View>
            </Pressable>
        </Modal>
    )
}

export default ColorPickerModal

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    colorPickerContainer: {
        position: 'absolute',
        left: '10%',
        width: '80%',
        borderRadius: wp(12),
        padding: wp(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: wp(2) },
        shadowOpacity: 0.25,
        shadowRadius: wp(3.84),
        elevation: 5,
    },
    colorPickerTitle: {
        fontSize: fontSize(16),
        fontWeight: 'bold',
        marginBottom: hp(16),
        textAlign: 'center',
        fontFamily: 'poppins_semibold',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginHorizontal: wp(8),
    },
    colorOption: {
        width: wp(50),
        height: wp(50),
        borderRadius: wp(25),
        margin: wp(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: wp(1) },
        shadowOpacity: 0.2,
        shadowRadius: wp(1.5),
        elevation: 3,
    },
    selectedColor: {
        borderWidth: wp(4),
        borderColor: '#fff',
    },
});