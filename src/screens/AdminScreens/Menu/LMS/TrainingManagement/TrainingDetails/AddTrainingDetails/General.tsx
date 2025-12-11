import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, screensName, vh, vw } from '../../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../../components/organisms/FullscreenLoading';
import DateInputOrganism from '../../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import RadioSelectableOrganism from '../../../../../../../components/organisms/RadioSelectableOrganism';
import { useAppSelector } from '../../../../../../../hooks';
import { useDispatch } from 'react-redux';
import {
  saveBipardLocation,
  saveBudget,
  saveBudgetList,
  saveCourseCoordinatorList,
  saveCourseLocationList,
  saveHostelList,
  saveNatureOfCourse,
  saveNoOfParticipants,
  saveNoOfSectionAndBatches,
  saveParentDepartment,
  saveParentDepartmentList,
  saveStatus,
  saveTraining,
  saveTrainingCategory,
  saveTrainingCategoryList,
  saveTrainingEndDate,
  saveTrainingFee,
  saveTrainingFullName,
  saveTrainingList,
  saveTrainingShortName,
  saveTrainingStartDate,
  saveTrainingType,
  saveYoungProfessionalList,
} from '../../../../../../../features/TrainingManagement/trainingManagementSlice';
import { useCommonDropdownListMutation } from '../../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  isNullUndefined,
  normalizeNumber,
} from '../../../../../../../utils/CommonFunction';
import {
  useAddTrainingDetailsMutation,
  useUpdateTrainingDetailsMutation,
} from '../../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
  goNext: any;
}

