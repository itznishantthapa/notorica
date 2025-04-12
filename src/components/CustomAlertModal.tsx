import { Modal, StyleSheet, Text, TouchableOpacity, View, Pressable, Keyboard, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { wp, hp, fontSize } from '../utils/responsive';

interface CustomAlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    isDark: boolean;
    isWarning?: boolean;
}

const CustomAlertModal = ({
    visible,
    title,
    message,
    onClose,
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancel',
    isDark,
    isWarning = false,
}: CustomAlertModalProps) => {
    // Animation value for smooth appearance
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Ensure keyboard is dismissed when modal appears
        if (visible) {
            Keyboard.dismiss();

            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            // Fade out animation
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]); 

    // Handle close with animation
    const handleClose = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    // Handle confirm with animation
    const handleConfirm = () => {
        if (onConfirm) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => {
                onConfirm();
            });
        } else {
            handleClose();
        }
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="none" // We'll handle animations ourselves
            onRequestClose={handleClose}
        >
            <Animated.View
                style={[
                    styles.modalOverlay,
                    { opacity: fadeAnim }
                ]}
            >
                <Pressable
                    style={styles.pressableOverlay}
                    onPress={handleClose}
                >
                    <Pressable>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                { backgroundColor: isDark ? '#2f3239' : '#ffffff' },
                                {
                                    transform: [{
                                        scale: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.9, 1]
                                        })
                                    }]
                                }
                            ]}
                        >
                            <View style={styles.headerContainer}>
                                <Text
                                    style={[
                                        styles.titleText,
                                        { color: isDark ? '#ffffff' : '#000000' },
                                        isWarning && { color: '#ff3b30' }
                                    ]}
                                >
                                    {title}
                                </Text>
                            </View>

                            <View style={styles.messageContainer}>
                                <Text
                                    style={[
                                        styles.messageText,
                                        { color: isDark ? '#d4d4d4' : '#333333' }
                                    ]}
                                >
                                    {message}
                                </Text>
                            </View>

                            <View style={styles.buttonsContainer}>
                                {onConfirm && (
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            styles.cancelButton,
                                            { backgroundColor: isDark ? '#41444e' : '#f2f2f2' }
                                        ]}
                                        onPress={handleClose}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                { color: isDark ? '#ffffff' : '#000000' }
                                            ]}
                                        >
                                            {cancelText}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.confirmButton,
                                        { backgroundColor: isWarning ? '#ff3b30' : isDark ? '#9b9ee9' : '#000000' }
                                    ]}
                                    onPress={handleConfirm}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        {confirmText}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </Pressable>
                </Pressable>
            </Animated.View>
        </Modal>
    );
};

export default CustomAlertModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressableOverlay: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: wp(300),
        borderRadius: wp(16),
        overflow: 'hidden',
    },
    headerContainer: {
        paddingHorizontal: wp(20),
        paddingTop: hp(20),
        paddingBottom: hp(10),
        alignItems: 'center',
    },
    titleText: {
        fontSize: fontSize(18),
        fontFamily: 'jakarta_bold',
        textAlign: 'center',
    },
    messageContainer: {
        paddingHorizontal: wp(20),
        paddingBottom: hp(20),
    },
    messageText: {
        fontSize: fontSize(14),
        fontFamily: 'poppins_regular',
        textAlign: 'center',
        lineHeight: hp(20),
    },
    buttonsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(150, 150, 150, 0.2)',
    },
    button: {
        flex: 1,
        paddingVertical: hp(15),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderRightWidth: 1,
        borderRightColor: 'rgba(150, 150, 150, 0.2)',
    },
    confirmButton: {
        flex: 1.5,
    },
    buttonText: {
        fontSize: fontSize(16),
        fontFamily: 'poppins_semibold',
    },
    confirmButtonText: {
        fontSize: fontSize(16),
        fontFamily: 'poppins_semibold',
        color: '#ffffff',
    }
}); 