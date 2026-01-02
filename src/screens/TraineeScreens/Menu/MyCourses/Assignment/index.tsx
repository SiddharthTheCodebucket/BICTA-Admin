import { ScrollView, StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  images,
  screensName,
  vh,
  vw,
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import { useCommonDropdownListMutation } from '../../../../../injectEndpointsTrainee/profileEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import { useAppSelector } from '../../../../../hooks';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../components/atoms/TextAtom';
import ImageAtom from '../../../../../components/atoms/ImageAtom';
import { useFocusEffect } from '@react-navigation/native';

interface Props {
  navigation: NavigationType;
}

const RowItem = ({ label, value }: { label: string; value: string }) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.labelBlack}>{label}: </TextAtom>
    <TextAtom numberOfLines={2} style={styles.valueGrey}>
      {value}
    </TextAtom>
  </ViewAtom>
);

const Assignment = (props: Props) => {
  const { navigation } = props;
  const [loader, setLoader] = React.useState(false);
  const [assignmentList, setAssignmentList] = React.useState<any>([]);
  const { crediantialData } = useAppSelector(state => state.Auth);
  const [commonDropdownListApi] = useCommonDropdownListMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Assignment');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getAssignmentList();
    }, []),
  );

  const getAssignmentList = () => {
    setLoader(true);
    const params = {
      listType: 'assignment_details',
      replacements: [
        crediantialData.user[0].tenantId,
        crediantialData.user[0].adminUserId,
        '%%',
      ],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setAssignmentList(res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {assignmentList?.map((item: any, index: number) => {
          const isSubmitted = item.assignmentStatus === 'Submitted';

          const handlePress = () => {
            if (isSubmitted) {
              navigation.navigate(screensName.AssignmentDetails, {
                submissionId: item.submissionId,
              });
            }
          };

          return (
            <TouchableAtom
              key={index}
              onPress={handlePress}
              disabled={!isSubmitted}
              style={[styles.card]}
            >
              <ViewAtom style={styles.headerRow}>
                <RowItem label="Assignment Name" value={item.assignmentName} />

                {!isSubmitted && (
                  <TouchableAtom
                    onPress={() =>
                      navigation.navigate(screensName.AssignmentEdit, {
                        data: item,
                      })
                    }
                  >
                    <ImageAtom
                      source={images.edit_pencil}
                      style={styles.editIcon}
                    />
                  </TouchableAtom>
                )}
              </ViewAtom>

              <RowItem
                label="Assignment Start Date"
                value={item.assignmentStartDate}
              />
              <RowItem
                label="Assignment End Date"
                value={item.assignmentEndDate}
              />
              <RowItem
                label="Assignment Submission Date"
                value={item.submissionDate}
              />
            </TouchableAtom>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Assignment;

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
    elevation: 4,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    width: vw(325),
    marginLeft: vh(2),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: vw(270),
    marginBottom: vh(5),
  },
  labelBlack: {
    fontSize: vw(13.5),
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
  },
  valueGrey: {
    fontSize: vw(13.5),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    flexShrink: 1,
  },
  editIcon: {
    width: vw(20),
    height: vw(20),
    tintColor: colors.primary,
  },
});
