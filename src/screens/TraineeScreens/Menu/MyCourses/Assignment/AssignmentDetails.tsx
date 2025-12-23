import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React, { useEffect, useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RenderHTML from 'react-native-render-html';
import { colors, fonts, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../components/atoms/TextAtom';
import { useListAssignmentResponseMutation } from '../../../../../injectEndpointsTrainee/MyCoursesEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const RowItem = ({ label, value }: { label: string; value: string }) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.labelBlack}>{label}: </TextAtom>
    <TextAtom style={styles.valueGrey}>{value}</TextAtom>
  </ViewAtom>
);

const AssignmentDetails = (props: Props) => {
  const { navigation } = props;
  const submissionId = props.route.params.submissionId;
  const [loader, setLoader] = React.useState(false);
  const [assignmentResponseData, setAssignmentResponseData] =
    React.useState<any>({});
  const [listAssignmentResponseApi] = useListAssignmentResponseMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Assignment Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    getAssignmentResponseData();
  }, []);

  const getAssignmentResponseData = () => {
    setLoader(true);
    const params = {
      search: '',
      sort: { attributes: ['id'], sorts: ['desc'] },
      filters: [],
      pageNo: 1,
      itemsPerPage: 100,
      submissionId,
    };
    listAssignmentResponseApi(params)
      .unwrap()
      .then((res: any) => {
        setAssignmentResponseData(res.data?.user[0] || {});
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  };

  const subjective = assignmentResponseData.assignment?.subjective;
  const objective = assignmentResponseData.assignment?.objective;

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      {!loader && (
        <>
          <TextAtom style={styles.assignmentName}>
            Assignment - {assignmentResponseData.assignmentName}
          </TextAtom>
          <ViewAtom style={styles.card}>
            <RowItem
              label="Subject Name"
              value={assignmentResponseData.subjectName}
            />
            <RowItem
              label="Topic Name"
              value={assignmentResponseData.subjectTopic}
            />
            <RowItem
              label="Faculty Name"
              value={assignmentResponseData.facultyName}
            />
            <RowItem
              label="Submitted On"
              value={assignmentResponseData.submitOn}
            />
          </ViewAtom>
          <ScrollView showsVerticalScrollIndicator={false}>
            {objective && (
              <ViewAtom style={styles.qaWrapper}>
                {objective.mcqQuestions?.map((q: any, i: number) => {
                  const cleanedQ = q.question
                    .replaceAll(/<[^>]+>/g, '')
                    .replaceAll('&nbsp;', ' ');

                  const selected = objective.mcqResponse[i];
                  const correct = q.correctAnswer;

                  return (
                    <ViewAtom
                      key={`objective-${i}-${q.id || q.question}`}
                      style={{ marginBottom: vh(12) }}
                    >
                      <TextAtom style={styles.question}>
                        Q{i + 1}. {cleanedQ}
                      </TextAtom>

                      {q.options.map((opt: string, idx: number) => {
                        const isSelected = selected === idx;
                        const isCorrect = correct === idx;
                        const getBackgroundColor = () => {
                          if (isCorrect) return '#c8f7c5';
                          if (isSelected) return '#f7d4d4';
                          return colors.white;
                        };
                        const backgroundColor = getBackgroundColor();

                        return (
                          <ViewAtom
                            key={`option-${q.id || q.question}-${opt}`}
                            style={{
                              paddingVertical: vh(5),
                              paddingHorizontal: vw(10),
                              borderRadius: vw(6),
                              marginTop: vh(4),
                              backgroundColor,
                              borderWidth: 1,
                              borderColor: '#ccc',
                            }}
                          >
                            <TextAtom style={{ fontSize: vw(13.5) }}>
                              {String.fromCodePoint(65 + idx)}. {opt}
                            </TextAtom>
                          </ViewAtom>
                        );
                      })}
                    </ViewAtom>
                  );
                })}
              </ViewAtom>
            )}
            {subjective && (
              <ViewAtom style={styles.qaWrapper}>
                {subjective.subjectiveQuestion?.map((q: any, i: number) => {
                  const fileUrl = subjective.uploadedResponseFile?.[i];
                  return (
                    <ViewAtom
                      key={`subjective-${i}-${q}`}
                      style={{ marginBottom: vh(12) }}
                    >
                      <RenderHTML
                        contentWidth={vw(300)}
                        source={{
                          html: `<span class="qText">Q${i + 1}. ${q.replaceAll(
                            /<[^>]+>/g,
                            '',
                          )}</span>`,
                        }}
                        tagsStyles={{
                          span: {
                            fontFamily: fonts.Roboto_Bold,
                            fontWeight: 'bold',
                            fontSize: vw(14),
                            color: colors.black,
                          },
                        }}
                      />
                      {subjective.subjectiveResponse[i] ? (
                        <RenderHTML
                          contentWidth={vw(300)}
                          source={{
                            html: `<div style="color:grey">${subjective.subjectiveResponse[i]}</div>`,
                          }}
                        />
                      ) : null}
                      {fileUrl && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(fileUrl)}
                          style={{
                            width: vw(150),
                            marginTop: vh(10),
                            padding: vh(10),
                            backgroundColor: colors.primary,
                            borderRadius: vw(6),
                            alignItems: 'center',
                          }}
                        >
                          <TextAtom
                            style={{
                              color: colors.white,
                              fontFamily: fonts.Roboto_Medium,
                              fontSize: vw(13),
                            }}
                          >
                            Open File
                          </TextAtom>
                        </TouchableOpacity>
                      )}
                    </ViewAtom>
                  );
                })}
              </ViewAtom>
            )}
            <ViewAtom style={styles.qaWrapper}>
              <TextAtom style={styles.gradeAndRemark}>Grade & Remark</TextAtom>
              <RowItem label="Grade" value={assignmentResponseData.grade} />
              <RowItem label="Remark" value={assignmentResponseData.remark} />
              {assignmentResponseData?.uploadAdminFile && (
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(assignmentResponseData?.uploadAdminFile)
                  }
                  style={{
                    width: vw(150),
                    marginTop: vh(10),
                    padding: vh(10),
                    backgroundColor: colors.primary,
                    borderRadius: vw(6),
                    alignItems: 'center',
                  }}
                >
                  <TextAtom
                    style={{
                      color: colors.white,
                      fontFamily: fonts.Roboto_Medium,
                      fontSize: vw(13),
                    }}
                  >
                    View Response
                  </TextAtom>
                </TouchableOpacity>
              )}
            </ViewAtom>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default AssignmentDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    padding: vw(15),
  },
  card: {
    backgroundColor: colors.white,
    padding: vh(15),
    borderRadius: vw(10),
    marginBottom: vh(12),
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: vh(6),
    flexWrap: 'wrap',
  },
  labelBlack: {
    fontSize: vw(13.5),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
  },
  valueGrey: {
    fontSize: vw(13.5),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
  },
  assignmentName: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.primary,
    marginBottom: vh(10),
  },
  qaWrapper: {
    backgroundColor: colors.white,
    padding: vh(12),
    borderRadius: vw(10),
    marginBottom: vh(12),
  },
  question: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    color: colors.black,
  },
  gradeAndRemark: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(15),
    color: colors.black,
    marginBottom: vh(5),
  },
});
