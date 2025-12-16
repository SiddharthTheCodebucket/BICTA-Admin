import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, screensName, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { normalizeNumber } from '../../../../../../utils/CommonFunction';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import { useUpdateTrainingBatchDetailsMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import { useAppSelector } from '../../../../../../hooks';

interface Props {
  route: any;
  navigation: NavigationType;
}

const EditBatchDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const input5_ref: any = createRef();

  const [updateTrainingBatchDetailsApi] =
    useUpdateTrainingBatchDetailsMutation();
  const [commonDropdownApi] = useCommonDropdownListMutation();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Edit Batch Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    bipardLocation: {},
    trainingName: '',
    dateFrom: '',
    dateTo: '',
    batchNumber: '',
    maximumCandidate: '',
    batchName: '',
    batchLocationList: [],
    batchLocation: {},
    batchSubLocationList: [],
    batchSubLocation: {},
    coordinator: '',
    adminList: [],
    admin: {},
  });
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const locationMap: any = {
    1: { id: 'Gaya', name: 'Gaya' },
    2: { id: 'Patna', name: 'Patna' },
  };

  useEffect(() => {
    if (!item) return;

    const selectedLocation = locationMap[item.tenantId] || {};

    setForm((prev: any) => ({
      ...prev,

      bipardLocation: selectedLocation,
      trainingName: item.trainingName || '',
      dateFrom: item.dateFrom ? moment(item.dateFrom).format('DD-MM-YYYY') : '',
      dateTo: item.dateTo ? moment(item.dateTo).format('DD-MM-YYYY') : '',
      batchNumber: item.batchNo?.toString() || '',
      maximumCandidate: item.maximumCandidate?.toString() || '',
      batchName: item.batchName || '',
      coordinator: item.coordinator || '',
      admin: item.admin ? { id: item.adminNameId, name: item.admin } : {},

      batchLocationList: [],
      batchSubLocationList: [],

      batchLocation: {},
      batchSubLocation: {},
    }));

    loadAllEditApis(selectedLocation, item);
  }, [item]);

  const loadAllEditApis = async (location: any, item: any) => {
    if (!location?.id) return;

    await getTrainingBatchLocation(item.trainingNameId, location.name, item);

    await getAdminList(location.name);
  };

  const schema = Yup.object().shape({
    admin: Yup.object({
      name: Yup.string().required('Admin is required'),
    }),
    coordinator: Yup.string().required('Coordinator is required'),
    batchSubLocation: Yup.object({
      name: Yup.string().required('Batch sub location is required'),
    }),
    batchLocation: Yup.object({
      name: Yup.string().required('Batch location is required'),
    }),

    batchName: Yup.string().required('Batch name is required'),
    maximumCandidate: Yup.string().required('Maximum candidate is required'),
    batchNumber: Yup.string().required('Batch number is required'),
    dateTo: Yup.string().required('Date To is required'),
    dateFrom: Yup.string().required('Date From is required'),
    trainingName: Yup.string().required('Training name is required'),
    bipardLocation: Yup.object({
      name: Yup.string().required('Bipard location is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateTrainingBatchDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };
  const updateTrainingBatchDetails = () => {
    setLoader(true);

    const params = {
      id: item?.id,

      bipardCentre: [form.bipardLocation?.name],

      batch_name: form.batchName,
      batch_location: form.batchLocation?.id,
      batch_sub_location: form.batchSubLocation?.id,

      maximum_candidate: form.maximumCandidate,

      admin: form.admin?.id,

      dateFrom: moment(form.dateFrom, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      dateTo: moment(form.dateTo, 'DD-MM-YYYY').format('YYYY-MM-DD'),

      trainingNameId: form.trainingName,
      trainingNameIdShow: item.trainingNameId,

      batchNo: form.batchNumber,

      coordinatorId: item.coordinatorId,
    };

    updateTrainingBatchDetailsApi(params)
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
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  const getTrainingBatchLocation = async (
    trainingId: any,
    centre: any,
    item: any,
  ) => {
    setLoader(true);

    const params = {
      listType: 'training_batch_location',
      bipardCentre: [centre],
      replacements: ['%%', trainingId],
    };

    try {
      const res: any = await commonDropdownApi(params).unwrap();
      const list = res.data || [];

      setValue('batchLocationList', list);

      // Auto select matching batchLocationId
      const found = list.find((i: any) => i.id == item.batchLocationId);

      if (found) {
        setValue('batchLocation', found);

        // Call SubLocation API
        await getTrainingBatchSubLocation(trainingId, centre, found.id, item);
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message,
      });
    } finally {
      setLoader(false);
    }
  };

  const getAdminList = async (centre: any) => {
    setLoader(true);

    const params = {
      listType: 'select_course_admin',
      bipardCentre: [centre],
      replacements: [],
    };

    try {
      const res: any = await commonDropdownApi(params).unwrap();
      setValue('adminList', res.data || []);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message,
      });
    } finally {
      setLoader(false);
    }
  };

  const getTrainingBatchSubLocation = async (
    trainingId: any,
    centre: any,
    batchLocationId: any,
    item: any,
  ) => {
    setLoader(true);

    const params = {
      listType: 'training_batch_sub_location',
      bipardCentre: [centre],
      replacements: ['%%', trainingId, batchLocationId],
    };

    try {
      const res: any = await commonDropdownApi(params).unwrap();
      const list = res.data || [];

      setValue('batchSubLocationList', list);

      // Auto select matched sub-location
      const found = list.find((i: any) => i.id == item.batchSubLocationId);

      if (found) {
        setValue('batchSubLocation', found);
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message,
      });
    } finally {
      setLoader(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <DropDownOrganism
          label={'Bipard Location'}
          placeholder={'Bipard Location'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Bipard Location',
              Data: [
                { id: 'Gaya', name: 'Gaya' },
                { id: 'Patna', name: 'Patna' },
              ],
              selectedData: form.bipardLocation,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  bipardLocation: data,
                  vehicleColor: {},
                }));

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
        <TextInputOrganisms
          label={'Training Name'}
          placeholder={'Training Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.trainingName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('trainingName', val);
            setErrors({ ...errors, trainingName: '' });
          }}
          isMandatory
          errorMessage={errors.trainingName}
          disabled
          editable={false}
        />

        <DateInputOrganism
          label="Date From"
          placeholder="Date From"
          value={form.dateFrom}
          onChangeText={(val: any) => {
            setValue('dateFrom', val);
            setErrors({ ...errors, dateFrom: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.dateFrom}
          isDisable={true}
        />

        <DateInputOrganism
          label="Date To"
          placeholder="Date To"
          value={form.dateTo}
          onChangeText={(val: any) => {
            setValue('dateTo', val);
            setErrors({ ...errors, dateTo: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.dateTo}
          isDisable={true}
        />
        <TextInputOrganisms
          label={'Batch Number'}
          placeholder={'Batch Number'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={form.batchNumber}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('batchNumber', val);
            setErrors({ ...errors, batchNumber: '' });
          }}
          isMandatory
          errorMessage={errors.batchNumber}
        />
        <TextInputOrganisms
          label={'Maximum Candidate'}
          placeholder={'Maximum Candidate'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={form.maximumCandidate}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeNumber(val);
            setValue('maximumCandidate', formattedInput);
            setErrors({ ...errors, maximumCandidate: '' });
          }}
          isMandatory
          errorMessage={errors.maximumCandidate}
          maxLength={10}
          keyboardType="numeric"
        />
        <TextInputOrganisms
          label={'Batch Name'}
          placeholder={'Batch Name'}
          ref={input4_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={form.batchName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('batchName', val);
            setErrors({ ...errors, batchName: '' });
          }}
          isMandatory
          errorMessage={errors.batchName}
          // disabled
          // editable={false}
        />
        <DropDownOrganism
          label={'Batch Location'}
          placeholder={'Batch Location'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Batch Location',
              Data: form.batchLocationList,
              selectedData: form.batchLocation,

              setSelectedData: async (data: any) => {
                // These MUST be INSIDE the function, or else centre undefined रहेगा
                const centre = form.bipardLocation?.name;
                const trainingId = item?.trainingNameId;

                // Update form values
                setForm((prev: any) => ({
                  ...prev,
                  batchLocation: data,
                  batchSubLocation: {},
                  batchSubLocationList: [],
                }));

                setErrors({ ...errors, 'batchLocation.name': '' });

                // Call Sub-location API only if both exist
                if (centre && trainingId) {
                  await getTrainingBatchSubLocation(
                    trainingId,
                    centre,
                    data.id, // selected batch location id
                    item,
                  );
                }
              },

              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.batchLocation?.name}
          isMandatory
          errorMessage={errors['batchLocation.name']}
        />

        <DropDownOrganism
          label={'Batch Sub Location'}
          placeholder={'Batch Sub Location'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Batch Sub Location',
              Data: form.batchSubLocationList,
              selectedData: form.batchSubLocation,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  batchSubLocation: data,
                }));

                setErrors({ ...errors, 'batchSubLocation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.batchSubLocation?.name}
          isMandatory
          errorMessage={errors['batchSubLocation.name']}
        />

        <TextInputOrganisms
          label={'Coordinator'}
          placeholder={'Coordinator'}
          ref={input5_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.coordinator}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('coordinator', val);
            setErrors({ ...errors, coordinator: '' });
          }}
          isMandatory
          errorMessage={errors.coordinator}
          disabled
          editable={false}
        />

        <DropDownOrganism
          label={'Admin'}
          placeholder={'Admin'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Admin',
              Data: form.adminList,
              selectedData: form.admin,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  admin: data,
                }));

                setErrors({ ...errors, 'admin.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.admin?.name}
          isMandatory
          errorMessage={errors['admin.name']}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={'Update'} />
    </SafeAreaView>
  );
};

export default EditBatchDetails;

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
});
