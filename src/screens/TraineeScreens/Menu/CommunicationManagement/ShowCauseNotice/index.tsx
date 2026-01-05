import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../components/atoms/ImageAtom';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import { useListNoticeResponseUserMutation } from '../../../../../injectEndpointsTrainee/dashboardEndpoints';

interface Props {
  navigation: NavigationType;
}

const ItemSeparator = () => <View style={{ height: vh(10) }} />;

const ShowCauseNotice = (props: Props) => {
  const { navigation } = props;

  const [listNoticeResponseUserApi] = useListNoticeResponseUserMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.show_cause_notice_details);
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      listNoticeResponseUser(1, true);
    }, []),
  );

  const listNoticeResponseUser = (pageNumber: number, initial: boolean) => {
    initial ? setInitialCall(true) : setInitialCall(false);
    const params = {
      search: '',
      sort: {
        attributes: ['dateOfNotice'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    listNoticeResponseUserApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data ?? [];
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        if (pageNumber !== 1 && data.length > 0) {
          setData((prev: any) => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        setPage(pageNumber);

        const totalCount = res?.data?.totalCount ?? 0;
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);
      })
      .catch((err: any) => {
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const renderShowCaseCard = ({ item, index }: any) => (
    <ViewAtom style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.titleWrapper}>
          <TextAtom style={styles.label}>Title:</TextAtom>
          <TextAtom
            numberOfLines={2}
            style={[styles.value, { width: vw(270) }]}
          >
            {item.title}
          </TextAtom>
        </View>
        <TouchableAtom
          onPress={() => {
            navigation.navigate(screensName.ShowCauseNoticeEdit, {
              data: item,
            });
          }}
          style={styles.fileContainer}
        >
          <ImageAtom source={images.edit_pencil} style={styles.editIcon} />
        </TouchableAtom>
      </View>

      <View style={[styles.rowBetween]}>
        <View style={styles.titleWrapper}>
          <TextAtom style={styles.label}>Category:</TextAtom>
          <TextAtom
            numberOfLines={2}
            style={[styles.value, { width: vw(270) }]}
          >
            {item.category}
          </TextAtom>
        </View>
        {item.adminUploadedFile && (
          <TouchableAtom
            style={styles.fileContainer}
            onPress={async () => {
              try {
                await Linking.openURL(item.adminUploadedFile);
              } catch (e) {
                Toast.show({
                  type: 'error',
                  text2: 'Unable to open file',
                });
              }
            }}
          >
            <ImageAtom source={images.pdf} style={styles.fileIcon} />
          </TouchableAtom>
        )}
      </View>

      <View style={[styles.rowBetween, { marginTop: vh(5) }]}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>Notice Date:</TextAtom>
          <TextAtom style={styles.value}>
            {item.dateOfNotice
              ? moment(item.dateOfNotice).format('DD-MM-YYYY')
              : '-'}
          </TextAtom>
        </View>

        <View style={styles.flexEnd}>
          <TextAtom style={styles.label}>Response Date:</TextAtom>
          <TextAtom style={styles.value}>
            {item.dateOfResponse
              ? moment(item.dateOfResponse).format('DD-MM-YYYY')
              : '-'}
          </TextAtom>
        </View>
      </View>
    </ViewAtom>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderShowCaseCard}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.no_notice_found}
            </TextAtom>
          )
        }
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={{ marginTop: vh(15) }}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listNoticeResponseUser(1, false);
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listNoticeResponseUser(page + 1, false)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ItemSeparator}
      />
    </SafeAreaView>
  );
};

export default ShowCauseNotice;

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
    paddingVertical: vh(5),
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
  divider: {
    height: 1,
    backgroundColor: colors.chinese_silver,
    marginVertical: vh(5),
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
  },
  editIcon: {
    width: vw(14),
    height: vw(14),
    tintColor: colors.primary,
    resizeMode: 'contain',
  },
  fileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primary,
    borderWidth: vw(1),
    borderRadius: vw(4),
    paddingHorizontal: vh(5),
    paddingVertical: vh(5),
  },
  fileIcon: {
    width: vw(14),
    height: vw(14),
    tintColor: colors.primary,
    resizeMode: 'contain',
  },
  fileName: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.primary,
    flexShrink: 1,
  },
  titleWrapper: {
    marginTop: vh(10),
    width: vw(270),
  },
  flex1: {
    flex: 1,
  },
  flexEnd: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
