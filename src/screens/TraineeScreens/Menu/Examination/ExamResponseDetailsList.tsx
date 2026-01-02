import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { colors, fonts, screensName, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import { useListExaminationSubAnsReportMutation } from '../../../../injectEndpointsTrainee/examinationEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const ExamResponseDetailsList = (props: Props) => {
  const { navigation } = props;
  const id = props.route.params?.id;

  const [listExaminationSubAnsReportApi] =
    useListExaminationSubAnsReportMutation();

  const [data, setData] = useState<any>([]);
  const [loader, setLoader] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Exam Response Details List');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    listExaminationSubAnsReport(id);
  }, []);

  const listExaminationSubAnsReport = (id: any) => {
    setLoader(true);
    const params = {
      submissionId: Number(id),
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: 1,
      itemsPerPage: 10,
    };

    listExaminationSubAnsReportApi(params)
      .unwrap()
      .then((res: any) => {
        setData(res.data?.user || []);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const renderExaminationCard = ({ item, index }: any) => (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.ExamResponseSheet, {
          response: item.response,
        });
      }}
    >
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Sr. No.</TextAtom>
          <TextAtom style={styles.value}>1</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.label}>Examination Date</TextAtom>
          <TextAtom style={styles.value}>
            {item.createdDate
              ? moment(item.createdDate).format('DD/MM/YYYY')
              : '-'}
          </TextAtom>
        </View>
      </View>

      <View style={{ marginTop: vh(10) }}>
        <TextAtom style={styles.label}>Training Name:</TextAtom>
        <TextAtom numberOfLines={2} style={styles.value}>
          {item.trainingName || '-'}
        </TextAtom>
      </View>
      <View style={{ marginTop: vh(8) }}>
        <TextAtom style={styles.label}>Examination Name:</TextAtom>
        <TextAtom numberOfLines={2} style={styles.value}>
          {item.testName || '-'}
        </TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Total Questions</TextAtom>
          <TextAtom style={styles.value}>{item.response?.length || 0}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.label}>Total Marks</TextAtom>
          <TextAtom style={styles.value}>{item.totalMarks}</TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Passing Marks</TextAtom>
          <TextAtom style={styles.value}>{item.passingMarks}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.label}>Obtained Marks</TextAtom>
          <TextAtom style={styles.value}>{item.totalObtainedMarks}</TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Attempt</TextAtom>
          <TextAtom style={styles.value}>{item.attempt}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.label}>Status</TextAtom>
          <TextAtom style={styles.value}>{item.result}</TextAtom>
        </View>
      </View>
    </TouchableAtom>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderExaminationCard}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !loader ? (
            <TextAtom style={styles.emptyText}>
              No examination data found
            </TextAtom>
          ) : null
        }
        contentContainerStyle={styles.flatListContainer}
      />
    </SafeAreaView>
  );
};

export default ExamResponseDetailsList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vh(5),
  },
});
