import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  adminFontSizes,
  colors,
  fonts,
  SvgCross,
  vh,
  vw,
} from '../../constants';
import TextAtom from '../atoms/TextAtom';
import TouchableAtom from '../atoms/TouchableAtom';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  sheetStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const AdminBottomModal = ({
  visible,
  onClose,
  title = 'Filters',
  children,
  sheetStyle,
  contentContainerStyle,
}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.overlay} onPress={onClose} />

        <View style={[styles.sheet, sheetStyle]}>
          <View style={styles.header}>
            <TextAtom style={styles.title}>{title}</TextAtom>
            <TouchableAtom style={styles.closeButton} onPress={onClose}>
              <SvgCross width={vw(16)} height={vw(16)} />
            </TouchableAtom>
          </View>

          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={contentContainerStyle}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AdminBottomModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.white,
    borderTopLeftRadius: vw(18),
    borderTopRightRadius: vw(18),
    paddingHorizontal: vw(16),
    paddingTop: vh(14),
    paddingBottom: vh(18),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(10),
  },
  title: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  closeButton: {
    width: vw(28),
    height: vw(28),
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
