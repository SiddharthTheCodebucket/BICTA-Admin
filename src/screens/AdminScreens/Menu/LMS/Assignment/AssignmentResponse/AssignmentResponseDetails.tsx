import React, { useState, useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import FormTextInputWithTitle from '../../../../../../components/templates/FormTextInputWithTitle';
import FormFileUploadWithTitle from '../../../../../../components/templates/FormFileUploadWithTitle';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import { globalStyles } from '../../../../../../utils/globalStyles/GlobalStyles';
import Toast from 'react-native-toast-message';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const AssignmentResponseDetails = (props: Props) => {
  const { navigation, route } = props;
  const data = route?.params?.data || {};

  const [grade, setGrade] = useState('');
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  const handleUpdate = () => {
    Toast.show({
      type: 'success',
      text2: 'Assignment updated successfully',
    });
    navigation.goBack();
  };

  // Mock data for questions as per specification
  const questions = [
    { id: 'Q1', text: 'Q1: generate five i got certificate', files: 'File' },
    { id: 'Q2', text: 'Q2: generate five i got certificate', files: 'File' },
    { id: 'Q3', text: 'Q3: generate five i got certificate', files: '3 Files' },
    { id: 'Q4', text: 'Q4: generate five i got certificate', files: 'File' },
    { id: 'Q5', text: 'Q5: generate five i got certificate', files: 'File' },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <AdminPageHeader title="Assignment View" navigation={navigation} />

        <View style={styles.metadataSection}>
          <View style={globalStyles.infoRow}>
            <View style={globalStyles.infoCol}>
              <TextAtom style={globalStyles.infoLabel}>
                Assignment Name
              </TextAtom>
              <TextAtom style={globalStyles.infoValue}>
                {data.assignmentName || 'asiign789'}
              </TextAtom>
            </View>
            <View style={globalStyles.infoCol}>
              <TextAtom style={globalStyles.infoLabel}>Training Name</TextAtom>
              <TextAtom style={globalStyles.infoValue}>
                {data.trainingName || 'Rohit Kumar'}
              </TextAtom>
            </View>
          </View>
          <View style={globalStyles.infoRow}>
            <View style={globalStyles.infoCol}>
              <TextAtom style={globalStyles.infoLabel}>Availability</TextAtom>
              <TextAtom style={globalStyles.infoValue}>
                {data.availability || '04-04-2026'}
              </TextAtom>
            </View>
            <View style={globalStyles.infoCol}>
              <TextAtom style={globalStyles.infoLabel}>Submitted Date</TextAtom>
              <TextAtom style={globalStyles.infoValue}>
                {data.submittedDate || '04-04-2026'}
              </TextAtom>
            </View>
          </View>
        </View>

        <View style={styles.questionSection}>
          <TextAtom style={styles.sectionTitle}>Questions</TextAtom>
          {questions.map((q, index) => (
            <View key={q.id} style={styles.questionCard}>
              <TextAtom style={styles.questionText}>{q.text}</TextAtom>
              <TouchableAtom onPress={() => {}}>
                <TextAtom style={styles.fileLink}>{q.files}</TextAtom>
              </TouchableAtom>
            </View>
          ))}
        </View>

        <View style={styles.formSection}>
          <FormTextInputWithTitle
            title="Add Grade"
            placeholder="Enter"
            value={grade}
            onChangeText={val => setGrade(val)}
          />
          <FormFileUploadWithTitle
            title="Upload File*"
            showNote={true}
            noteText="Upload your file here"
            onFileSelected={file => setUploadedFile(file)}
          />
        </View>

        <View style={styles.footer}>
          <FormGradientButton title="Update" onPress={handleUpdate} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssignmentResponseDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },
  scrollContainer: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(30),
  },
  metadataSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: vw(16),
    backgroundColor: colors.white,
    borderRadius: vw(10),
    marginBottom: vh(20),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  questionSection: {
    marginBottom: vh(20),
  },
  sectionTitle: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
    color: colors.black,
    marginBottom: vh(10),
  },
  questionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: vw(12),
    borderRadius: vw(8),
    marginBottom: vh(10),
    borderWidth: 1,
    borderColor: colors.chinese_silver,
  },
  questionText: {
    flex: 1,
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    color: colors.black,
    marginRight: vw(10),
  },
  fileLink: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  formSection: {
    marginBottom: vh(20),
  },
  footer: {
    marginTop: vh(10),
  },
});
