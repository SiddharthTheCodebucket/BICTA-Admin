import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import MedicineTypeList from './MedicineTypeList';
import PharmacyMasterList from './PharmacyMasterList';
import SubTab from '../../../../../../components/molecules/SubTab';

interface Props {
  navigation: any;
}

type PharmacySubTab = 'medicineType' | 'pharmacyMaster';

const Pharmacy = (props: Props) => {
  const [activeTab, setActiveTab] = useState<PharmacySubTab>('medicineType');

  const subTabs = useMemo(
    () => [
      { label: 'Medicine Type', value: 'medicineType' },
      { label: 'Pharmacy Master', value: 'pharmacyMaster' },
    ],
    [],
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* <View style={styles.segmentWrap}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.segmentButton,
            activeTab === 'medicineType' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('medicineType')}
        >
          <TextAtom
            style={[
              styles.segmentText,
              activeTab === 'medicineType' && styles.segmentTextActive,
            ]}
          >
            Medicine Type
          </TextAtom>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.segmentButton,
            activeTab === 'pharmacyMaster' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('pharmacyMaster')}
        >
          <TextAtom
            style={[
              styles.segmentText,
              activeTab === 'pharmacyMaster' && styles.segmentTextActive,
            ]}
          >
            Pharmacy Master
          </TextAtom>
        </TouchableOpacity>
      </View> */}

      <SubTab
        tabs={subTabs}
        activeTab={activeTab}
        onTabChange={value => setActiveTab(value as PharmacySubTab)}
        // style={styles.allocationTabs}
      />

      <View style={styles.content}>
        {activeTab === 'medicineType' ? (
          <MedicineTypeList navigation={props.navigation} />
        ) : (
          <PharmacyMasterList navigation={props.navigation} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Pharmacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  segmentWrap: {
    height: vh(32),
    marginHorizontal: vw(16),
    marginTop: vh(8),
    borderRadius: vw(8),
    backgroundColor: '#E3F2FF',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.primary_dark_blue,
    borderRadius: vw(7),
  },
  segmentText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.new_ui_heading,
  },
  segmentTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
});
