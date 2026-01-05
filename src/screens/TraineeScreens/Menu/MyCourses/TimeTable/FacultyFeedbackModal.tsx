import React, { useState, createRef, useEffect } from 'react';
import {
  Keyboard,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, screensName, vh, vw } from '../../../../../constants';
import { useAndroidBackButton } from '../../../../../hooks/behaviour';
import { NavigationType } from '../../../../../components/organisms/HeaderOrganism';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import TextInputOrganisms from '../../../../../components/organisms/TextInputOrganisms';
import { useFeedbackAddFacultyMutation } from '../../../../../injectEndpointsTrainee/MyCoursesEndpoints';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';

interface Props {
  navigation: NavigationType;
  route: any;
}

const FacultyFeedbackModal = ({ navigation, route }: Props) => {
  const { data, isEdit } = route.params ?? {};

  const input1_ref: any = createRef();
  const isReadOnly = !!data && !isEdit;
  const [feedbackAddFacultyApi] = useFeedbackAddFacultyMutation();

  const [loader, setLoader] = useState(false);
  const [ratings, setRatings] = useState<any>({
    sessionHandling: 0,
    subjectKnowledge: 0,
    communication: 0,
    methodology: 0,
    interaction: 0,
    questionHandling: 0,
  });
  const [remarks, setRemarks] = useState('');

  const ratingFields = [
    {
      key: 'sessionHandling',
      label: 'Session Handling',
      idKey: 'sessionHandledId',
    },
    {
      key: 'subjectKnowledge',
      label: 'Subject Knowledge',
      idKey: 'subjectKnowledgeId',
    },
    { key: 'communication', label: 'Communication', idKey: 'communicationId' },
    { key: 'methodology', label: 'Methodology', idKey: 'methodology' },
    { key: 'interaction', label: 'Interaction', idKey: 'interaction' },
    {
      key: 'questionHandling',
      label: 'Question Handling',
      idKey: 'questionHandling',
    },
  ];

  useEffect(() => {
    if (data) {
      setRatings({
        sessionHandling: data.sessionHandledId ?? data.sessionHandled ?? 0,
        subjectKnowledge: data.subjectKnowledgeId ?? data.subjectKnowledge ?? 0,
        communication: data.communicationId ?? data.communication ?? 0,
        methodology: data.methodology ?? 0,
        interaction: data.interaction ?? 0,
        questionHandling: data.questionHandling ?? 0,
      });
      setRemarks(data.remark ?? '');
    }
  }, [data]);

  const backAction = () => true;
  useAndroidBackButton(backAction, [navigation]);

  const handleRating = (field: string, value: number) => {
    if (isReadOnly) return;
    setRatings({ ...ratings, [field]: value });
  };

  const validateFeedback = () => {
    const missing = ratingFields.filter(f => ratings[f.key] === 0);
    if (missing.length > 0) {
      Toast.show({ type: 'error', text2: 'Rate all fields before submitting' });
      return false;
    }
    if (!remarks.trim()) {
      Toast.show({ type: 'error', text2: 'Add remarks before submitting' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateFeedback()) return;
    setLoader(true);

    try {
      const params = {
        facultyName: Number(data?.selectFacultyId),
        topicId: Number(data?.selectTopicId),
        sessionId: Number(data?.selectASessionId),
        sessionHandled: ratings.sessionHandling,
        subjectKnowledge: ratings.subjectKnowledge,
        communication: ratings.communication,
        methodology: ratings.methodology,
        interaction: ratings.interaction,
        questionHandling: ratings.questionHandling,
        remark: remarks,
        dateOfClass: data?.date,
      };

      const res: any = await feedbackAddFacultyApi(params).unwrap();

      Toast.show({
        type: 'success',
        text2: res?.data?.message ?? 'Feedback submitted successfully',
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: screensName.TimeTable,
              params: { refresh: true },
            },
          ],
        }),
      );
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoader(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={styles.keyboardAvoid}
      >
        <FullscreenLoading isVisible={loader} />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ViewAtom style={styles.modalContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                paddingBottom: vh(20),
              }}
              keyboardShouldPersistTaps="handled"
            >
              <ViewAtom style={styles.mainContainer}>
                <ViewAtom style={styles.headerRow}>
                  <TextAtom style={styles.headerText}>
                    Faculty Feedback
                  </TextAtom>
                </ViewAtom>

                {(data || isEdit) && (
                  <ViewAtom style={{ marginBottom: vh(10) }}>
                    <TextAtom style={styles.facultyDetails}>
                      Faculty Name :{' '}
                      {isEdit ? data.selectFaculty : data.facultyName}
                    </TextAtom>
                    <TextAtom style={styles.facultyDetails}>
                      Topic Name : {isEdit ? data.selectTopic : data.topicName}
                    </TextAtom>
                    <TextAtom style={styles.facultyDetails}>
                      Date :{' '}
                      {isEdit
                        ? moment(data.date).format('DD-MM-YYYY')
                        : moment(data.dateOfClass).format('DD-MM-YYYY')}
                    </TextAtom>
                  </ViewAtom>
                )}

                {ratingFields.map(f => (
                  <ViewAtom key={f.key} style={styles.ratingRow}>
                    <TextAtom style={styles.ratingLabel}>{f.label}</TextAtom>
                    <ViewAtom style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map(num => (
                        <TouchableAtom
                          key={num}
                          onPress={() => handleRating(f.key, num)}
                          disabled={isReadOnly}
                        >
                          <TextAtom
                            style={[
                              styles.starIcon,
                              {
                                color:
                                  ratings[f.key] >= num
                                    ? colors.primary
                                    : colors.grey,
                              },
                            ]}
                          >
                            ★
                          </TextAtom>
                        </TouchableAtom>
                      ))}
                    </ViewAtom>
                  </ViewAtom>
                ))}

                <ViewAtom>
                  <TextAtom style={styles.ratingLabel}>Remarks</TextAtom>
                  <TextInputOrganisms
                    placeholder="Remarks"
                    ref={input1_ref}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    value={remarks}
                    editable={!isReadOnly}
                    disabled={isReadOnly}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onChangeText={(val: string) =>
                      !isReadOnly && setRemarks(val)
                    }
                    isMandatory
                    contentContainerStyle={{ width: vw(280) }}
                    textInputStyle={{ width: vw(280) }}
                    style={{ width: vw(280) }}
                  />
                </ViewAtom>
                <ViewAtom style={styles.buttonRowFeedback}>
                  {isReadOnly ? (
                    <TouchableAtom
                      style={[styles.feedbackButton, styles.closeButton]}
                      onPress={() => navigation.goBack()}
                    >
                      <TextAtom style={styles.closeText}>Close</TextAtom>
                    </TouchableAtom>
                  ) : (
                    <>
                      <TouchableAtom
                        style={[styles.feedbackButton, styles.cancelButton]}
                        onPress={() => navigation.goBack()}
                      >
                        <TextAtom style={styles.cancelText}>Cancel</TextAtom>
                      </TouchableAtom>

                      <TouchableAtom
                        style={[styles.feedbackButton, styles.submitButton]}
                        onPress={handleSubmit}
                        disabled={loader}
                      >
                        <TextAtom style={styles.submitText}>
                          {'Submit'}
                        </TextAtom>
                      </TouchableAtom>
                    </>
                  )}
                </ViewAtom>
              </ViewAtom>
            </ScrollView>
          </ViewAtom>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FacultyFeedbackModal;

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    width: vw(320),
    backgroundColor: colors.backgroundColor,
    borderRadius: vw(10),
    padding: vw(15),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(10),
  },
  headerText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.primary,
  },
  facultyDetails: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.black,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(8),
  },
  ratingLabel: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.black,
  },
  starRow: { flexDirection: 'row' },
  starIcon: { fontSize: vw(20), marginHorizontal: vw(3) },
  buttonRowFeedback: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: vh(5),
  },
  feedbackButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vw(8),
    height: vh(40),
    marginHorizontal: vw(5),
  },
  cancelButton: { backgroundColor: '#F6C7C7' },
  submitButton: { backgroundColor: '#C5EBC5' },
  closeButton: { backgroundColor: colors.primary },
  cancelText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.primary,
    fontSize: vw(14),
  },
  submitText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.primary,
    fontSize: vw(14),
  },
  closeText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.white,
    fontSize: vw(14),
  },
});
