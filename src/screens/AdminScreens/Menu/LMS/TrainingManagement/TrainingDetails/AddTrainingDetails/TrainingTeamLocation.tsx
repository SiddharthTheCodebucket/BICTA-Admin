import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../../constants';

import { NavigationType } from '../../../../../../../components/organisms/HeaderOrganism';
import DropDownOrganism from '../../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../../components/organisms/FullscreenLoading';

import ViewAtom from '../../../../../../../components/atoms/ViewAtom';
import ImageUploadOrganism from '../../../../../../../components/organisms/ImageUploadOrganism';

import { useAppSelector } from '../../../../../../../hooks';
import { useDispatch } from 'react-redux';

import {
  saveCourseCoordinator,
  saveCourseLetter,
  saveYoungProfessional,
  saveCourseLocation,
  saveCourseSubLocation,
  saveTrainingTeamLocations,
  saveCourseSubLocationList,
} from '../../../../../../../features/TrainingManagement/trainingManagementSlice';

import { useCommonDropdownListMutation } from '../../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import TextAtom from '../../../../../../../components/atoms/TextAtom';
import moment from 'moment';
import { useUpdateTrainingDetailsMutation } from '../../../../../../../injectEndpoints/lmsEndpoints';
import { isNullUndefined } from '../../../../../../../utils/CommonFunction';

interface Props {
  route: any;
  navigation: NavigationType;
  goBack: any;
  goNext: any;
}

