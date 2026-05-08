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
  FormDropdownFieldWithTitle,
  FormFieldWrapper,
  FormGradientButton,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const subjectOptions = [
  { id: 'machine_learning', name: 'Machine Learning' },
  { id: 'dbms', name: 'DBMS' },
];

const topicOptions = [
  { id: 'supervised_learning', name: 'Supervised Learning' },
  { id: 'database', name: 'Database' },
];

const questionTypeOptions = [
  { id: 'MCQ', name: 'MCQ' },
  { id: 'Subjective', name: 'Subjective' },
];

const questionSelectOptions = [
  { id: 'multi_select', name: 'Multi Select' },
  { id: 'all_questions', name: 'All Questions' },
];

const AddAssignExam = ({ navigation, route }: Props) => {
  const item = route?.params?.item;
  const [form, setForm] = useState({
    bipardLocation: item?.bipardCentre ?? 'Gaya, bihar',
    testName: item?.testName ?? 'Test Name here',
    subject: item?.selectSubjectId ?? 'machine_learning',
    topic: item?.selectTopicId ?? 'supervised_learning',
    questionType: item?.selectQuestionType ?? 'MCQ',
    questions: item?.questions ?? 'multi_select',
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
      subject: '',
      topic: '',
      questionType: '',
      questions: '',
    }));
  };

  const handleSubmit = () => {
    Toast.show({ type: 'success', text2: 'Assigned exam updated' });
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
          <TextAtom style={styles.backTitle}>Edit</TextAtom>
        </TouchableOpacity>

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
            <FormTextInputWithTitle
              title="Test Name"
              isMandatory
              value={form.testName}
              onChangeText={text => updateField('testName', text)}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Select Subject"
              isMandatory
              data={subjectOptions}
              value={form.subject}
              onChange={selected => updateField('subject', selected.id)}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Select Topic"
              isMandatory
              data={topicOptions}
              value={form.topic}
              onChange={selected => updateField('topic', selected.id)}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Question Type"
              isMandatory
              data={questionTypeOptions}
              value={form.questionType}
              onChange={selected => updateField('questionType', selected.id)}
              containerStyle={styles.field}
            />
            <FormDropdownFieldWithTitle
              title="Select Questions"
              isMandatory
              data={questionSelectOptions}
              value={form.questions}
              onChange={selected => updateField('questions', selected.id)}
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
            title="Update"
            onPress={handleSubmit}
            containerStyle={styles.halfButton}
            buttonStyle={styles.bottomButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddAssignExam;

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
