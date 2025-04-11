import { StyleSheet, Text, View, Modal, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import React from 'react'
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { wp, hp, fontSize } from '../utils/responsive';

type MenuOption = {
    icon: string;
    text: string;
    color: string;
    action: () => void;
};

interface MenuModalProps {
    menuVisible: boolean;
    handleCloseMenu: () => void;
    menuOptions: MenuOption[];
    menuPosition: () => object;
    isDark: boolean;
}

const MenuModal = ({ menuVisible, handleCloseMenu, menuOptions, menuPosition, isDark }: MenuModalProps) => {
    // Determine if the icon is from Ionicons
    const isIonicon = (iconName: string): boolean => {
        const ioniconsNames = ['settings', 'moon', 'sunny', 'calendar'];
        return ioniconsNames.includes(iconName);
    };

    // Wrap action with close menu
    const handleOptionPress = (action: () => void) => {
        return () => {
            // First close the menu
            handleCloseMenu();
            // Then perform the action
            action();
        };
    };

    return (
        <Modal
            transparent={true}
            visible={menuVisible}
            animationType="fade"
            onRequestClose={handleCloseMenu}
        >
            <TouchableWithoutFeedback onPress={handleCloseMenu}>
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.menuContainer,
                            menuPosition(),
                            { backgroundColor: isDark ? '#2f3239' : '#fff' }
                        ]}
                    >
                        {menuOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={handleOptionPress(option.action)}
                            >
                                {isIonicon(option.icon) ? (
                                    <Ionicons name={option.icon as any} size={wp(20)} color={option.color} />
                                ) : (
                                    <MaterialIcons name={option.icon as any} size={wp(20)} color={option.color} />
                                )}
                                <Text
                                    style={[
                                        styles.menuText,
                                        { color: isDark ? '#fff' : '#333' }
                                    ]}
                                >
                                    {option.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default MenuModal

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    menuContainer: {
        padding: wp(8),
        borderRadius: wp(8),
        minWidth: wp(180),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: wp(2) },
        shadowOpacity: 0.25,
        shadowRadius: wp(3.84),
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(12),
        paddingHorizontal: wp(16),
    },
    menuText: {
        marginLeft: wp(16),
        fontSize: fontSize(14),
        fontFamily: 'poppins_regular',
    },
})