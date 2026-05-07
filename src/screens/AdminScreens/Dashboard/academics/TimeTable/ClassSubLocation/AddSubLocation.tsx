import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import FormFieldWrapper from '../../../../../../components/templates/FormFieldWrapper';
import FormTextInputWithTitle from '../../../../../../components/templates/FormTextInputWithTitle';
import FormDropdownFieldWithTitle from '../../../../../../components/templates/FormDropdownFieldWithTitle';
import FormSwitchForCard from '../../../../../../components/templates/FormSwitchForCard';
import FormWhiteButton from '../../../../../../components/templates/FormWhiteButton';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';
import Toast from 'react-native-toast-message';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const locationData = [
  { id: '1', name: 'Gaya' },
  { id: '2', name: 'Patna' },
];

const AddSubLocation = ({ navigation, route }: Props) => {
  const { data: editData } = route?.params || {};
  const isEditMode = !!editData;

  const [formData, setFormData] = useState({
    bipardLocation: editData?.bipardLocation || '',
    parentLocation: editData?.selectLocationName || '',
    subLocationName: editData?.subLocationName || '',
    totalCapacity: editData?.totalCapacity || '',
    contactPersonName: editData?.contactPerson || '',
    contactNo: editData?.contactNo || '',
    status: editData?.status || 'Inactive',
  });

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isEditMode ? 'Edit Sub-Location' : 'Add Sub-Location',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation, isEditMode]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = () => {
    const mandatoryFields = [
      'parentLocation',
      'subLocationName',
      'totalCapacity',
      'contactPersonName',
      'contactNo',
      'status',
    ];

    const missingFields = mandatoryFields.filter(
      field => !formData[field as keyof typeof formData],
    );

    if (missingFields.length > 0) {
      Toast.show({
        type: 'error',
        text2: 'Please fill all mandatory fields',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text2: isEditMode
        ? 'Sub-location updated successfully'
        : 'Sub-location added successfully',
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <FormFieldWrapper>
          <FormTextInputWithTitle
            title="BIPARD Location"
            isMandatory
            placeholder="Gaya, bihar"
            value={formData.bipardLocation}
            editable={false}
            style={{ backgroundColor: colors.grey_1 }}
          />
          <FormDropdownFieldWithTitle
            title="Select Location"
            isMandatory
            placeholder="Select"
            data={locationData}
            value={formData.parentLocation}
            onChange={item => handleInputChange('parentLocation', item.name)}
          />
          <FormTextInputWithTitle
            title="Sub-Location Name"
            isMandatory
            placeholder="Enter"
            value={formData.subLocationName}
            onChangeText={val => handleInputChange('subLocationName', val)}
          />
          <FormTextInputWithTitle
            title="Total Capacity"
            isMandatory
            placeholder="Enter"
            value={formData.totalCapacity}
            onChangeText={val => handleInputChange('totalCapacity', val)}
            keyboardType="numeric"
          />
        </FormFieldWrapper>

        <View style={{ marginTop: vh(20) }}>
          <FormFieldWrapper>
            <FormTextInputWithTitle
              title="Contact Person Name"
              isMandatory
              placeholder="Enter"
              value={formData.contactPersonName}
              onChangeText={val => handleInputChange('contactPersonName', val)}
            />
            <FormTextInputWithTitle
              title="Contact No."
              isMandatory
              placeholder="Enter"
              value={formData.contactNo}
              onChangeText={val => handleInputChange('contactNo', val)}
              keyboardType="phone-pad"
            />

            <FormSwitchForCard
              title="Location Status"
              data={[
                { id: 'Active', label: 'Active' },
                { id: 'Inactive', label: 'In-Active' },
              ]}
              selectedValue={formData.status}
              onSelect={item => handleInputChange('status', item.label)}
              containerStyle={{ marginTop: vh(10) }}
            />
          </FormFieldWrapper>
        </View>

        <View style={styles.buttonRow}>
          <FormWhiteButton
            title="Back"
            onPress={() => navigation.goBack()}
            containerStyle={{ flex: 1, marginRight: vw(10) }}
          />
          <FormGradientButton
            title={isEditMode ? 'Update' : 'Add'}
            onPress={handleSubmit}
            containerStyle={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddSubLocation;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },
  scrollContainer: {
    paddingHorizontal: vw(15),
    paddingVertical: vh(20),
    paddingBottom: vh(40),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(30),
    alignItems: 'center',
  },
});
