import { StyleSheet, ScrollView, Image } from 'react-native';
import React, { useEffect, useLayoutEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { colors, fonts, screensName, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import { useListCourseModuleMutation } from '../../../../../injectEndpointsTrainee/MyCoursesEndpoints';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../components/organisms/SearchBoxOrganism';

const debounce = (func: any, delay: number) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

interface Props {
  navigation: NavigationType;
}

const CourseModule = (props: Props) => {
  const { navigation } = props;
  const [loader, setLoader] = React.useState(false);
  const [courseModuleData, setCourseModuleData] = React.useState<any>([]);
  const [search, setSearch] = React.useState('');
  const [listCourseModuleApi] = useListCourseModuleMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Course Module');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    fetchCourseModules('');
  }, []);

  const fetchCourseModules = (keyword: string) => {
    setLoader(true);

    const params = {
      search: keyword,
      sort: { attributes: ['id'], sorts: ['desc'] },
      filters: [],
      pageNo: 1,
      itemsPerPage: 100,
    };

    listCourseModuleApi(params)
      .unwrap()
      .then((res: any) => {
        setCourseModuleData(res.data?.data || []);
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

  const handleSearch = useCallback(
    debounce((text: string) => {
      fetchCourseModules(text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    fetchCourseModules('');
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={{ marginTop: vh(15) }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: vw(15) }}
      >
        {courseModuleData?.map((item: any) => {
          const thumbnail = { uri: item.subjectThumbnail };

          return (
            <TouchableAtom
              key={item.subjectId}
              style={styles.card}
              onPress={() =>
                navigation.navigate(screensName.CourseModuleDetails, {
                  subjectId: item.subjectId,
                })
              }
            >
              <Image source={thumbnail} style={styles.thumbnail} />

              <ViewAtom style={{ flex: 1, marginLeft: vw(10) }}>
                <TextAtom style={styles.subject}>{item.subject}</TextAtom>
                <TextAtom style={styles.label}>
                  Subject Details:{' '}
                  <TextAtom style={styles.value}>
                    {item.subjectDescription}
                  </TextAtom>
                </TextAtom>
                <TextAtom style={styles.label}>
                  No of Topic:{' '}
                  <TextAtom style={styles.value}>{item.noOfTopic}</TextAtom>
                </TextAtom>
              </ViewAtom>
            </TouchableAtom>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseModule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: vh(10),
    borderRadius: vw(10),
    marginBottom: vh(12),
    alignItems: 'center',
    elevation: 3,
  },
  thumbnail: {
    width: vw(75),
    height: vw(75),
    borderRadius: vw(8),
    backgroundColor: colors.grey_6,
  },
  subject: {
    fontSize: vw(14.5),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
  },
  label: {
    fontSize: vw(13),
    color: colors.black,
    marginTop: vh(3),
  },
  value: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey,
  },
});
