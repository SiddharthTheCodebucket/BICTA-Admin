import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import FormFieldWrapper from '../../../../../../components/templates/FormFieldWrapper';
import FormTextInputWithTitle from '../../../../../../components/templates/FormTextInputWithTitle';
import FormDropdownFieldWithTitle from '../../../../../../components/templates/FormDropdownFieldWithTitle';
import FormWhiteButton from '../../../../../../components/templates/FormWhiteButton';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';
import { useAppSelector } from '../../../../../../hooks';
import Toast from 'react-native-toast-message';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const EditAssignQuestion = (props: Props) => {
  const { navigation, route } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const initialData = route?.params?.data || {};

  const [formData, setFormData] = useState({
    location: crediantialData?.location || 'Gaya, bihar',
    assignmentName: initialData.assignmentName || '',
    subject: initialData.subject || '',
    topic: initialData.topic || '',
    faculty: initialData.faculty || '',
    questionType: initialData.questionType || '',
    questions: initialData.questions || [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        location: crediantialData?.location || 'Gaya, bihar',
        assignmentName: initialData.assignmentName || '',
        subject: initialData.subject || '',
        topic: initialData.topic || '',
        faculty: initialData.faculty || '',
        questionType: initialData.questionType || '',
        questions: initialData.questions || [],
      });
    }
  }, [initialData]);

  useLayoutEffect(() => {
    // Header.setNavigation is removed as we are using AdminPageHeader component
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const handleUpdate = () => {
    if (
      !formData.assignmentName ||
      !formData.subject ||
      !formData.topic ||
      !formData.faculty ||
      !formData.questionType
    ) {
      Toast.show({
        type: 'error',
        text2: 'Please fill all mandatory fields',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text2: 'Assignment updated successfully',
    });
    navigation.goBack();
  };

  const handleReset = () => {
    setFormData({
      location: crediantialData?.location || 'Gaya, bihar',
      assignmentName: initialData.assignmentName || '',
      subject: initialData.subject || '',
      topic: initialData.topic || '',
      faculty: initialData.faculty || '',
      questionType: initialData.questionType || '',
      questions: initialData.questions || [],
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <AdminPageHeader title="Edit Assignment" navigation={navigation} />
        <FormFieldWrapper>
          <FormTextInputWithTitle
            title="BIPARD Location*"
            placeholder="Gaya, bihar"
            value={formData.location}
            editable={false}
            onChangeText={(val: string) =>
              setFormData({ ...formData, location: val })
            }
          />

          <FormTextInputWithTitle
            title="Assignment Name*"
            placeholder="Enter assignment name"
            value={formData.assignmentName}
            onChangeText={(val: string) =>
              setFormData({ ...formData, assignmentName: val })
            }
          />

          <FormDropdownFieldWithTitle
            title="Select Subject*"
            data={[]} // Should be fetched from API
            value={formData.subject}
            onChange={(val: any) => setFormData({ ...formData, subject: val })}
          />

          <FormDropdownFieldWithTitle
            title="Topic*"
            data={[]} // Should be fetched from API
            value={formData.topic}
            onChange={(val: any) => setFormData({ ...formData, topic: val })}
          />

          <FormDropdownFieldWithTitle
            title="Faculty*"
            data={[]} // Should be fetched from API
            value={formData.faculty}
            onChange={(val: any) => setFormData({ ...formData, faculty: val })}
          />

          <FormDropdownFieldWithTitle
            title="Question Type*"
            data={[
              { id: 'Subjective', name: 'Subjective' },
              { id: 'Objective', name: 'Objective' },
            ]}
            value={formData.questionType}
            onChange={(val: any) =>
              setFormData({ ...formData, questionType: val })
            }
          />

          <FormDropdownFieldWithTitle
            title="Select Questions*"
            placeholder="Select"
            data={[]} // Should be fetched from API
            value={formData.questions}
            onChange={(val: any) =>
              setFormData({ ...formData, questions: val })
            }
          />
        </FormFieldWrapper>

        <View style={styles.footer}>
          <FormWhiteButton
            title="Reset"
            onPress={handleReset}
            containerStyle={styles.footerBtn}
          />
          <FormGradientButton
            title="Update"
            onPress={handleUpdate}
            containerStyle={styles.footerBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditAssignQuestion;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },
  scrollContainer: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(30),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(30),
    gap: vw(15),
  },
  footerBtn: {
    flex: 1,
    height: vh(45),
  },
});
