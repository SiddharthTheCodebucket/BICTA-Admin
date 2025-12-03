import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, strings, vh, vw } from '../../../../../../constants';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../../../../hooks';
import {
  saveCourseDesc,
  saveCourseThumbnail,
  saveHostel,
} from '../../../../../../features/TrainingManagement/trainingManagementSlice';
import moment from 'moment';
import { useUpdateTrainingDetailsMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

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

    // Hostel selected value prefill
    if (Array.isArray(item.hostelAllocationOrderId)) {
      dispatch(
        saveHostel({
          id: item.hostelAllocationOrderId[0],
          name: item.hostelAllocationOrder[0],
        }),
      );
    }
  }, [item]);

  const form = {
    courseDesc,
    hostel,
  };
  const schema = Yup.object().shape({
    hostel: Yup.object({
      id: Yup.string().required('Hostel sequence is required'),
    }),
    courseDesc: Yup.string().required('Course description is required'),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateTrainingDetails();
      } else {
        addTrainingDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };
  const addTrainingDetails = () => {
    setLoader(true);

    const formData = new FormData();

    formData.append('bipardCentre', bipardLocation.name);
    formData.append('training_category', trainingCategory.categoryId);
    formData.append('is_budget_training', budget.id);
    formData.append('budget_training_id', null);

    formData.append(
      'training_full_name',
      trainingFullName ? trainingFullName : '',
    );
    formData.append(
      'training_short_name',
      trainingShortName ? trainingShortName : '',
    );

    formData.append(
      'course_start_date',
      moment(trainingStartDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formData.append(
      'course_end_date',
      moment(trainingEndDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );

    formData.append('hostel_allocation_order', [hostel.id]);
    formData.append('training_type', trainingType.id);
    formData.append('training_fee', trainingFee.id);
    formData.append('fee_amount', '');
    formData.append('nature_of_course', natureOfCourse.id);
    formData.append('no_of_participants', noOfParticipants);
    formData.append('parent_department', parentDepartment.name);
    formData.append('no_of_sections', noOfSectionAndBatches);
    formData.append('status', status.id);
    formData.append('description', courseDesc);

    if (courseThumbnail?.uri) {
      formData.append('thumbnail', {
        uri: courseThumbnail.uri,
        name: courseThumbnail.fileName || 'thumb.jpg',
        type: courseThumbnail.type || 'image/jpeg',
      });
    }

    formData.append('course_coordinator', null);

    formData.append('young_professional', null);

    formData.append('course_location', 0);
    formData.append('course_sub_location', 0);

    formData.append('letter', null);

    formData.append('course_id', '');
    formData.append('course_id_update', null);

    updateTrainingDetailsApi(formData)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });

        goNext();
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

  const updateTrainingDetails = () => {
    setLoader(true);

    const formData = new FormData();

    formData.append('bipardCentre', bipardLocation.name);
    formData.append('training_category', trainingCategory.categoryId);
    formData.append('is_budget_training', budget.id);
    formData.append('budget_training_id', null);

    formData.append(
      'training_full_name',
      trainingFullName ? trainingFullName : '',
    );
    formData.append(
      'training_short_name',
      trainingShortName ? trainingShortName : '',
    );

    formData.append(
      'course_start_date',
      moment(trainingStartDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formData.append(
      'course_end_date',
      moment(trainingEndDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );

    formData.append('hostel_allocation_order', [hostel.id]);
    formData.append('training_type', trainingType.id);
    formData.append('training_fee', trainingFee.id);
    formData.append('fee_amount', '');
    formData.append('nature_of_course', natureOfCourse.id);
    formData.append('no_of_participants', noOfParticipants);
    formData.append('parent_department', parentDepartment.name);
    formData.append('no_of_sections', noOfSectionAndBatches);
    formData.append('status', status.id);
    formData.append('description', courseDesc);

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

    formData.append('course_coordinator', courseCoordinator.id);

    formData.append('young_professional', youngProfessional.id);

    formData.append('course_location', 0);
    formData.append('course_sub_location', 0);

    formData.append('location', JSON.stringify(trainingTeamLocations));

    formData.append('letter', null);

    formData.append('course_id', '');
    formData.append('course_id_update', null);

    updateTrainingDetailsApi(formData)
      .unwrap()
      .then((res: any) => {
        goNext();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
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
        />
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
