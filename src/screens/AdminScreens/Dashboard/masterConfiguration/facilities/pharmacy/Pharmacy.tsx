import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';

import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import SubTab from '../../../../../../components/molecules/SubTab';
import AdminListHeader from '../../../../../../components/organisms/AdminListHeader';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';
import FormWhiteButton from '../../../../../../components/templates/FormWhiteButton';
import FormTextInputWithTitle from '../../../../../../components/templates/FormTextInputWithTitle';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import {
  SvgDelete,
  SvgEditPencile as SvgEdit,
} from '../../../../../../constants/svgs';

interface Props {
  navigation: any;
}

const Pharmacy = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState('pharmacy');
  const [activeSubTab, setActiveSubTab] = useState('medicine_type');
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const mainTabs = [
    { label: 'Hostel Master', value: 'hostel' },
    { label: 'Pharmacy', value: 'pharmacy' },
    { label: 'Housekeeping Master', value: 'housekeeping' },
  ];

  const pharmacySubTabs = [
    { label: 'Medicine Type', value: 'medicine_type' },
    { label: 'Pharmacy Master', value: 'pharmacy_master' },
  ];

  const medicineTypeItems = [
    { id: 'med_01', name: 'Vaccine Older' },
    { id: 'med_02', name: 'Balm' },
    { id: 'med_03', name: 'Test Kit' },
    { id: 'med_04', name: 'Lozenges' },
    { id: 'med_05', name: 'Sanitary Pad' },
    { id: 'med_06', name: 'Eyedrop' },
  ];

  const renderListItem = (item: any) => (
    <ViewAtom key={item.id} style={styles.listItem}>
      <TextAtom style={styles.itemName}>{item.name}</TextAtom>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => {}}>
          <SvgDelete color="#FFDADA" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <SvgEdit color="#2D2D2D" />
        </TouchableOpacity>
      </View>
    </ViewAtom>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <AdminPageHeader title="Facilities" navigation={navigation} />

      <SubTab
        activeTab={activeTab}
        tabs={mainTabs}
        onTabChange={tab => setActiveTab(tab)}
      />

      {activeTab === 'pharmacy' && (
        <View style={{ flex: 1 }}>
          <SubTab
            activeTab={activeSubTab}
            tabs={pharmacySubTabs}
            onTabChange={tab => setActiveSubTab(tab)}
            style={{ marginTop: 10 }}
          />

          {activeSubTab === 'medicine_type' && (
            <View style={{ flex: 1 }}>
              <AdminListHeader
                config={{
                  title: 'Medicine Type',
                  count: 40,
                  showCount: true,
                  search: { visible: true },
                  filter: { visible: true },
                }}
              />

              <ScrollView style={styles.listScroll}>
                {medicineTypeItems.map(renderListItem)}
              </ScrollView>
            </View>
          )}

          {activeSubTab === 'pharmacy_master' && (
            <View style={styles.centered}>
              <TextAtom>Pharmacy Master Content</TextAtom>
            </View>
          )}
        </View>
      )}
      {/* 
      <RightSidePanel 
        isVisible={isPanelVisible} 
        onClose={() => setIsPanelVisible(false)}
        title="Add Medicine"
      > */}
      <View style={styles.panelContent}>
        <FormTextInputWithTitle
          title="BIPARD Location*"
          placeholder="Gaya, bihar"
          editable={false}
        />
        <FormTextInputWithTitle
          title="Medicine Type Name*"
          placeholder="Enter"
        />

        <View style={styles.footerActions}>
          <FormWhiteButton
            title="Cancel"
            onPress={() => setIsPanelVisible(false)}
          />
          <FormGradientButton
            title="Add"
            onPress={() => setIsPanelVisible(false)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: vw(15),
    marginHorizontal: vw(15),
    marginBottom: vh(10),
    borderRadius: vw(8),
    elevation: 2,
  },
  itemName: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  itemActions: {
    flexDirection: 'row',
    gap: vw(10),
  },
  listScroll: {
    paddingBottom: vh(20),
  },
  panelContent: {
    padding: vw(20),
    gap: vh(20),
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(30),
  },
});

export default Pharmacy;

// Adding TouchableOpacity to the imports since I used it in renderListItem
// I'll edit it in a second or just add it now.
// Wait, I can't edit during write. I must include it in the first write.
