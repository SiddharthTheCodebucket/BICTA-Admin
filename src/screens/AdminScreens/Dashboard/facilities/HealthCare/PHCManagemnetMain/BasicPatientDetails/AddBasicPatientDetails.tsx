import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  colors,
  fonts,
  vh,
  vw,
} from '../../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../../components/atoms/TextAtom';
import {
  FormDatePickerWithTitle,
  FormDropdownFieldWithTitle,
  FormFieldWrapper,
  FormGradientButton,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../../components/templates';

type Props = {
  navigation: NavigationType;
  route?: any;
};

const patientTypes = [
  { id: 'Trainee', name: 'Trainee' },
  { id: 'Employee', name: 'Employee' },
  { id: 'Other', name: 'Other' },
];

const searchByOptions = [
  { id: 'uniqueId', name: 'Unique ID' },
  { id: 'mobile', name: 'Mobile' },
];

const simpleOptions = [
  { id: 'select', name: 'Select' },
  { id: 'one', name: 'Option 1' },
];

const bloodGroups = [
  { id: 'AB+', name: 'AB+' },
  { id: 'B+', name: 'B+' },
  { id: 'O+', name: 'O+' },
];

const genders = [
  { id: 'Female', name: 'Female' },
  { id: 'Male', name: 'Male' },
];

const AddBasicPatientDetails = ({ navigation, route }: Props) => {
  const selectedType = route?.params?.patientType ?? 'Other';
  const editItem = route?.params?.item;
  const [patientType, setPatientType] = useState(selectedType);
  const [form, setForm] = useState({
    location: 'Gaya, bihar',
    searchBy: '',
    uniqueId: '',
    vendor: '',
    training: '',
    batch: editItem?.batchNo ?? '12',
    name: editItem?.name ?? '',
    designation: editItem?.designation ?? '12',
    mobile: editItem?.mobile ?? '',
    aadhaar: editItem?.aadhaarNo ?? '',
    bloodGroup: editItem?.bloodGroup ?? '',
    dob: new Date(1990, 8, 4),
    gender: editItem?.gender ?? '',
    temperature: String(editItem?.temperatureInCelsius ?? ''),
    weight: String(editItem?.weight ?? ''),
    bpSystolic: '100',
    bpDiastolic: '80',
    observations: editItem?.primaryObservations ?? '',
    doctor: '',
    treatmentType: '',
  });

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Health Centre',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isLookupPatient = patientType === 'Trainee' || patientType === 'Employee';

  const lockedStyle = useMemo(
    () => (isLookupPatient ? styles.disabledInputText : undefined),
    [isLookupPatient],
  );

  const renderLookupFields = () => {
    if (patientType === 'Other') return null;

    return (
      <>
        <FormDropdownFieldWithTitle
          title="Search By"
          isMandatory
          data={searchByOptions}
          value={form.searchBy}
          onChange={selected => updateField('searchBy', selected.id)}
          containerStyle={styles.field}
        />
        <FormTextInputWithTitle
          title={patientType === 'Trainee' ? 'Trainee / Unique ID' : 'Employee / Unique ID'}
          isMandatory
          value={form.uniqueId}
          onChangeText={text => updateField('uniqueId', text)}
          placeholder="Enter"
          containerStyle={styles.field}
        />
      </>
    );
  };

  const renderTypeSpecificFields = () => {
    if (patientType === 'Trainee') {
      return (
        <>
          <FormDropdownFieldWithTitle
            title="Select Training"
            isMandatory
            data={simpleOptions}
            value={form.training}
            onChange={selected => updateField('training', selected.id)}
            disabled={isLookupPatient}
            containerStyle={styles.field}
          />
          <FormTextInputWithTitle
            title="Batch"
            isMandatory
            value={form.batch}
            editable={false}
            inputStyle={lockedStyle}
            containerStyle={styles.field}
          />
        </>
      );
    }

    if (patientType === 'Employee') {
      return (
        <>
          <FormDropdownFieldWithTitle
            title="Vendor"
            isMandatory
            data={simpleOptions}
            value={form.vendor}
            onChange={selected => updateField('vendor', selected.id)}
            disabled={isLookupPatient}
            containerStyle={styles.field}
          />
          <FormTextInputWithTitle
            title="Designation"
            isMandatory
            value={form.designation}
            editable={false}
            inputStyle={lockedStyle}
            containerStyle={styles.field}
          />
        </>
      );
    }

    return null;
  };

  const handleSubmit = () => {
    Toast.show({ type: 'success', text2: 'Patient details saved' });
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backTitleRow}
        >
          <Icon name="chevron-left" size={28} color={colors.text_black} />
          <TextAtom style={styles.backTitle}>Add Patient Details</TextAtom>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FormFieldWrapper>
            <FormTextInputWithTitle
              title="BIPARD Location"
              isMandatory
              value={form.location}
              editable={false}
              inputStyle={styles.disabledInputText}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Select Patient Type"
              isMandatory
              data={patientTypes}
              value={patientType}
              onChange={selected => setPatientType(selected.id)}
              containerStyle={styles.field}
            />
            {renderLookupFields()}
            {renderTypeSpecificFields()}
            <FormTextInputWithTitle
              title="Name"
              isMandatory
              value={form.name}
              onChangeText={text => updateField('name', text)}
              placeholder="Name"
              editable={!isLookupPatient || patientType === 'Other'}
              inputStyle={lockedStyle}
              containerStyle={styles.field}
            />
            <FormTextInputWithTitle
              title="Mobile"
              isMandatory
              value={form.mobile}
              onChangeText={text => updateField('mobile', text)}
              placeholder="+91 | 9876543210"
              editable={!isLookupPatient || patientType === 'Other'}
              inputStyle={lockedStyle}
              containerStyle={styles.field}
            />
            <FormTextInputWithTitle
              title="Aadhaar No."
              isMandatory
              value={form.aadhaar}
              onChangeText={text => updateField('aadhaar', text)}
              placeholder="1234 5678 1234"
              editable={!isLookupPatient || patientType === 'Other'}
              inputStyle={lockedStyle}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Blood Group"
              isMandatory
              data={bloodGroups}
              value={form.bloodGroup}
              onChange={selected => updateField('bloodGroup', selected.id)}
              disabled={isLookupPatient && patientType !== 'Other'}
              containerStyle={styles.field}
            />
            <FormDatePickerWithTitle
              title="Date of Birth"
              isMandatory
              value={form.dob}
              onChange={date => updateField('dob', date)}
              disabled={isLookupPatient && patientType !== 'Other'}
              inputStyle={lockedStyle}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Gender"
              isMandatory
              data={genders}
              value={form.gender}
              onChange={selected => updateField('gender', selected.id)}
              disabled={isLookupPatient && patientType !== 'Other'}
              containerStyle={styles.field}
            />
          </FormFieldWrapper>

          <TextAtom style={styles.sectionTitle}>New Readings</TextAtom>
          <FormFieldWrapper>
            <View style={styles.twoColumnRow}>
              <FormTextInputWithTitle
                title="Temperature(°C)"
                isMandatory
                value={form.temperature}
                onChangeText={text => updateField('temperature', text)}
                placeholder="36"
                keyboardType="numeric"
                containerStyle={styles.halfField}
              />
              <FormTextInputWithTitle
                title="Weight(Kg)"
                isMandatory
                value={form.weight}
                onChangeText={text => updateField('weight', text)}
                placeholder="50"
                keyboardType="numeric"
                containerStyle={styles.halfField}
              />
              <FormTextInputWithTitle
                title="BP(Systolic)"
                isMandatory
                value={form.bpSystolic}
                onChangeText={text => updateField('bpSystolic', text)}
                placeholder="100"
                keyboardType="numeric"
                containerStyle={styles.halfField}
              />
              <FormTextInputWithTitle
                title="BP(Diastolic)"
                isMandatory
                value={form.bpDiastolic}
                onChangeText={text => updateField('bpDiastolic', text)}
                placeholder="80"
                keyboardType="numeric"
                containerStyle={styles.halfField}
              />
            </View>
            <FormTextInputWithTitle
              title="Primary Observations"
              isMandatory
              value={form.observations}
              onChangeText={text => updateField('observations', text)}
              placeholder="symptoms"
              containerStyle={styles.field}
            />
          </FormFieldWrapper>

          <TextAtom style={styles.sectionTitle}>Assign Doctor</TextAtom>
          <FormFieldWrapper>
            <FormDropdownFieldWithTitle
              title="Select Doctor"
              isMandatory
              data={simpleOptions}
              value={form.doctor}
              onChange={selected => updateField('doctor', selected.id)}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Select Treatment Type"
              isMandatory
              data={simpleOptions}
              value={form.treatmentType}
              onChange={selected => updateField('treatmentType', selected.id)}
              containerStyle={styles.field}
            />
          </FormFieldWrapper>

          <FormFieldWrapper>
            <TextAtom style={styles.uploadTitle}>
              Upload Live Photo<TextAtom style={styles.star}>*</TextAtom>
            </TextAtom>
            <View style={styles.uploadBox}>
              <Icon name="camera" size={50} color="#4B4DE8" />
              <TextAtom style={styles.uploadText}>Capture Live Photo</TextAtom>
              <TouchableOpacity activeOpacity={0.85} style={styles.captureButton}>
                <TextAtom style={styles.captureText}>Capture</TextAtom>
              </TouchableOpacity>
            </View>
          </FormFieldWrapper>
        </ScrollView>

        <View style={styles.bottomBar}>
          <FormWhiteButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            containerStyle={styles.halfButton}
            buttonStyle={styles.bottomButton}
          />
          <FormGradientButton
            title="Add"
            onPress={handleSubmit}
            containerStyle={styles.halfButton}
            buttonStyle={styles.bottomButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddBasicPatientDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  flex1: {
    flex: 1,
  },
  backTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(14),
    paddingTop: vh(8),
    paddingBottom: vh(6),
  },
  backTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  scrollContent: {
    paddingHorizontal: vw(12),
    paddingBottom: vh(112),
  },
  field: {
    marginBottom: vh(8),
  },
  twoColumnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: vw(8),
  },
  halfField: {
    width: '48.8%',
    marginBottom: vh(8),
  },
  disabledInputText: {
    color: '#C4CAD5',
  },
  sectionTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
    marginTop: vh(10),
    marginBottom: vh(6),
    marginLeft: vw(4),
  },
  uploadTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
    marginBottom: vh(8),
  },
  star: {
    color: colors.red,
  },
  uploadBox: {
    minHeight: vh(170),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.text_grey,
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginTop: vh(10),
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.text_black,
  },
  captureButton: {
    marginTop: vh(10),
    height: vh(34),
    minWidth: vw(86),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: colors.text_black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  bottomBar: {
    position: 'absolute',
    left: vw(12),
    right: vw(12),
    bottom: vh(36),
    flexDirection: 'row',
    gap: vw(10),
  },
  halfButton: {
    flex: 1,
  },
  bottomButton: {
    height: vh(40),
    borderRadius: vw(8),
  },
});