const TrainingTeamLocation = (props: Props) => {
  const { navigation, goBack, goNext } = props;
  const item = props.route?.params?.item;
  const dispatch = useDispatch();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [updateTrainingDetailsApi] = useUpdateTrainingDetailsMutation();
  const [loader, setLoader] = useState(false);

  const {
    bipardLocation,
    trainingCategory,
    budget,
    trainingFullName,
    trainingShortName,
    trainingStartDate,
    trainingEndDate,
    trainingType,
    trainingFee,
    natureOfCourse,
    noOfParticipants,
    parentDepartment,
    noOfSectionAndBatches,
    status,
    courseThumbnail,
    courseDesc,
    hostel,
    courseCoordinatorList,
    courseCoordinator,
    youngProfessionalList,
    youngProfessional,
    courseLocationList,
    courseLocation,
    courseSubLocation,
    courseSubLocationList,
    courseLetter,
    trainingTeamLocations,
  }: any = useAppSelector(state => state.TrainingManagement);

  const [tempCourseLocation, setTempCourseLocation] = useState<any>(null);
  const [tempCourseSubLocation, setTempCourseSubLocation] = useState<any>(null);

  const [errors, setErrors] = useState<any>({});

  // 🔥 EDIT MODE PREFILL
  useEffect(() => {
    const item = props.route?.params?.item;
    if (!item) return;

    // Coordinator
    if (item.courseCoordinatorId && item.courseCoordinator) {
      dispatch(
        saveCourseCoordinator({
          id: item.courseCoordinatorId,
          name: item.courseCoordinator,
        }),
      );
    }

    // Young professional
    if (item.youngProfessionalId && item.youngProfessional) {
      dispatch(
        saveYoungProfessional({
          id: item.youngProfessionalId,
          name: item.youngProfessional,
        }),
      );
    }

    // Training Team Location (multiple)
    if (Array.isArray(item.courseLocation)) {
      const locations = item.courseLocation.map(
        (locId: any, index: number) => ({
          courseLocation: {
            id: item.courseLocation[index],
            name: courseLocationList?.find(
              (x: any) => x.id == item.courseLocation[index],
            )?.name,
          },
          courseSubLocation: {
            id: item.courseSubLocation[index],
            name: courseSubLocationList?.find(
              (x: any) => x.id == item.courseSubLocation[index],
            )?.name,
          },
        }),
      );

      dispatch(saveTrainingTeamLocations(locations));
    }

    // Course Letter
    if (item.letter) {
      dispatch(
        saveCourseLetter({
          uri: item.letter,
          url: item.letter,
        }),
      );
    }
  }, [props.route?.params?.item]);

  const getCourseSubLocation = (id: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [bipardLocation?.name],
      listType: 'course_sub_location',
      replacements: ['%%', id],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveCourseSubLocationList(res.data));
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({ type: 'error', text2: err.data.message });
      });
  };
  const schema = Yup.object().shape({
    courseSubLocation:
      trainingTeamLocations?.length >= 1
        ? Yup.mixed().notRequired()
        : Yup.object({
            id: Yup.string().required('Course sub location is required'),
          }),
    courseLocation:
      trainingTeamLocations?.length >= 1
        ? Yup.mixed().notRequired()
        : Yup.object({
            id: Yup.string().required('Course location is required'),
          }),

    youngProfessional: Yup.object({
      id: Yup.string().required('Young professional is required'),
    }),

    courseCoordinator: Yup.object({
      id: Yup.string().required('Course coordinator is required'),
    }),
  });

  const form = {
    courseCoordinator,
    youngProfessional,
    courseLocation,
    courseSubLocation,
    trainingTeamLocations,
  };

  const onAddTeamLocation = () => {
    if (!tempCourseLocation || !tempCourseSubLocation) {
      setErrors({
        addError: 'Please select both Course Location and Course Sub Location',
      });
      return;
    }

    setErrors({});

    const newItem = {
      courseLocation: tempCourseLocation,
      courseSubLocation: tempCourseSubLocation,
    };

    dispatch(saveTrainingTeamLocations([...trainingTeamLocations, newItem]));

    setTempCourseLocation(null);
    setTempCourseSubLocation(null);
    dispatch(saveCourseLocation({}));
    dispatch(saveCourseSubLocation({}));
  };

  const removeItem = (index: number) => {
    const arr = [...trainingTeamLocations];
    arr.splice(index, 1);
    dispatch(saveTrainingTeamLocations(arr));
  };

  const onSubmit = async () => {
    try {
      schema.validateSync(form);
      addTrainingDetails();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addTrainingDetails = () => {
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
      JSON.stringify(
        hostel && hostel.length > 0 ? hostel.map((h: any) => Number(h.id)) : [],
      ),
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

    let combined = [];

    if (tempCourseLocation && tempCourseSubLocation) {
      combined.push({
        courseLocation: tempCourseLocation.id,
        courseSubLocation: tempCourseSubLocation.id,
      });
    }

    trainingTeamLocations.forEach((item: any) => {
      combined.push({
        courseLocation: item.courseLocation.id,
        courseSubLocation: item.courseSubLocation.id,
      });
    });

    // Unique array
    const mapKey = new Set();
    const uniqueLocations: any = [];

    combined.forEach(loc => {
      const k = `${loc.courseLocation}-${loc.courseSubLocation}`;
      if (!mapKey.has(k)) {
        mapKey.add(k);
        uniqueLocations.push(loc);
      }
    });

    appendIfValid('location', JSON.stringify(uniqueLocations));

    appendIfValid('course_id', item?.id);
    appendIfValid('course_id_update', item?.id);

    updateTrainingDetailsApi(formData)
      .unwrap()
      .then(res => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: screensName.TrainingDetails }],
          }),
        );
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
        <DropDownOrganism
          label={'Course Coordinator'}
          placeholder={'Course Coordinator'}
          onPress={() =>
            navigation.navigate('DropDownModal', {
              name: 'Course Coordinator',
              Data: courseCoordinatorList,
              selectedData: courseCoordinator,
              setSelectedData: (data: any) => {
                dispatch(saveCourseCoordinator(data));
                setErrors({ ...errors, 'courseCoordinator.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            })
          }
          inputText={courseCoordinator?.name}
          isMandatory
          errorMessage={errors['courseCoordinator.id']}
        />

        <DropDownOrganism
          label={'Young Professional'}
          placeholder={'Young Professional'}
          onPress={() =>
            navigation.navigate('DropDownModal', {
              name: 'Young Professional',
              Data: youngProfessionalList,
              selectedData: youngProfessional,
              setSelectedData: (data: any) => {
                dispatch(saveYoungProfessional(data));
                setErrors({ ...errors, 'youngProfessional.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            })
          }
          inputText={youngProfessional?.name}
          isMandatory
          errorMessage={errors['youngProfessional.id']}
        />

        <DropDownOrganism
          label={'Course Location'}
          placeholder={'Course Location'}
          onPress={() =>
            navigation.navigate('DropDownModal', {
              name: 'Course Location',
              Data: courseLocationList,
              selectedData: courseLocation,
              setSelectedData: (data: any) => {
                setTempCourseLocation(data);
                dispatch(saveCourseLocation(data));
                getCourseSubLocation(data.id);
                setErrors({ ...errors, 'courseLocation.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            })
          }
          inputText={courseLocation?.name}
          isMandatory
          errorMessage={errors['courseLocation.id']}
        />

        <DropDownOrganism
          label={'Course Sub Location'}
          placeholder={'Course Sub Location'}
          onPress={() =>
            navigation.navigate('DropDownModal', {
              name: 'Course Sub Location',
              Data: courseSubLocationList,
              selectedData: courseSubLocation,
              setSelectedData: (data: any) => {
                setTempCourseSubLocation(data);
                dispatch(saveCourseSubLocation(data));
                setErrors({ ...errors, 'courseSubLocation.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            })
          }
          inputText={courseSubLocation?.name}
          isMandatory
          errorMessage={errors['courseSubLocation.id']}
        />

        {errors.addError && (
          <TextAtom
            numberOfLines={0}
            style={{
              color: colors.red,
              fontFamily: fonts.Roboto_Regular,
              fontSize: vw(12),
            }}
          >
            {errors.addError}
          </TextAtom>
        )}

        <ButtonOrganism
          containerStyle={{
            width: vw(150),
            alignSelf: 'flex-start',
            marginBottom: vh(10),
          }}
          bttnText="+ Add"
          onPress={onAddTeamLocation}
        />

        {trainingTeamLocations.map((item: any, index: number) => (
          <ViewAtom
            key={index}
            style={{
              width: vw(320),
              backgroundColor: colors.white,
              marginBottom: vh(10),
              borderRadius: vw(10),
              flexDirection: 'row',
              justifyContent: 'space-between',
              elevation: 2,
              paddingHorizontal: vh(10),
              paddingVertical: vh(6),
              alignSelf: 'center',
            }}
          >
            <ViewAtom>
              <TextAtom
                style={{
                  color: colors.black,
                  fontFamily: fonts.Roboto_Regular,
                  fontSize: vw(12),
                }}
              >
                Location: {item.courseLocation.name}
              </TextAtom>
              <TextAtom
                style={{
                  color: colors.black,
                  fontFamily: fonts.Roboto_Regular,
                  fontSize: vw(12),
                }}
              >
                Sub Location: {item.courseSubLocation.name}
              </TextAtom>
            </ViewAtom>
            <ButtonOrganism
              bttnText="Remove"
              containerStyle={{
                width: vw(60),
                backgroundColor: colors.red,
                height: vh(20),
              }}
              onPress={() => removeItem(index)}
              bttnTextStyle={{ fontSize: vw(8) }}
            />
          </ViewAtom>
        ))}

        <ImageUploadOrganism
          label={'Course Letter'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => dispatch(saveCourseLetter(file))}
          defaultImage={courseLetter?.url}
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
          bttnText="Submit"
          onPress={onSubmit}
        />
      </ViewAtom>
    </SafeAreaView>
  );
};

export default TrainingTeamLocation;

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
