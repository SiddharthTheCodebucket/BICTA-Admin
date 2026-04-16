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
import FormFileUploadWithTitle from '../../../../../../components/templates/FormFileUploadWithTitle';
import FormWhiteButton from '../../../../../../components/templates/FormWhiteButton';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';
import Toast from 'react-native-toast-message';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const cityData = [
  { id: '1', name: 'Gaya' },
  { id: '2', name: 'Patna' },
];

const AddLocation = ({ navigation, route }: Props) => {
  const { data: editData } = route?.params || {};
  const isEditMode = !!editData;

  const [formData, setFormData] = useState({
    locationName: editData?.locationName || '',
    address: editData?.address || '',
    street: editData?.street || '',
    city: editData?.selectCity || '',
    pinCode: editData?.pinCode || '',
    contactPersonName: editData?.contactPerson || '',
    contactNo: editData?.contactNo || '',
    altContactNo: editData?.altContactNo || '',
    emailId: editData?.emailId || '',
    status: editData?.status || 'Active',
    attachment: editData?.attachment || null,
  });

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isEditMode ? 'Edit Location' : strings.lms.locationDetails.title,
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

  const handleFileSelected = (file: any) => {
    setFormData(prev => ({ ...prev, attachment: file }));
  };

  const handleSubmit = () => {
    const mandatoryFields = [
      'locationName',
      'address',
      'street',
      'city',
      'pinCode',
      'contactPersonName',
      'contactNo',
      'emailId',
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
        ? 'Location updated successfully'
        : 'Location added successfully',
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
            title="Location Name"
            isMandatory
            placeholder="Enter"
            value={formData.locationName}
            onChangeText={val => handleInputChange('locationName', val)}
          />
          <FormTextInputWithTitle
            title="Address"
            isMandatory
            placeholder="Enter"
            value={formData.address}
            onChangeText={val => handleInputChange('address', val)}
          />
          <FormTextInputWithTitle
            title="Street"
            isMandatory
            placeholder="Enter"
            value={formData.street}
            onChangeText={val => handleInputChange('street', val)}
          />
          <FormDropdownFieldWithTitle
            title="Select City"
            isMandatory
            placeholder="Select"
            data={cityData}
            value={formData.city}
            onChange={item => handleInputChange('city', item.name)}
          />
          <FormTextInputWithTitle
            title="PIN Code"
            isMandatory
            placeholder="Enter"
            value={formData.pinCode}
            onChangeText={val => handleInputChange('pinCode', val)}
            keyboardType="numeric"
          />
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
            <FormTextInputWithTitle
              title="Alternate Contact No."
              placeholder="Enter"
              value={formData.altContactNo}
              onChangeText={val => handleInputChange('altContactNo', val)}
              keyboardType="phone-pad"
            />
            <FormTextInputWithTitle
              title="Email ID"
              isMandatory
              placeholder="Enter"
              value={formData.emailId}
              onChangeText={val => handleInputChange('emailId', val)}
              keyboardType="email-address"
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

            <FormFileUploadWithTitle
              title="Attachment"
              placeholderText="Upload files here"
              onFileSelected={handleFileSelected}
              fileName={formData.attachment?.name}
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

export default AddLocation;

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
