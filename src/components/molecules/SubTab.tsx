import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { colors, fonts, vh, vw, adminFontSizes } from '../../constants';
import TouchableAtom from '../atoms/TouchableAtom';
import TextAtom from '../atoms/TextAtom';

interface TabOption {
  label: string;
  value: string;
}

interface SubTabProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  style?: ViewStyle;
}

const SubTab: React.FC<SubTabProps> = ({
  tabs,
  activeTab,
  onTabChange,
  style,
}) => {
  return (
    <View style={[styles.statusTabWrap, style]}>
      {tabs.map(tab => (
        <TouchableAtom
          key={tab.value}
          style={[
            styles.statusTab,
            activeTab === tab.value && styles.statusTabActive,
          ]}
          onPress={() => onTabChange(tab.value)}
        >
          <TextAtom
            style={[
              styles.statusTabText,
              activeTab === tab.value && styles.statusTabTextActive,
            ]}
          >
            {tab.label}
          </TextAtom>
        </TouchableAtom>
      ))}
    </View>
  );
};

export default SubTab;

const styles = StyleSheet.create({
  statusTabWrap: {
    marginTop: vh(10),
    marginHorizontal: vw(14),
    padding: vw(2),
    borderRadius: vw(8),
    backgroundColor: '#DCE8F6',
    flexDirection: 'row',
  },
  statusTab: {
    flex: 1,
    height: vh(34),
    borderRadius: vw(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTabActive: {
    backgroundColor: colors.primary_blue,
  },
  statusTabText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
    color: '#3D4B5C',
  },
  statusTabTextActive: {
    color: colors.white,
  },
});
