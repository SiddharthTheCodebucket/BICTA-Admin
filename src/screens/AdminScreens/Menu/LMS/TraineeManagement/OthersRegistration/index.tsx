import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { useAndroidBackButton } from '../../../../../../hooks/behaviour';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import General from './General';
import AddressAndOffice from './AddressAndOffice';
import WitnessVerification from './WitnessVerification';
import EmailAndOtp from './EmailAndOtp';
import StepHeaderOtherRegistration from '../../../../../../components/organisms/StepHeaderOtherRegistration';
import {
  resetOtherRegistrationState,
  saveDepartmentList,
  saveDesignationList,
  saveEducationalQualificationList,
  saveGenderList,
  saveMaritalStatusList,
  savePostingDistrictList,
  saveRoleList,
  saveTrainingCenterList,
} from '../../../../../../features/OtherRegistration/otherRegistrationSlice';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import Toast from 'react-native-toast-message';

interface Props {
  navigation: NavigationType;
  route: any;
}

const OthersRegistration = ({ navigation, route }: Props) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);

  const [commonListApi] = useCommonDropdownListMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Other Registration');

    navigation.BackButtonPress = () => {
      navigation.navigate(screensName.AlertOrganism, {
        message:
          'Are you sure you want to exit from others Registration Process?',
        okText: strings.ok,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          navigation.goBack();
          dispatch(resetOtherRegistrationState());
        },
        cancelFunction: () => {},
      });
    };
  }, []);

  useAndroidBackButton(() => {
    navigation.navigate(screensName.AlertOrganism, {
      message:
        'Are you sure you want to exit from others Registration Process?',
      okText: strings.ok,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        dispatch(resetOtherRegistrationState());
        navigation.goBack();
      },
      cancelFunction: () => {},
    });
    return true;
  }, [navigation]);

  const [loader, setLoader] = useState(false);

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const screens = [
    (props: any) => <General {...props} />,
    (props: any) => <AddressAndOffice {...props} />,
    (props: any) => <WitnessVerification {...props} />,
    (props: any) => <EmailAndOtp {...props} />,
  ];

  const ScreenComponent = screens[step];

  useEffect(() => {
    getTrainingCenter(),
      getRole(),
      getGender(),
      getTrainingDepartment(),
      getTrainingDesignation(),
      getTrainingEduQualification(),
      getTrainingDistrict();
    getMaritalStatus();
  }, []);

  const getTrainingCenter = () => {
    setLoader(true);
    const params = {
      listType: 'select_training_centre',
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveTrainingCenterList(res.data || []));
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

  const getRole = () => {
    setLoader(true);
    const params = {
      listType: 'select_role_for_trainee',
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveRoleList(res.data || []));
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
  const getGender = () => {
    setLoader(true);
    const params = {
      listType: 'gender',
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveGenderList(res.data || []));
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
  const getTrainingDepartment = () => {
    setLoader(true);
    const params = {
      listType: 'training_department',
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveDepartmentList(res.data || []));
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

  const getTrainingDesignation = () => {
    setLoader(true);
    const params = {
      listType: 'trainee_designation',
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveDesignationList(res.data || []));
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
  const getTrainingEduQualification = () => {
    setLoader(true);
    const params = {
      listType: 'trainee_education_qualification',
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveEducationalQualificationList(res.data || []));
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
  const getTrainingDistrict = () => {
    setLoader(true);
    const params = {
      listType: 'bihar_all_districts',
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(savePostingDistrictList(res.data || []));
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
  const getMaritalStatus = () => {
    setLoader(true);
    const params = {
      listType: 'marital_status',
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveMaritalStatusList(res.data || []));
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
    <SafeAreaView
      edges={['bottom']}
      style={{
        flex: 1,
        paddingHorizontal: vw(15),
        paddingTop: vh(10),
        backgroundColor: colors.backgroundColor,
      }}
    >
      <FullscreenLoading isVisible={loader} />

      <Text
        style={{
          fontFamily: fonts.Roboto_Bold,
          fontSize: vw(18),
          color: colors.black,
        }}
      >
        {'Others Trainee Registration'}
      </Text>

      <StepHeaderOtherRegistration currentStep={step} />

      <View style={{ flex: 1 }}>
        <ScreenComponent
          navigation={navigation}
          route={route}
          goNext={goNext}
          goBack={goBack}
        />
      </View>
    </SafeAreaView>
  );
};

export default OthersRegistration;
