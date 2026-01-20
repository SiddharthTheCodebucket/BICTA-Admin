import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { colors, fonts, vh, vw } from '../../../../../../constants';

const FeedbackQuestionsResponse = ({ navigation, route }: any) => {
  const item = route?.params?.item;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Feedback Response');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <TextAtom style={styles.emptyText}>Data not available</TextAtom>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ViewAtom style={styles.contentWrapper}>
        <ViewAtom style={styles.topCard}>
          <ViewAtom style={styles.headerRow}>
            <ViewAtom style={{ flex: 1 }}>
              <TextAtom style={styles.dmName}>{item.dmUserName}</TextAtom>
              <TextAtom style={styles.metaText}>
                Conference: {item.conferenceName}
              </TextAtom>
              <TextAtom style={styles.metaText}>
                District: {item.districtName}
              </TextAtom>
            </ViewAtom>
          </ViewAtom>
        </ViewAtom>
      </ViewAtom>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: vh(20) }}
      >
        <ViewAtom style={styles.contentWrapper}>
          {item?.response && item.response.length > 0 ? (
            item.response.map((q: any, index: number) => (
              <ViewAtom key={q.questionId ?? index} style={styles.qaCard}>
                <TextAtom numberOfLines={0} style={styles.questionText}>
                  {index + 1}. {q.question}
                </TextAtom>

                <ViewAtom style={styles.answerBox}>
                  <TextAtom numberOfLines={0} style={styles.answerText}>
                    {q.response ? q.response : '—'}
                  </TextAtom>
                </ViewAtom>
              </ViewAtom>
            ))
          ) : (
            <ViewAtom style={styles.noDataBox}>
              <TextAtom style={styles.noDataText}>
                No feedback response available
              </TextAtom>
            </ViewAtom>
          )}
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FeedbackQuestionsResponse;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  contentWrapper: {
    paddingHorizontal: vw(15),
    paddingTop: vh(10),
  },
  /* Top Card */
  topCard: {
    backgroundColor: colors.white,
    borderRadius: vw(10),
    padding: vw(15),
    marginBottom: vh(10),
    elevation: 2,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dmName: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(18),
    color: colors.black,
    marginBottom: vh(4),
  },

  metaText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },

  downloadBtn: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(6),
    padding: vw(8),
  },

  downloadIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.primary,
  },

  qaCard: {
    backgroundColor: colors.white,
    borderRadius: vw(10),
    padding: vw(15),
    marginHorizontal: vw(2),
    marginBottom: vh(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  questionText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(15),
    color: colors.black,
    marginBottom: vh(8),
  },

  answerBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: vw(8),
    padding: vw(10),
  },

  answerText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    lineHeight: vh(20),
  },

  emptyText: {
    textAlign: 'center',
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.grey,
    marginTop: vh(40),
  },
  noDataBox: {
    marginTop: vh(40),
    alignItems: 'center',
    justifyContent: 'center',
  },

  noDataText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.grey,
    textAlign: 'center',
  },
});
