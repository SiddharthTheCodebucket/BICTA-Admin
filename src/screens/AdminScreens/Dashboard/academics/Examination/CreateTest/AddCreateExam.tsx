import React, { useLayoutEffect, useState } from 'react';
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
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import {
  FormDatePickerWithTitle,
  FormDropdownFieldWithTitle,
  FormFieldWrapper,
  FormGradientButton,
  FormRadioFieldWithTitle,
  FormSwitchWithTitle,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const trainingOptions = [
  { id: 'training_gaya', name: 'Training Gaya For Chat APP' },
  { id: 'panchayati_raj', name: 'Panchayati Raj' },
  { id: 'induction', name: 'Induction Training' },
];

const batchOptions = [
  { id: 'batch_1', name: 'Batch 1' },
  { id: 'batch_2', name: 'Batch 2' },
];

const testTypeOptions = [
  { id: 'assessment', name: 'Assessment' },
  { id: 'quiz', name: 'Quiz' },
];

const yesNoOptions = [
  { id: 'Yes', name: 'Yes' },
  { id: 'No', name: 'No' },
];

const traineeOptions = [
  { id: 'show', name: 'Show' },
  { id: 'hide', name: 'Hide' },
];

const attemptsOptions = [
  { id: '1', name: '1' },
  { id: '2', name: '2' },
  { id: '3', name: '3' },
];

const passMarksOptions = [
  { id: '15', name: '15' },
  { id: '20', name: '20' },
  { id: '25', name: '25' },
];

const AddCreateExam = ({ navigation, route }: Props) => {
  const item = route?.params?.item;
  const training = route?.params?.training;
  const isEdit = !!item;
  const [form, setForm] = useState({
    bipardLocation: item?.bipardCentre ?? 'Gaya, bihar',
    trainingName: item?.trainingNameId ?? training?.id ?? 'training_gaya',
    batchName: item?.batchNameId ?? 'batch_1',
    testName: item?.testName ?? 'Test Name here',
    testType: item?.typeOfTest ?? 'assessment',
    noOfQuestion: String(item?.noOfQuestions ?? 30),
    startDate: item?.quizStartDate
      ? new Date(item.quizStartDate)
      : new Date(2026, 3, 4),
    endDate: item?.quizEndDate ? new Date(item.quizEndDate) : new Date(2026, 3, 4),
    testStartTime: item?.testStartTime ?? '4:30 PM',
    testEndTime: item?.testEndTime ?? '5:00 PM',
    maxMarks: String(item?.maxMarks ?? 30),
    restrictedAccess: item?.restrictedAccess ?? 'Yes',
    selectTrainees: item?.selectTrainees ?? 'show',
    attemptsAllowed: String(item?.attemptsAllowed ?? 1),
    passMarks: String(item?.passMarks ?? 15),
    status: item?.status ?? 'Inactive',
    negativeMarking: item?.negativeMarking ?? 'No',
  });

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.examination.examinationIndex.title,
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

  const resetForm = () => {
    setForm(prev => ({
      ...prev,
      testName: '',
      noOfQuestion: '',
      maxMarks: '',
      passMarks: '',
    }));
  };

  const handleSubmit = () => {
    Toast.show({
      type: 'success',
      text2: isEdit ? 'Exam updated' : 'Exam created',
    });
    navigation.goBack();
  };

  const renderBackTitle = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.goBack()}
      style={styles.backTitleRow}
    >
      <Icon name="chevron-left" size={28} color={colors.text_black} />
      <TextAtom style={styles.backTitle}>{isEdit ? 'Edit' : 'Create'}</TextAtom>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderBackTitle()}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FormFieldWrapper>
            <FormTextInputWithTitle
              title="BIPARD Location"
              isMandatory
              value={form.bipardLocation}
              editable={false}
              inputStyle={styles.disabledInputText}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Training Name"
              isMandatory
              data={trainingOptions}
              value={form.trainingName}
              onChange={selected => updateField('trainingName', selected.id)}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Batch Name"
              isMandatory
              data={batchOptions}
              value={form.batchName}
              onChange={selected => updateField('batchName', selected.id)}
              containerStyle={styles.field}
            />
            <FormTextInputWithTitle
              title="Test Name"
              isMandatory
              value={form.testName}
              onChangeText={text => updateField('testName', text)}
              placeholder="Enter"
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Test Type"
              isMandatory
              data={testTypeOptions}
              value={form.testType}
              onChange={selected => updateField('testType', selected.id)}
              containerStyle={styles.field}
            />
            <FormTextInputWithTitle
              title="No of Question"
              isMandatory
              value={form.noOfQuestion}
              onChangeText={text => updateField('noOfQuestion', text)}
              keyboardType="numeric"
              containerStyle={styles.field}
            />

            <View style={styles.twoColumnRow}>
              <FormDatePickerWithTitle
                title="Start Date"
                isMandatory
                value={form.startDate}
                onChange={date => updateField('startDate', date)}
                containerStyle={styles.halfField}
              />
              <FormDatePickerWithTitle
                title="End Date"
                isMandatory
                value={form.endDate}
                onChange={date => updateField('endDate', date)}
                containerStyle={styles.halfField}
              />
            </View>

            <View style={styles.twoColumnRow}>
              <FormTextInputWithTitle
                title="Test Start Time"
                isMandatory
                value={form.testStartTime}
                onChangeText={text => updateField('testStartTime', text)}
                containerStyle={styles.halfField}
              />
              <FormTextInputWithTitle
                title="Test End Time"
                isMandatory
                value={form.testEndTime}
                onChangeText={text => updateField('testEndTime', text)}
                containerStyle={styles.halfField}
              />
            </View>

            <FormTextInputWithTitle
              title="Max Marks"
              isMandatory
              value={form.maxMarks}
              onChangeText={text => updateField('maxMarks', text)}
              keyboardType="numeric"
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Restricted Access"
              isMandatory
              data={yesNoOptions}
              value={form.restrictedAccess}
              onChange={selected =>
                updateField('restrictedAccess', selected.id)
              }
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Select Trainees"
              isMandatory
              data={traineeOptions}
              value={form.selectTrainees}
              onChange={selected => updateField('selectTrainees', selected.id)}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Attempts Allowed"
              isMandatory
              data={attemptsOptions}
              value={form.attemptsAllowed}
              onChange={selected =>
                updateField('attemptsAllowed', selected.id)
              }
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Pass Marks"
              isMandatory
              data={passMarksOptions}
              value={form.passMarks}
              onChange={selected => updateField('passMarks', selected.id)}
              containerStyle={styles.field}
            />
            <FormSwitchWithTitle
              title="Status"
              data={[
                { id: 'Active', label: 'Active' },
                { id: 'Inactive', label: 'Inactive' },
              ]}
              selectedValue={form.status}
              onSelect={selected => updateField('status', selected.id)}
              containerStyle={styles.field}
            />
            <FormRadioFieldWithTitle
              title="Negative Marking"
              data={[
                { id: 'Yes', value: 'Yes' },
                { id: 'No', value: 'No' },
              ]}
              selectedValue={form.negativeMarking}
              onSelect={selected => updateField('negativeMarking', selected.id)}
              containerStyle={styles.field}
            />
          </FormFieldWrapper>
        </ScrollView>

        <View style={styles.bottomBar}>
          <FormWhiteButton
            title="Reset"
            onPress={resetForm}
            containerStyle={styles.halfButton}
            buttonStyle={styles.bottomButton}
          />
          <FormGradientButton
            title={isEdit ? 'Update' : 'Submit'}
            onPress={handleSubmit}
            containerStyle={styles.halfButton}
            buttonStyle={styles.bottomButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddCreateExam;

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
  disabledInputText: {
    color: colors.text_grey,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: vw(8),
  },
  halfField: {
    flex: 1,
    marginBottom: vh(8),
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
