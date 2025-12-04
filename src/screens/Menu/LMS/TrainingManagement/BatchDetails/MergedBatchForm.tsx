import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, screensName, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import {
  isNullUndefined,
  normalizeNumber,
} from '../../../../../utils/CommonFunction';
import DateInputOrganism from '../../../../../components/organisms/DateInputOrganism';
import { useCommonDropdownListMutation } from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import {
  useListTraineeDetailsMutation,
  useMergeTrainingBatchDetailsMutation,
  useUpdateTrainingBatchDetailsMutation,
} from '../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const MergedBatchForm = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();

  const [updateTrainingBatchDetailsApi] =
    useUpdateTrainingBatchDetailsMutation();
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listTraineeDetailsApi] = useListTraineeDetailsMutation();
  const [mergeTrainingBatchDetailsApi] = useMergeTrainingBatchDetailsMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Merge Batch Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    from_batch_no: '',
    noOfCandidateToBeMerged: '',
    to_bacthNoList: [],
    to_bacthNo: {},
    remainingSeat: '',
    noOfCandidateInToBatch: '',
    noOfCandidateTrnasferList: [],
    noOfCandidateTrnasfer: {},
    currentTotalNoOfBatch: '',
    noOfCandidateTrnasferSelected: [],
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

      from_batch_no: item.batchNo,
    }));

    loadAllEditApis(selectedLocation, item);
  }, [item]);

  const loadAllEditApis = async (location: any, item: any) => {
    if (!location?.id) return;

    await get_merge_batch_details_no_of_candidate_to_be_merge(location.name);

    await getTraineeList(location.name);
    await get_Batch_details_to_batch_no(location.name);
    await get_merge_batch_details_no_of_candidates_in_to_batch(location.name);
  };

  const onSubmit = () => {
    try {
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
      from_batch_no: form.from_batch_no,
      to_batch_no: form.to_bacthNo?.id,
      trainees: form.noOfCandidateTrnasferSelected.map((t: any) => t.id),
      selectFormat: '',
      noOfCandidatesToBatch: Number(form.noOfCandidateInToBatch),
      noOfCandidatesToTransferred: form.noOfCandidateTrnasferSelected.length,
      totalNoOfBatch: form.currentTotalNoOfBatch?.toString(),
      noOfCandidatesToMerge: Number(form.noOfCandidateToBeMerged),
      remainingSeat: Number(form.remainingSeat),
    };

    mergeTrainingBatchDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: screensName.BatchDetailsList }],
          }),
        );

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

  const get_merge_batch_details_no_of_candidate_to_be_merge = async (
    centre: any,
  ) => {
    setLoader(true);

    const params = {
      listType: 'merge_batch_details_no_of_candidate_to_be_merge',
      bipardCentre: [centre],
      replacements: [item.id],
    };

    try {
      const res: any = await commonDropdownApi(params).unwrap();
      const list = res.data[0]?.noOfCandidateToBeMerged || [];

      setValue('noOfCandidateToBeMerged', list);
      setValue('noOfCandidateInToBatch', list);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message,
      });
    } finally {
      setLoader(false);
    }
  };

  const getTraineeList = async (centre: any) => {
    setLoader(true);

    const params = {
      search: '',
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: ['batchNoId', '=', item.id],
      pageNo: 1,
      itemsPerPage: null,
      isCourseActive: true,
    };

    try {
      const res: any = await listTraineeDetailsApi(params).unwrap();
      setValue('noOfCandidateTrnasferList', res.data.data || []);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message,
      });
    } finally {
      setLoader(false);
    }
  };

  const get_Batch_details_to_batch_no = async (centre: any) => {
    setLoader(true);

    const params = {
      listType: 'batch_details_to_batch_no',
      bipardCentre: [centre],
      replacements: ['%%', item.id, item.id],
    };

    try {
      const res: any = await commonDropdownApi(params).unwrap();
      const list = res.data || [];

      setValue('to_bacthNoList', list);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message,
      });
    } finally {
      setLoader(false);
    }
  };
  const get_merge_batch_details_no_of_candidates_in_to_batch = async (
    centre: any,
  ) => {
    setLoader(true);

    const params = {
      listType: 'merge_batch_details_no_of_candidates_in_to_batch',
      bipardCentre: [centre],
      replacements: [item.id],
    };

    try {
      const res: any = await commonDropdownApi(params).unwrap();
      const list = res.data[0]?.noOfCandidatesInToBatch || [];

      setValue('currentTotalNoOfBatch', list);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message,
      });
    } finally {
      setLoader(false);
    }
  };

  const isFormValid =
    !isNullUndefined(form.from_batch_no) &&
    !isNullUndefined(form.noOfCandidateToBeMerged) &&
    !isNullUndefined(form.to_bacthNo?.id) &&
    form.noOfCandidateTrnasferSelected?.length > 0;

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
        <TextInputOrganisms
          label={'From (Batch No)'}
          placeholder={'From (Batch No)'}
          ref={input1_ref}
          value={form.from_batch_no + ''}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {}}
          isMandatory
          disabled
          editable={false}
        />
        <TextInputOrganisms
          label={'No of candidates to be merged'}
          placeholder={'From (Batch No)'}
          ref={input1_ref}
          value={form.noOfCandidateToBeMerged + ''}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {}}
          isMandatory
          disabled
          editable={false}
        />

        <DropDownOrganism
          label={'To (Batch No)'}
          placeholder={'To (Batch No)'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'To (Batch No)',
              Data: form.to_bacthNoList,
              selectedData: form.to_bacthNo,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  to_bacthNo: data,
                  remainingSeat: data.remainingSeat,
                }));

                setErrors({ ...errors, 'to_bacthNo.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.to_bacthNo?.name}
          isMandatory
          errorMessage={errors['batchSubLocation.name']}
        />
        <TextInputOrganisms
          label={'Remaining seats'}
          placeholder={'Remaining seats'}
          ref={input1_ref}
          value={form.remainingSeat + ''}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {}}
          isMandatory
          disabled
          editable={false}
        />

        <TextInputOrganisms
          label={'No of candidates in (to) batch'}
          placeholder={'No of candidates in (to) batch'}
          ref={input1_ref}
          value={form.noOfCandidateInToBatch + ''}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {}}
          isMandatory
          disabled
          editable={false}
        />

        <DropDownOrganism
          label={'No of candidates to be transferred'}
          placeholder={'No of candidates to be transferred'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'List',
              Data: form.noOfCandidateTrnasferList,
              selectedData: form.noOfCandidateTrnasfer,

              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  noOfCandidateTrnasferSelected: [
                    ...(prev.noOfCandidateTrnasferSelected || []),
                    data,
                  ],

                  noOfCandidateTrnasferList:
                    prev.noOfCandidateTrnasferList.filter(
                      (item: any) => item.id !== data.id,
                    ),
                }));
              },

              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.noOfCandidateTrnasfer?.name}
          isMandatory
          errorMessage={errors['noOfCandidateTrnasfer.name']}
        />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: vw(328),
            alignSelf: 'center',
          }}
        >
          {form.noOfCandidateTrnasferSelected?.map(
            (candidate: any, index: number) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: vw(14),
                  paddingVertical: vh(6),
                  paddingHorizontal: vh(14),
                  marginRight: vw(8),
                  borderWidth: vw(1),
                  borderColor: colors.primary,
                  marginTop: vh(5),
                  marginBottom: vh(5),
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: vw(12),
                    marginRight: vw(8),
                  }}
                >
                  {candidate.name}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    // Remove from selected & return back to list
                    setForm((prev: any) => ({
                      ...prev,
                      noOfCandidateTrnasferSelected:
                        prev.noOfCandidateTrnasferSelected.filter(
                          (c: any) => c.id !== candidate.id,
                        ),
                      noOfCandidateTrnasferList: [
                        ...prev.noOfCandidateTrnasferList,
                        candidate,
                      ],
                    }));
                  }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ),
          )}
        </View>

        <TextInputOrganisms
          label={'Current total of to batch'}
          placeholder={'Current total of to batch'}
          ref={input1_ref}
          value={form.currentTotalNoOfBatch + ''}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {}}
          isMandatory
          disabled
          editable={false}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism
        onPress={onSubmit}
        bttnText={'submit'}
        isDisabled={!isFormValid}
      />
    </SafeAreaView>
  );
};

export default MergedBatchForm;

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
