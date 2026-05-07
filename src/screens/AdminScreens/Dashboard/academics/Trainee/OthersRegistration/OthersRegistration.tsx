/* eslint-disable eslint-comments/no-unused-disable, no-unreachable, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import FormStepper from '../../../../../../components/templates/FormStepper';
import { colors } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import General from './OtherRegistrationGeneral';
import AddressAndOffice from './AddressAndOffice';
import WitnessVerification from './WitnessVerification';
import EmailAndOtp from './EmailAndOtp';
import {
  saveDepartmentList,
  saveDesignationList,
  saveEducationalQualificationList,
  saveGenderList,
  saveMaritalStatusList,
  savePostingDistrictList,
  saveRoleList,
  saveSelectedTrainingCenter,
  saveTrainingCenterList,
  saveTrainingNameList,
} from '../../../../../../features/OtherRegistration/otherRegistrationSlice';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import Toast from 'react-native-toast-message';
import OtherRegistrationGeneral from './OtherRegistrationGeneral';

interface Props {
  navigation: NavigationType;
  route: any;
}

const OthersRegistration = ({ navigation, route }: Props) => {
  const dispatch = useDispatch();
  const onDone = route?.params?.onDone;
  const [step, setStep] = useState(0);

  const { crediantialData } = useAppSelector(state => state.Auth);
  const { trainingCenterList, selectedTrainingCenter } = useAppSelector(
    state => state.otherRegistration,
  );
  const tenantId = crediantialData.user[0].tenantId;

  const [commonListApi] = useCommonDropdownListMutation();

  const [loader, setLoader] = useState(false);

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const screens = [
    (props: any) => <OtherRegistrationGeneral {...props} />,
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

  // Auto-select training center and trigger API when list loads
  useEffect(() => {
    if (trainingCenterList.length === 0) return;
    if (selectedTrainingCenter?.id) return; // Already selected

    let autoSelectedCenter = null;
    if (tenantId === 1) {
      autoSelectedCenter = trainingCenterList.find(
        (x: any) => x.name === 'Gaya',
      );
    } else if (tenantId === 2) {
      autoSelectedCenter = trainingCenterList.find(
        (x: any) => x.name === 'Patna',
      );
    }

    if (autoSelectedCenter) {
      dispatch(saveSelectedTrainingCenter(autoSelectedCenter));
      // Trigger dependent API call
      getAllTraining(autoSelectedCenter.name);
    }
  }, [trainingCenterList, tenantId]);

  const getAllTraining = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'list-all-training',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveTrainingNameList(res.data || []));
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
        backgroundColor: colors.backgroundColor,
      }}
    >
      <FullscreenLoading isVisible={loader} />

      <View style={{ paddingHorizontal: 16 }}>
        <AdminPageHeader title="Other Registration" navigation={navigation} />
      </View>

      <FormStepper
        steps={['Personal', 'Address', 'Witness', 'Verify']}
        currentStep={step + 1}
      />

      <View style={{ flex: 1 }}>
        <ScreenComponent
          navigation={navigation}
          route={route}
          goNext={goNext}
          goBack={goBack}
          onDone={onDone}
        />
      </View>
    </SafeAreaView>
  );
};

export default OthersRegistration;
