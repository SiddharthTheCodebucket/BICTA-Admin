import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { colors, screensName, strings, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';
import { useListTraineeDetailsMutation } from '../../../../injectEndpointsTrainee/profileEndpoints';
import { useAppSelector } from '../../../../hooks';
import { saveProfileData } from '../../../../featuresTrainee/Profile/profileSlice';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';

interface Props {
  navigation: NavigationType;
}

const MyProfile = ({ navigation }: Props) => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);

  const { crediantialData } = useAppSelector(state => state.Auth);
  const { profileData } = useAppSelector(state => state.Profile);
  const [listTraineeDetailsApi] = useListTraineeDetailsMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.my_profile);
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, []);

  useEffect(() => {
    listTraineeDetails();
  }, []);

  const listTraineeDetails = () => {
    setLoader(true);
    const params = {
      search: '',
      sort: { attributes: ['created_at'], sorts: ['desc'] },
      filters: [
        ['adminUserId', '=', Number(crediantialData.user[0].adminUserId)],
      ],
      pageNo: 1,
      itemsPerPage: 10,
      isCourseActive: true,
      bipardCentre: [],
      trainingId: Number(crediantialData.traineeDetails.currentTraining),
    };

    listTraineeDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveProfileData(res?.data?.data[0] || null));
        setLoader(false);
      })
      .catch(err => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message,
        });
      });
  };

  const DATA = [
    {
      id: 1,
      name: strings.profile,
      status: profileData.isSubmitted,
      onPress: () => navigation.navigate(screensName.ProfileDetails),
    },
    {
      id: 2,
      name: strings.documents,
      status: 'Yes',
      onPress: () => navigation.navigate(screensName.DocumentDetails),
    },
    {
      id: 3,
      name: strings.indemnity_bond,
      status: profileData?.isTraineeIndemnityBondSubmitted,
      onPress: () => navigation.navigate(screensName.IndemnityBondForm),
    },
  ];
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      {!loader && (
        <View style={{ flex: 1 }}>
          {DATA.map(item => {
            return (
              <TouchableOpacity
                key={item.id.toString()}
                style={[
                  styles.touchable,
                  {
                    backgroundColor:
                      item.status?.toLowerCase() === 'yes'
                        ? colors.primary
                        : colors.red,
                  },
                ]}
                onPress={item.onPress}
              >
                <TextAtom>{item.name}</TextAtom>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
};

export default MyProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  logoutBtn: {
    alignSelf: 'center',
    width: '90%',
  },
  touchable: {
    width: vw(328),
    height: vh(55),
    borderRadius: vw(6),
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vh(15),
  },
});
