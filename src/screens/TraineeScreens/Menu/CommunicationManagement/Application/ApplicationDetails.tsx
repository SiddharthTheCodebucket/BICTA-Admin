import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { colors, fonts, strings, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../utils/CommonFunction';
import { useDownloadApplicationPdfMutation } from '../../../../../injectEndpointsTrainee/showCauseNoticeEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const ApplicationDetails = (props: Props) => {
  const { navigation } = props;
  const data = props.route.params?.data;
  const [downloadApplicationPdfApi] = useDownloadApplicationPdfMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.application_details);
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const [loader, setLoader] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    downloadApplicationPdf();
  }, []);

  const downloadApplicationPdf = () => {
    setLoader(true);
    const params = {
      search: '',
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: [['id', '=', data?.id]],
      pageNo: 1,
      itemsPerPage: 10,
      exportPdf: true,
    };
    downloadApplicationPdfApi(params)
      .unwrap()
      .then((res: any) => {
        setUrl(res.data.pdfUrl);
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

  const renderDetails = () => (
    <View style={[styles.card, { marginTop: url ? vh(0) : vh(20) }]}>
      <TextAtom style={styles.label}>Training Name</TextAtom>
      <TextAtom style={styles.value}>{data.trainingName ?? '-'}</TextAtom>
      <View style={styles.separator} />
      <TextAtom style={styles.label}>Trainee Name</TextAtom>
      <TextAtom style={styles.value}>{data.traineeName ?? '-'}</TextAtom>
      <View style={styles.separator} />
      <TextAtom style={styles.label}>Category</TextAtom>
      <TextAtom style={styles.value}>{data.category ?? '-'}</TextAtom>
      <View style={styles.separator} />
      <TextAtom style={styles.label}>Title</TextAtom>
      <TextAtom numberOfLines={2} style={styles.value}>
        {data.title ?? '-'}
      </TextAtom>
      <View style={styles.separator} />
      <TextAtom style={styles.label}>From Date</TextAtom>
      <TextAtom style={styles.value}>
        {data.dateFrom ? moment(data.dateFrom).format('DD-MM-YYYY') : '-'}
      </TextAtom>
      <View style={styles.separator} />
      <TextAtom style={styles.label}>To Date</TextAtom>
      <TextAtom style={styles.value}>
        {data.dateTo ? moment(data.dateTo).format('DD-MM-YYYY') : '-'}
      </TextAtom>
      <View style={styles.separator} />
      <TextAtom style={styles.label}>Description</TextAtom>
      <TextAtom style={styles.value}>{data.description ?? '-'}</TextAtom>
      <View style={styles.separator} />
      <TextAtom style={styles.label}>User Uploaded File</TextAtom>
      {data.userUploadedFile ? (
        <TouchableAtom onPress={() => Linking.openURL(data.userUploadedFile)}>
          <TextAtom style={[styles.value, { color: colors.primary }]}>
            View File
          </TextAtom>
        </TouchableAtom>
      ) : (
        <TextAtom style={styles.value}>-</TextAtom>
      )}
      <View style={styles.separator} />
      <TextAtom style={styles.label}>Remarks</TextAtom>
      <TextAtom style={styles.value}>{data.remarks ?? '-'}</TextAtom>
      <View style={styles.separator} />
      <TextAtom style={styles.label}>Application Status</TextAtom>
      <TextAtom style={[styles.value]}>
        {data.applicationStatus ?? '-'}
      </TextAtom>
      <View style={styles.separator} />
      <TextAtom style={styles.label}>Admin Uploaded File</TextAtom>
      {data.adminUploadedFile ? (
        <TouchableAtom onPress={() => Linking.openURL(data.adminUploadedFile)}>
          <TextAtom style={[styles.value, { color: colors.primary }]}>
            View File
          </TextAtom>
        </TouchableAtom>
      ) : (
        <TextAtom style={styles.value}>-</TextAtom>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      {!isNullUndefined(url) && (
        <ButtonOrganism
          onPress={() => {
            downloadAndOpenFile(url);
          }}
          bttnText={strings.download_gate_pass}
          containerStyle={styles.downloadBttnView}
          bttnTextStyle={styles.downloadText}
        />
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderDetails()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplicationDetails;

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
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
  separator: {
    height: 1,
    backgroundColor: colors.chinese_silver,
    marginVertical: vh(8),
  },
  downloadBttnView: {
    width: vw(150),
    height: vh(30),
    backgroundColor: colors.backgroundColor,
    borderWidth: vw(1),
    borderColor: colors.primary,
    marginTop: vh(10),
    alignSelf: 'flex-end',
    marginRight: vh(15),
  },
  downloadText: {
    color: colors.primary,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
  },
});
