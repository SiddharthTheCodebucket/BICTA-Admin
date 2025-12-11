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
import { colors, strings, vh, vw } from '../../../../../../../constants';
import { NavigationType } from '../../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../../components/organisms/FullscreenLoading';
import ViewAtom from '../../../../../../../components/atoms/ViewAtom';
import ImageUploadOrganism from '../../../../../../../components/organisms/ImageUploadOrganism';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../../../../../hooks';
import {
  saveCourseDesc,
  saveCourseThumbnail,
  removeHostelItem,
  addHostelItem,
} from '../../../../../../../features/TrainingManagement/trainingManagementSlice';
import moment from 'moment';
import { useUpdateTrainingDetailsMutation } from '../../../../../../../injectEndpoints/lmsEndpoints';
import TextAtom from '../../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../../components/atoms/TouchableAtom';
import { isNullUndefined } from '../../../../../../../utils/CommonFunction';

interface Props {
  route: any;
  navigation: NavigationType;
  goNext: any;
  goBack: any;
}

const DescAndHostel = (props: Props) => {
  const { navigation, goBack, goNext } = props;
  const item = props.route?.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const dispatch = useDispatch();
  const [updateTrainingDetailsApi] = useUpdateTrainingDetailsMutation();

  const {
    bipardLocation,
    trainingCategoryList,
    trainingCategory,
    budget,
    budgetList,
    training,
    trainingList,
    trainingFullName,
    trainingShortName,
    trainingStartDate,
    trainingEndDate,
    trainingType,
    trainingFee,
    natureOfCourse,
    noOfParticipants,
    parentDepartmentList,
    parentDepartment,
    noOfSectionAndBatches,
    status,
    courseThumbnail,
    courseDesc,
    hostel,
    courseCoordinator,
    youngProfessional,
    courseLetter,
    trainingTeamLocations,
    hostelList,
  } = useAppSelector(state => state.TrainingManagement);
  const [loader, setLoader] = useState(false);

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!item) return;

    // Description
    if (item.description) {
      dispatch(saveCourseDesc(item.description));
    }

    // Thumbnail
    if (item.thumbnail) {
      dispatch(
        saveCourseThumbnail({
          uri: item.thumbnail,
          fileName: 'thumb.jpg',
          type: 'image/jpeg',
          url: item.thumbnail,
        }),
      );
    }

    if (Array.isArray(item.hostelAllocationOrderId)) {
      const selectedHostels = item.hostelAllocationOrderId.map(
        (id: any, index: number) => ({
          id,
          name: item.hostelAllocationOrder[index],
        }),
      );
      dispatch(addHostelItem(selectedHostels));
      // selectedHostels.forEach((h: any) => {
      //   dispatch(removeHostelItem(h.id));
      // });
    }
  }, [item]);

  const form = {
    courseDesc,
    hostel,
  };
  const schema = Yup.object().shape({
    hostel: Yup.array()
      .min(1, 'Hostel is required')
      .required('Hostel is required'),
    courseDesc: Yup.string().required('Course description is required'),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      updateTrainingDetails();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const updateTrainingDetails = () => {
    setLoader(true);

    const formData = new FormData();

    const appendIfValid = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    };

    appendIfValid('bipardCentre', JSON.stringify([bipardLocation?.name]));
    appendIfValid('training_category', trainingCategory?.categoryId);
    appendIfValid('is_budget_training', budget?.id);

    appendIfValid('budget_training_id', null);

    appendIfValid('training_full_name', trainingFullName);
    appendIfValid('training_short_name', trainingShortName);

    appendIfValid(
      'course_start_date',
      moment(trainingStartDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );

    appendIfValid(
      'course_end_date',
      moment(trainingEndDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );

    appendIfValid(
      'hostel_allocation_order',
      JSON.stringify(hostel.map((h: any) => Number(h.id))),
    );

    appendIfValid('training_type', trainingType?.id);
    appendIfValid('training_fee', trainingFee?.id);
    appendIfValid('fee_amount', '');
    appendIfValid('nature_of_course', natureOfCourse?.id);
    appendIfValid('no_of_participants', noOfParticipants);
    appendIfValid('parent_department', parentDepartment?.name);
    appendIfValid('no_of_sections', noOfSectionAndBatches);
    appendIfValid('status', status?.id);
    appendIfValid('description', courseDesc);

    if (courseThumbnail?.uri) {
      formData.append('thumbnail', {
        uri: courseThumbnail.uri,
        name: courseThumbnail.fileName || 'thumb.jpg',
        type: courseThumbnail.type || 'image/jpeg',
      });
    }

    if (courseLetter?.uri) {
      formData.append('letter', {
        uri: courseLetter.uri,
        name: courseLetter.fileName || 'letter.jpg',
        type: courseLetter.type || 'image/jpeg',
      });
    }

    appendIfValid('course_coordinator', courseCoordinator?.id);
    appendIfValid('young_professional', youngProfessional?.id);

    appendIfValid('course_location', null);
    appendIfValid('course_sub_location', null);
    const formattedLocation = {
      locations: !isNullUndefined(trainingTeamLocations)
        ? trainingTeamLocations.map((loc: any) => ({
            courseLocation: loc.courseLocation,
            courseSubLocation: loc.courseSubLocation,
          }))
        : [],
    };

    appendIfValid('location', JSON.stringify(formattedLocation));

    appendIfValid('course_id', item?.id);
    appendIfValid('course_id_update', item?.id);

    updateTrainingDetailsApi(formData)
      .unwrap()
      .then(res => {
        goNext();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch(err => {
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
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <ImageUploadOrganism
          label={'Course Thumbnail'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            dispatch(saveCourseThumbnail(file));
          }}
          defaultImage={courseThumbnail?.url}
        />

        <TextInputOrganisms
          label={'Course Description'}
          placeholder={'Course Description'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={courseDesc}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            dispatch(saveCourseDesc(val));
            setErrors({ ...errors, courseDesc: '' });
          }}
          isMandatory
          errorMessage={errors.courseDesc}
        />

        <DropDownOrganism
          label={'Hostel Sequence'}
          placeholder={'Hostel Sequence'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Hostel Sequence',
              Data: hostelList,
              selectedData: hostel,
              setSelectedData: (item: any) => {
                dispatch(addHostelItem(item));
                setErrors({ ...errors, hostel: '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={hostel?.name}
          isMandatory
          errorMessage={errors.hostel}
        />
        {hostel.length >= 0 && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              width: vw(328),
              alignSelf: 'center',
              marginTop: vh(5),
            }}
          >
            {hostel?.map((hostel: any, index: number) => (
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
                  {hostel.name}
                </Text>

                <TouchableOpacity
                  onPress={() => dispatch(removeHostelItem(hostel.id))}
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
            ))}
          </View>
        )}

        {/* 
        <DropDownOrganism
          label={'Hostel Sequence'}
          placeholder={'Hostel Sequence'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Hostel Sequence',
              Data: hostelList,
              selectedData: hostel,
              setSelectedData: (data: any) => {
                dispatch(saveHostel(data));
                setErrors({ ...errors, 'hostel.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={hostel?.name}
          isMandatory
          errorMessage={errors['hostel.id']}
        /> */}
        {/* <ViewAtom
          style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}
        >
          {hostel?.map((item: any) => (
            <ViewAtom
              key={item.id}
              style={{
                flexDirection: 'row',
                backgroundColor: colors.lightGrey,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <TextAtom>{item.name}</TextAtom>

              <TouchableAtom
                onPress={() => dispatch(removeHostelItem(item.id))}
                style={{ marginLeft: 6 }}
              >
                <TextAtom style={{ color: 'red', fontWeight: 'bold' }}>
                  ×
                </TextAtom>
              </TouchableAtom>
            </ViewAtom>
          ))}
        </ViewAtom> */}
      </KeyboardAwareScrollView>
      <ViewAtom style={styles.footer}>
        <ButtonOrganism
          containerStyle={{ width: vw(155) }}
          bttnText="Back"
          onPress={goBack}
        />

        <ButtonOrganism
          containerStyle={{ width: vw(155) }}
          bttnText="Next"
          onPress={onSubmit}
        />
      </ViewAtom>
    </SafeAreaView>
  );
};

export default DescAndHostel;

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
  footer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
});
