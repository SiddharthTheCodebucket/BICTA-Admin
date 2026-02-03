import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useBudgetAddTrainingMutation,
  useBudgetUpdateTrainingMutation,
} from '../../../../../../injectEndpoints/budgetManagementEndpoints';
import moment from 'moment';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  bipardLocationList: [],
  bipardLocation: {},
  lmsTrainingList: [],
  selectedLmsTraining: {},
  trainingList: [],
  selectedTraining: {},
  trainingName: '',
  numberOfParticipants: '',
  startDate: '',
  endDate: '',
};

const AddCreateTraining = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addApi] = useBudgetAddTrainingMutation();
  const [updateApi] = useBudgetUpdateTrainingMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item)
        ? 'Add Create Training Data'
        : 'Update Create Training Data',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    getBipardCenter();
    if (!item) return;

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId];

    setForm((prev: any) => ({
      ...prev,
      bipardLocation: selectedLocation,

      selectedLmsTraining: {
        id: item.isLmsTraining,
        name: item.isLmsTraining,
      },

      trainingName: item.trainingName || '',

      numberOfParticipants: String(item.noOfParticipants || ''),

      startDate: moment(item.startDate, 'YYYY-MM-DD').format('DD-MM-YYYY'),
      endDate: moment(item.endDate, 'YYYY-MM-DD').format('DD-MM-YYYY'),
    }));

    getLmsList(selectedLocation.name);
    getTrainingList(selectedLocation.name);
  }, [item]);

  useEffect(() => {
    if (item?.isLmsTraining === 'Yes' && form.trainingList?.length > 0) {
      const selectedTraining = form.trainingList.find(
        (t: any) => t.id === item?.lmsTrainingId,
      );

      if (selectedTraining) {
        setForm((prev: any) => ({
          ...prev,
          selectedTraining,
        }));
      }
    }
  }, [form.trainingList]);

  const schema = Yup.object().shape({
    endDate: Yup.string().required('End Date is required'),
    startDate: Yup.string().required('Start Date is required'),
    numberOfParticipants: Yup.string().required(
      'Number of Participant is required',
    ),
    trainingName:
      form.selectedLmsTraining?.id === 'No'
        ? Yup.string().required('Training Name is required')
        : Yup.mixed().notRequired(),
    selectedTraining:
      form.selectedLmsTraining?.id === 'Yes'
        ? Yup.object({
            id: Yup.string().required('Training is required'),
          })
        : Yup.mixed().notRequired(),
    selectedLmsTraining: Yup.object({
      id: Yup.string().required('Is Training Created in LMS ?'),
    }),
    bipardLocation: Yup.object({
      name: Yup.string().required(
        strings.hostelManagement.addBedDetails.required.location,
      ),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateDetails();
      } else {
        addDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addDetails = () => {
    setLoader(true);
    let params = {
      id: null,
      bipardCentre: [form.bipardLocation?.name],
      isLmsTraining: form.selectedLmsTraining.id,
      lmsTrainingId:
        form.selectedLmsTraining.id === 'Yes' ? form.selectedTraining.id : null,
      trainingName: form.trainingName,
      noOfParticipants: form.numberOfParticipants,
      startDate: moment(form.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      endDate: moment(form.endDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    };
    addApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || strings.something_went_wrong,
        });
        setLoader(false);
      });
  };
  const updateDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      bipardCentre: [form.bipardLocation?.name],
      isLmsTraining: form.selectedLmsTraining.id,
      lmsTrainingId: form.selectedTraining.id,
      trainingName: form.trainingName,
      noOfParticipants: form.numberOfParticipants,
      startDate: moment(form.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      endDate: moment(form.endDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    };

    updateApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || strings.something_went_wrong,
        });
        setLoader(false);
      });
  };
  const getBipardCenter = () => {
    setLoader(true);
    const params = {
      listType: 'select_training_centre',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('bipardLocationList', res.data);
        if (!item) {
          if (tenantId === 1) {
            setValue('bipardLocation', { id: 'Gaya', name: 'Gaya' });
            getLmsList('Gaya');
            getTrainingList('Gaya');
          } else if (tenantId === 2) {
            setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
            getLmsList('Patna');
            getTrainingList('Patna');
          }
        }

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

  const getLmsList = (id: any) => {
    setLoader(true);
    const params = {
      bipardCentre: [id],
      listType: 'select_is_budget_and_lms_training',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('lmsTrainingList', res.data);
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

  const getTrainingList = (id: string) => {
    setLoader(true);

    const params = {
      bipardCentre: [id],
      listType: 'select_lms_training_details_for_mapping',
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('trainingList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.flex1}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        <DropDownOrganism
          label={strings.hostelManagement.addBedDetails.bipardLocation}
          placeholder={strings.hostelManagement.addBedDetails.bipardLocation}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.addBedDetails.bipardLocation,
              Data: [
                { id: 'Gaya', name: 'Gaya' },
                { id: 'Patna', name: 'Patna' },
              ],
              selectedData: form.bipardLocationList,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  bipardLocation: data,
                }));
                getLmsList(data.id);
                getTrainingList(data.id);

                setErrors({ ...errors, 'bipardLocation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.name']}
          isDisabled={tenantId !== 3}
        />

        <DropDownOrganism
          label={'Is Training Created in LMS ?'}
          placeholder={'Is Training Created in LMS ?'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Is Training Created in LMS ?',
              Data: form.lmsTrainingList,
              selectedData: form.selectedLmsTraining,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedLmsTraining: data,
                }));
                if (data?.id === 'No') {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedTraining: {},
                    trainingName: '',
                    numberOfParticipants: '',
                    startDate: '',
                    endDate: '',
                  }));
                }
                setErrors({ ...errors, 'selectedLmsTraining.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedLmsTraining?.name}
          isMandatory
          errorMessage={errors['selectedLmsTraining.id']}
        />

        {form.selectedLmsTraining?.id === 'Yes' && (
          <DropDownOrganism
            label={'Training'}
            placeholder={'Training'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Training',
                Data: form.trainingList,
                selectedData: form.selectedTraining,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedTraining: data,
                  }));
                  setValue('trainingName', data.trainingName);
                  setValue('numberOfParticipants', data.noOfParticipants + '');
                  setValue(
                    'startDate',
                    moment(data.startDate, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  );
                  setValue(
                    'endDate',
                    moment(data.endDate, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                  );
                  setErrors({ ...errors, 'selectedTraining.id': '' });
                },
                typeName: 'trainingName',
                typeId: 'id',
              });
            }}
            inputText={form.selectedTraining?.trainingName}
            isMandatory
            errorMessage={errors['selectedTraining.id']}
          />
        )}
        {form.selectedLmsTraining?.id === 'No' && (
          <TextInputOrganisms
            label={'Training Name'}
            placeholder={'Training Name'}
            ref={input1_ref}
            onSubmitEditing={() => input2_ref?.current?.focus()}
            value={form.trainingName}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              setValue('trainingName', val);
              setErrors({ ...errors, trainingName: '' });
            }}
            isMandatory
            errorMessage={errors.trainingName}
          />
        )}
        <TextInputOrganisms
          label={'Number Of Participant'}
          placeholder={'Number Of Participant'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.numberOfParticipants}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('numberOfParticipants', val);
            setErrors({ ...errors, numberOfParticipants: '' });
          }}
          isMandatory
          errorMessage={errors.numberOfParticipants}
          maxLength={6}
          keyboardType="numeric"
        />

        <DateInputOrganism
          label={strings.blockedForm.startDate}
          placeholder={strings.blockedForm.startDate}
          value={form.startDate}
          onChangeText={(val: any) => {
            setValue('startDate', val);
            setErrors({ ...errors, startDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.startDate}
        />
        <DateInputOrganism
          label={strings.blockedForm.endDate}
          placeholder={strings.blockedForm.endDate}
          value={form.endDate}
          onChangeText={(val: any) => {
            setValue('endDate', val);
            setErrors({ ...errors, endDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          minDate={
            form.startDate
              ? moment(form.startDate, 'DD-MM-YYYY').toDate()
              : undefined
          }
          isMandatory
          errorMessage={errors.endDate}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism
        onPress={onSubmit}
        bttnText={
          item
            ? strings.hostelManagement.addBedDetails.update
            : strings.hostelManagement.addBedDetails.add
        }
      />
    </SafeAreaView>
  );
};

export default AddCreateTraining;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
  },
  contentScroll: {
    paddingBottom: vh(10),
  },
  uploadBtn: {
    borderWidth: 1,
    paddingVertical: vh(10),
    paddingHorizontal: vw(15),
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    width: vw(320),
    alignSelf: 'center',
    backgroundColor: colors.backgroundColor,
    marginBottom: vh(10),
  },
  uploadText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey_1,
    fontSize: vw(14),
  },
  instructionText: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(12),
    marginTop: vh(4),
  },
  labelStyle: {
    width: vw(328),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    alignSelf: 'center',
    color: colors.black,
    marginBottom: vh(8),
  },
  flex1: {
    flex: 1,
  },
});