const General = (props: Props) => {
  const { navigation, goNext } = props;
  const item = props.route?.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const dispatch = useDispatch();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addTrainingDetailsApi] = useAddTrainingDetailsMutation();
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
  } = useAppSelector(state => state.TrainingManagement);

  const form = {
    bipardLocation,
    trainingCategory,
    budget,
    training,
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
  };

  const [loader, setLoader] = useState(false);

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!item) return;

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId];
    if (!selectedLocation) return;

    dispatch(saveBipardLocation(selectedLocation));

    // budget mapping if yes
    if (item.isBudgetTraining === 'Yes') {
      getBudgetMapping(selectedLocation.name);
    }

    // load all dependent lists
    loadAllDropdowns(selectedLocation.name);
  }, [item]);

  const loadAllDropdowns = async (name: string) => {
    setLoader(true);
    try {
      await Promise.all([
        getTrainingCategory(name),
        getHostelName(name),
        getCourseLocation(name),
        getCourseCoordinator(name),
        getYoungProfessional(name),
        getBudgetList(name),
        getTrainingDepartmentList(name),
      ]);
      setLoader(false);
    } catch (err) {
      setLoader(false);
    }
  };

  const schema = Yup.object().shape({
    status: Yup.object({
      id: Yup.string().required('Status is required'),
    }),

    noOfSectionAndBatches: Yup.string()
      .required('No of section & batches is required')
      .matches(/^[0-9]+$/, 'Only numbers allowed'),

    parentDepartment: Yup.object({
      name: Yup.string().required('Parent department is required'),
    }),

    noOfParticipants: Yup.string()
      .required('No. of participants is required')
      .matches(/^[0-9]+$/, 'Only numbers allowed'),

    natureOfCourse: Yup.object({
      id: Yup.string().required('Nature of course is required'),
    }),

    trainingFee: Yup.object({
      id: Yup.string().required('Training fee is required'),
    }),

    trainingType: Yup.object({
      id: Yup.string().required('Training type is required'),
    }),

    trainingEndDate: Yup.string()
      .required('Training end date is required')
      .test(
        'is-greater',
        'End date must be after start date',
        function (value) {
          const { trainingStartDate } = this.parent;
          if (!trainingStartDate || !value) return true;
          return (
            moment(value, 'DD-MM-YYYY').toDate() >=
            moment(trainingStartDate, 'DD-MM-YYYY').toDate()
          );
        },
      ),

    trainingStartDate: Yup.string().required('Training start date is required'),

    trainingShortName: Yup.string().required('Training short name is required'),

    trainingFullName: Yup.string().required('Training full name is required'),

    training:
      budget?.id === 'Yes'
        ? Yup.object({
            id: Yup.string().required('Training is required'),
          })
        : Yup.mixed().notRequired(),

    budget: Yup.object({
      id: Yup.string().required('Budget selection is required'),
    }),

    trainingCategory: Yup.object({
      categoryId: Yup.string().required('Training Category is required'),
    }),
    bipardLocation: Yup.object({
      id: Yup.string().required('Bipard location is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateTrainingDetails();
      } else {
        addTrainingDetails();
      }

      // goNext();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const getTrainingCategory = (name: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [name],
      listType: 'training_category',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveTrainingCategoryList(res.data));
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

  const getHostelName = (name: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [name],
      listType: 'filter_hostel_name_for_bed_details',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveHostelList(res.data));
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

  const getCourseCoordinator = (name: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [name],
      listType: 'select_course_coordinator',
      replacements: [],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveCourseCoordinatorList(res.data));
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
  const getCourseLocation = (name: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [name],
      listType: 'course_location',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveCourseLocationList(res.data));
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
  const getYoungProfessional = (name: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [name],
      listType: 'select_young_professional',
      replacements: [],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveYoungProfessionalList(res.data));
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

  const getBudgetList = (name: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [name],
      listType: 'select_is_budget_and_lms_training',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveBudgetList(res.data));
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
  const getTrainingDepartmentList = (name: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [name],
      listType: 'training_department',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveParentDepartmentList(res.data));
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

  const getBudgetMapping = (name: string) => {
    setLoader(true);
    const params = {
      bipardCentre: [name],
      listType: 'select_budget_training_details_for_mapping',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(saveTrainingList(res.data));
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
  const addTrainingDetails = () => {
    setLoader(true);
    const params = {
      bipardCentre: [bipardLocation.name],
      training_category: trainingCategory.categoryId,
      is_budget_training: budget.id,
      budget_training_id: null,
      training_full_name: trainingFullName,
      training_short_name: trainingShortName,
      course_start_date: moment(trainingStartDate, 'DD-MM-YYYY').format(
        'YYYY-MM-DD',
      ),
      course_end_date: moment(trainingEndDate, 'DD-MM-YYYY').format(
        'YYYY-MM-DD',
      ),
      hostel_allocation_order: [],
      training_type: trainingType.id,
      training_fee: trainingFee.id,
      fee_amount: '',
      nature_of_course: natureOfCourse.id,
      no_of_participants: noOfParticipants,
      parent_department: parentDepartment.name,
      no_of_sections: noOfSectionAndBatches,
      status: status.id,
      description: '',
      thumbnail: '',
      course_coordinator: '',
      young_professional: '',
      location: '',
      course_location: '',
      course_sub_location: '',
      letter: '',
      course_id: '',
      course_id_update: null,
    };
    addTrainingDetailsApi(params)
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

    const appendIfNotNull = (key: any, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    };

    formData.append('bipardCentre', JSON.stringify([bipardLocation.name]));

    appendIfNotNull('training_category', trainingCategory?.categoryId);
    appendIfNotNull('is_budget_training', budget?.id);

    appendIfNotNull('training_full_name', trainingFullName);
    appendIfNotNull('training_short_name', trainingShortName);

    appendIfNotNull(
      'course_start_date',
      moment(trainingStartDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );

    appendIfNotNull(
      'course_end_date',
      moment(trainingEndDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );

    appendIfNotNull(
      'hostel_allocation_order',
      JSON.stringify(
        !isNullUndefined(hostel) ? hostel.map((h: any) => Number(h.id)) : [],
      ),
    );

    appendIfNotNull('training_type', trainingType?.id);
    appendIfNotNull('training_fee', trainingFee?.id);

    appendIfNotNull('nature_of_course', natureOfCourse?.id);
    appendIfNotNull('no_of_participants', noOfParticipants);
    appendIfNotNull('parent_department', parentDepartment?.name);
    appendIfNotNull('no_of_sections', noOfSectionAndBatches);
    appendIfNotNull('status', status?.id);
    appendIfNotNull('description', courseDesc ?? '');

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

    appendIfNotNull('course_coordinator', courseCoordinator?.id);
    appendIfNotNull('young_professional', youngProfessional?.id);

    appendIfNotNull('course_location', null);
    appendIfNotNull('course_sub_location', null);

    const formattedLocation = {
      locations: !isNullUndefined(trainingTeamLocations)
        ? trainingTeamLocations.map((loc: any) => ({
            courseLocation: loc.courseLocation,
            courseSubLocation: loc.courseSubLocation,
          }))
        : [],
    };

    appendIfNotNull('location', JSON.stringify(formattedLocation));

    appendIfNotNull('course_id', item?.id);
    appendIfNotNull('course_id_update', item?.id);

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
              selectedData: bipardLocation,
              setSelectedData: (data: any) => {
                dispatch(saveBipardLocation(data));
                getTrainingCategory(data.name);
                getHostelName(data.name);
                getCourseLocation(data.name);
                getCourseCoordinator(data.name);
                getYoungProfessional(data.name);
                getBudgetList(data.name);
                getTrainingDepartmentList(data.name);

                dispatch(saveTrainingCategory({}));
                dispatch(saveBudget({}));
                dispatch(saveTraining({}));
                dispatch(saveParentDepartment(''));

                setErrors({ ...errors, 'bipardLocation.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.id']}
        />
        <DropDownOrganism
          label={'Training Category'}
          placeholder={'Training Category'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Category',
              Data: trainingCategoryList,
              selectedData: trainingCategory,
              setSelectedData: (data: any) => {
                dispatch(saveTrainingCategory(data));

                setErrors({ ...errors, 'trainingCategory.categoryId': '' });
              },
              typeName: 'categoryName',
              typeId: 'categoryId',
            });
          }}
          inputText={trainingCategory?.categoryName}
          isMandatory
          errorMessage={errors['trainingCategory.categoryId']}
        />
        <DropDownOrganism
          label={'Is Training Created in Budget?'}
          placeholder={'Is Training Created in Budget?'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Budget List',
              Data: budgetList,
              selectedData: budget,
              setSelectedData: (data: any) => {
                dispatch(saveBudget(data));
                if (data.name === 'Yes') {
                  getBudgetMapping(data.name);
                }

                setErrors({ ...errors, 'budget.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={budget?.name}
          isMandatory
          errorMessage={errors['budget.id']}
        />

        {budget?.id === 'Yes' ? (
          <DropDownOrganism
            label={'Training'}
            placeholder={'Training'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Training',
                Data: trainingList,
                selectedData: training,
                setSelectedData: (data: any) => {
                  dispatch(saveTraining(data));
                  dispatch(saveNoOfParticipants(data.noOfParticipants));
                  dispatch(
                    saveTrainingStartDate(
                      moment(data.startDate, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                    ),
                  );
                  dispatch(
                    saveTrainingEndDate(
                      moment(data.endDate, 'YYYY-MM-DD').format('DD-MM-YYYY'),
                    ),
                  );
                  setErrors({ ...errors, 'training.id': '' });
                },
                typeName: 'trainingName',
                typeId: 'id',
              });
            }}
            inputText={training?.trainingName}
            isMandatory
            errorMessage={errors['training.id']}
          />
        ) : (
          <TextInputOrganisms
            label={'Training Full Name'}
            placeholder={'Training Full Name'}
            ref={input1_ref}
            onSubmitEditing={() => input2_ref.current.focus()}
            value={trainingFullName}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              dispatch(saveTrainingFullName(val));
              setErrors({ ...errors, trainingFullName: '' });
            }}
            isMandatory
            errorMessage={errors.trainingFullName}
          />
        )}

        <TextInputOrganisms
          label={'Training Short Name'}
          placeholder={'Training Short Name'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={trainingShortName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            dispatch(saveTrainingShortName(val));
            setErrors({ ...errors, trainingShortName: '' });
          }}
          isMandatory
          errorMessage={errors.trainingShortName}
        />

        <DateInputOrganism
          label="Training Start Date"
          placeholder="Training Start Date"
          value={trainingStartDate}
          onChangeText={(val: any) => {
            dispatch(saveTrainingStartDate(val));
            setErrors({ ...errors, trainingStartDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.trainingStartDate}
        />

        <DateInputOrganism
          label="Training End Date"
          placeholder="Training End Date"
          value={trainingEndDate}
          onChangeText={(val: any) => {
            dispatch(saveTrainingEndDate(val));
            setErrors({ ...errors, trainingEndDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          minDate={
            trainingStartDate
              ? moment(trainingStartDate, 'DD-MM-YYYY').toDate()
              : undefined
          }
          isMandatory
          errorMessage={errors.trainingEndDate}
        />
        <DropDownOrganism
          label={'Training Type'}
          placeholder={'Training Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Type',
              Data: [
                { id: 'Institutional', name: 'Institutional' },
                { id: 'Public', name: 'Public' },
              ],
              selectedData: trainingType,
              setSelectedData: (data: any) => {
                dispatch(saveTrainingType(data));

                setErrors({ ...errors, 'trainingType.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={trainingType?.name}
          isMandatory
          errorMessage={errors['trainingType.id']}
        />
        <DropDownOrganism
          label={'Training Fee'}
          placeholder={'Training Fee'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Fee',
              Data: [
                { id: 1, name: 'Free' },
                { id: 2, name: 'Paid' },
              ],
              selectedData: trainingFee,
              setSelectedData: (data: any) => {
                dispatch(saveTrainingFee(data));
                setErrors({ ...errors, 'trainingFee.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={trainingFee?.name}
          isMandatory
          errorMessage={errors['trainingFee.id']}
        />
        <DropDownOrganism
          label={'Nature of Course'}
          placeholder={'Nature of Course'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Nature of Course',
              Data: [
                { id: 1, name: 'Online' },
                { id: 2, name: 'Offline' },
              ],
              selectedData: natureOfCourse,
              setSelectedData: (data: any) => {
                dispatch(saveNatureOfCourse(data));

                setErrors({ ...errors, 'natureOfCourse.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={natureOfCourse?.name}
          isMandatory
          errorMessage={errors['natureOfCourse.id']}
        />
        <TextInputOrganisms
          label={'No of Participants'}
          placeholder={'No of Participants'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={noOfParticipants}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            dispatch(saveNoOfParticipants(normalizeNumber(val)));
            setErrors({ ...errors, noOfParticipants: '' });
          }}
          isMandatory
          errorMessage={errors.noOfParticipants}
          maxLength={10}
          keyboardType="numeric"
        />
        <DropDownOrganism
          label={'Parent Department'}
          placeholder={'Parent Department'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Parent Department',
              Data: parentDepartmentList,
              selectedData: parentDepartment,
              setSelectedData: (data: any) => {
                dispatch(saveParentDepartment(data));
                setErrors({ ...errors, 'parentDepartment.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={parentDepartment?.name}
          isMandatory
          errorMessage={errors['parentDepartment.name']}
        />
        <TextInputOrganisms
          label={'No of Sections and Batches'}
          placeholder={'No of Sections and Batches'}
          ref={input4_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={noOfSectionAndBatches}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            dispatch(saveNoOfSectionAndBatches(normalizeNumber(val)));
            setErrors({ ...errors, noOfSectionAndBatches: '' });
          }}
          isMandatory
          errorMessage={errors.noOfSectionAndBatches}
          maxLength={10}
          keyboardType="numeric"
        />
        <RadioSelectableOrganism
          data={[
            { id: 'Active', value: 'Active' },
            { id: 'Inactive', value: 'Inactive' },
          ]}
          onSelect={(item: any) => {
            dispatch(saveStatus(item));
            setErrors({ ...errors, 'status.id': '' });
          }}
          label={'Status'}
          selectedType={status}
          typeName={'value'}
          typeId={'id'}
          isMandatory
          errorMessage={errors['status.id']}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism
        bttnText="Next"
        onPress={onSubmit}
        containerStyle={{ width: vw(328), marginBottom: vh(30) }}
      />
    </SafeAreaView>
  );
};

export default General;

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
