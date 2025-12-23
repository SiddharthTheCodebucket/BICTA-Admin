import { StyleSheet, ScrollView, Image } from 'react-native';
import React, { useEffect, useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { colors, fonts, images, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import { useListCourseModuleMutation } from '../../../../../injectEndpointsTrainee/MyCoursesEndpoints';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';

interface Props {
  route: any;
  navigation: NavigationType;
}

const CourseModuleDetails = (props: Props) => {
  const { navigation } = props;
  const subjectId = props.route.params.subjectId;
  const [loader, setLoader] = React.useState(false);
  const [courseModuleData, setCourseModuleData] = React.useState<any>({});
  const [listCourseModuleApi] = useListCourseModuleMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Course Module Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    fetchCourseModules('');
  }, []);

  const fetchCourseModules = (keyword: string) => {
    setLoader(true);

    const params = {
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [['subjectId', '=', subjectId]],
      pageNo: 1,
      itemsPerPage: 100,
    };

    listCourseModuleApi(params)
      .unwrap()
      .then((res: any) => {
        setCourseModuleData(res.data?.data[0] || {});
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

  const thumbnail = courseModuleData.subjectThumbnail;
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: vw(15) }}
      >
        <ViewAtom style={styles.card}>
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />

          <ViewAtom style={{ flex: 1, marginLeft: vw(10) }}>
            <TextAtom style={styles.subject}>
              {courseModuleData.subject}
            </TextAtom>

            <TextAtom style={styles.label}>
              Subject Details:{' '}
              <TextAtom style={styles.value}>
                {courseModuleData.subjectDescription}
              </TextAtom>
            </TextAtom>

            <TextAtom style={styles.label}>
              No of Topic:{' '}
              <TextAtom style={styles.value}>
                {courseModuleData.noOfTopic}
              </TextAtom>
            </TextAtom>
          </ViewAtom>
        </ViewAtom>

        {courseModuleData?.topics?.map((item: any) => (
          <ViewAtom key={item.id || item.topic} style={styles.topicCard}>
            <TextAtom style={styles.topicTitle}>Topic: {item.topic}</TextAtom>

            <TextAtom style={styles.topicLabel} numberOfLines={2}>
              Description:{' '}
              <TextAtom style={styles.topicValue}>{item.description}</TextAtom>
            </TextAtom>

            <TextAtom style={styles.topicLabel}>
              Faculty Name:{' '}
              <TextAtom style={styles.topicValue}>{item.facultyName}</TextAtom>
            </TextAtom>

            <ViewAtom style={styles.iconRow}>
              <TouchableAtom style={styles.iconBox} onPress={() => {}}>
                <Image source={images.video} style={styles.icon} />
              </TouchableAtom>

              <TouchableAtom style={styles.iconBox} onPress={() => {}}>
                <Image source={images.pdf} style={styles.icon} />
              </TouchableAtom>

              <TouchableAtom style={styles.iconBox} onPress={() => {}}>
                <Image source={images.audio} style={styles.icon} />
              </TouchableAtom>
            </ViewAtom>
          </ViewAtom>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseModuleDetails;

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
  topicCard: {
    backgroundColor: colors.white,
    padding: vh(12),
    borderRadius: vw(10),
    marginTop: vh(10),
    elevation: 2,
  },

  topicTitle: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
    marginBottom: vh(5),
  },

  topicLabel: {
    fontSize: vw(13),
    color: colors.black,
    marginTop: vh(3),
  },

  topicValue: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey,
    fontSize: vw(12),
  },

  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(12),
  },

  iconBox: {
    width: vw(60),
    height: vh(30),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: vw(10),
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: vw(22),
    height: vw(22),
    resizeMode: 'contain',
  },
});
