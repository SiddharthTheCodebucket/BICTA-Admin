import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import TextAtom from '../atoms/TextAtom';
import { colors, fonts, vh, vw } from '../../constants';

export type ActionPopoverItem = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: ActionPopoverItem[];
  anchorStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  itemTextStyle?: TextStyle;
};

const ActionPopover = ({
  visible,
  onClose,
  items,
  anchorStyle,
  containerStyle,
  itemTextStyle,
}: Props) => {
  const handlePress = (item: ActionPopoverItem) => {
    onClose();
    item.onPress();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.popover, anchorStyle, containerStyle]}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.85}
              onPress={() => handlePress(item)}
              style={[
                styles.item,
                index < items.length - 1 && styles.itemBorder,
              ]}
            >
              <TextAtom
                style={[
                  styles.itemText,
                  item.destructive && styles.destructiveText,
                  itemTextStyle,
                ]}
              >
                {item.label}
              </TextAtom>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

export default ActionPopover;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  popover: {
    position: 'absolute',
    top: vh(110),
    right: vw(16),
    minWidth: vw(136),
    borderRadius: vw(4),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#111827',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  item: {
    minHeight: vh(26),
    justifyContent: 'center',
    paddingHorizontal: vw(9),
    paddingVertical: vh(4),
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#D5D8DE',
  },
  itemText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.text_black,
  },
  destructiveText: {
    color: colors.red,
  },
});
