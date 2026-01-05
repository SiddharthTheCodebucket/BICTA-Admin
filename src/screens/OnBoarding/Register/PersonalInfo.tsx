import React, { createRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

import { colors, fonts, strings, vh, vw } from '../../../constants';
import { NavigationType } from '../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../components/organisms/DropDownOrganism';
import DateInputOrganism from '../../../components/organisms/DateInputOrganism';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  aadharCardRegex,
  normalizeNumber,
} from '../../../utils/CommonFunction';
import ButtonOrganism from '../../../components/organisms/ButtonOrganism';
import { useAppSelector } from '../../../hooks';

import { saveRegistrationState } from '../../../featuresTrainee/Registration/registrationSlice';
import TextAtom from '../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
  goNext: any;
}

const PersonalInfo = (props: Props) => {
  const { navigation, goNext } = props;
  const dispatch = useDispatch();

  const input1_ref: any = createRef();

  const [errors, setErrors] = useState<any>({});

  const {
    trainingName,
    trainingCenter,
    name,
    dob,
    genderList,
    selectedGender,
    placeOfPosting,
    aadharNumber,
    bloodGroupList,
    selectedBloodGroup,
    departmentList,
    selecteddepartment,
    maritalStatusList,
    selectedMaritalStatus,
    pregnancyStatus,
  } = useAppSelector(state => state.Registration);

  const [localName, setLocalName] = useState(name);
  const [localDob, setLocalDob] = useState(dob);
  const [localPosting, setLocalPosting] = useState(placeOfPosting);
  const [localAadhar, setLocalAadhar] = useState(aadharNumber);

  const [localIsRegistered, setLocalIsRegistered] = useState<any>(DATA[1]);
  const [localTrainingCenter, setLocalTrainingCenter] =
    useState<any>(trainingCenter);
  const [localGender, setLocalGender] = useState<any>(selectedGender);
  const [localMaritalStatus, setLocalMaritalStatus] = useState<any>(
    selectedMaritalStatus,
  );
  const [localPregnancyStatus, setLocalPregnancyStatus] =
    useState<any>(pregnancyStatus);
  const [localDepartment, setLocalDepartment] =
    useState<any>(selecteddepartment);
  const [localBloodGroup, setLocalBloodGroup] =
    useState<any>(selectedBloodGroup);

  const schema = Yup.object().shape({
    isAlreadyRegistered: Yup.object({
      name: Yup.string().required('Is Already Registered is required'),
    }),

    ...(localIsRegistered?.id === 'No' && {
      selectedBloodGroup: Yup.object({
        name: Yup.string().required('Blood group is required'),
      }),
      aadharNumber: Yup.string()
        .required(strings.aadhar_required)
        .max(12, strings.aadhar_invalid)
        .min(12, strings.aadhar_invalid)
        .matches(aadharCardRegex, strings.aadhar_invalid),
      placeOfPosting: Yup.string().required('Place of posting is required'),
      selecteddepartment: Yup.object({
        name: Yup.string().required('Designation is required'),
      }),
      pregnancyStatus:
        localGender.id === 'Female' && localMaritalStatus.id === 'M'
          ? Yup.object({
              name: Yup.string().required('Pregnancy Status is required'),
            })
          : Yup.mixed().notRequired(),
      selectedMaritalStatus: Yup.object({
        name: Yup.string().required('Marital Status is required'),
      }),
      selectedGender: Yup.object({
        name: Yup.string().required('Gender is required'),
      }),
      dob: Yup.string().required('DOB is required'),
      name: Yup.string().required('Name is required'),
    }),

    ...(localIsRegistered?.id === 'Yes' && {
      placeOfPosting: Yup.string().required('Place of posting is required'),

      selecteddepartment: Yup.object({
        name: Yup.string().required('Designation is required'),
      }),
      selectedMaritalStatus: Yup.object({
        name: Yup.string().required('Marital Status is required'),
      }),
    }),
  });

  const handleNext = () => {
    const form = {
      isAlreadyRegistered: localIsRegistered,
      name: localName,
      dob: localDob,
      placeOfPosting: localPosting,
      aadharNumber: localAadhar,
      // trainingCenter: localTrainingCenter,
      selectedGender: localGender,
      selectedMaritalStatus: localMaritalStatus,
      pregnancyStatus: localPregnancyStatus,
      selecteddepartment: localDepartment,
      selectedBloodGroup: localBloodGroup,
    };

    try {
      schema.validateSync(form, { abortEarly: true });
      setErrors({});

      dispatch(
        saveRegistrationState({
          name: localName,
          dob: localDob,
          placeOfPosting: localPosting,
          aadharNumber: localAadhar,
          isAlreadyRegistered: localIsRegistered,
          trainingCenter: localTrainingCenter,
          selectedGender: localGender,
          selectedMaritalStatus: localMaritalStatus,
          pregnancyStatus: localPregnancyStatus,
          selecteddepartment: localDepartment,
          selectedBloodGroup: localBloodGroup,
        }),
      );

      goNext();
    } catch (err: any) {
      setErrors((prev: any) => ({
        ...prev,
        [err.path]: err.message,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <DropDownOrganism
          label={'Is Already Registered?'}
          placeholder={'Is Already Registered?'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Is Already Registered',
              Data: DATA,
              selectedData: localIsRegistered,
              setSelectedData: (data: any) => {
                setLocalIsRegistered(data);
                setErrors((prev: any) => ({
                  ...prev,
                  'isAlreadyRegistered.name': '',
                }));
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={localIsRegistered?.name}
          isMandatory
          errorMessage={errors['isAlreadyRegistered.name']}
        />

        <TextInputOrganisms
          label={'Training Name'}
          placeholder={'Training Name'}
          value={trainingName}
          disabled
          editable={false}
        />
        <TextAtom
          numberOfLines={0}
          style={{
            color: colors.black,
            fontFamily: fonts.Roboto_Regular,
            fontSize: vw(11),
            marginBottom: vh(10),
          }}
        >
          <TextAtom
            style={{
              color: colors.red,
              fontFamily: fonts.Roboto_Regular,
              fontSize: vw(11),
            }}
          >
            NOTE:{' '}
          </TextAtom>
          If the training shown above is not yours, please scan the correct QR.
        </TextAtom>
        <DropDownOrganism
          label={'Training Centre'}
          placeholder={'Training Centre'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Centre',
              Data: DATA,
              selectedData: localTrainingCenter,
              setSelectedData: (data: any) => {
                setLocalTrainingCenter(data);
                setErrors((prev: any) => ({
                  ...prev,
                  'trainingCenter.name': '',
                }));
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={localTrainingCenter?.name}
          isDisabled={true}
          isMandatory
          // errorMessage={errors['trainingCenter.name']}
        />
        {localIsRegistered?.id === 'No' && (
          <>
            <TextInputOrganisms
              label={'Name'}
              placeholder={'Name'}
              ref={input1_ref}
              value={localName}
              onChangeText={(val: any) => {
                setLocalName(val);
                setErrors((prev: any) => ({ ...prev, name: '' }));
              }}
              isMandatory
              errorMessage={errors.name}
            />
            <DateInputOrganism
              label={strings.date_of_birth}
              placeholder={strings.date_of_birth}
              value={localDob}
              onChangeText={(val: any) => {
                setLocalDob(val);
                setErrors((prev: any) => ({ ...prev, dob: '' }));
              }}
              isMandatory
              errorMessage={errors.dob}
              dateFormat="DD-MM-YYYY"
              maxDate={new Date()}
            />

            <DropDownOrganism
              label={'Gender'}
              placeholder={'Gender'}
              onPress={() => {
                navigation.navigate('DropDownModal', {
                  name: 'Gender',
                  Data: genderList,
                  selectedData: localGender,
                  setSelectedData: (data: any) => {
                    setLocalGender(data);
                    setErrors((prev: any) => ({
                      ...prev,
                      'selectedGender.name': '',
                    }));
                  },
                  typeName: 'name',
                  typeId: 'id',
                });
              }}
              inputText={localGender?.name}
              isMandatory
              errorMessage={errors['selectedGender.name']}
            />
          </>
        )}

        <DropDownOrganism
          label={strings.marital_status}
          placeholder={strings.marital_status}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Marital Status',
              Data: maritalStatusList,
              selectedData: selectedMaritalStatus,
              setSelectedData: (data: any) => {
                setLocalMaritalStatus(data);
                setErrors({ ...errors, 'selectedMaritalStatus.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={localMaritalStatus?.name}
          isMandatory
          errorMessage={errors['selectedMaritalStatus.name']}
        />
        {localIsRegistered?.id === 'No' && (
          <>
            {localGender.id === 'Female' && localMaritalStatus.id === 'M' && (
              <DropDownOrganism
                label={'Pregnancy Status'}
                placeholder={'Pregnancy Status'}
                onPress={() => {
                  navigation.navigate('DropDownModal', {
                    name: 'Pregnancy Status',
                    Data: DATA,
                    selectedData: pregnancyStatus,
                    setSelectedData: (data: any) => {
                      setLocalPregnancyStatus(data);
                      setErrors({ ...errors, 'pregnancyStatus.name': '' });
                    },
                    typeName: 'name',
                    typeId: 'id',
                  });
                }}
                inputText={pregnancyStatus?.name}
                isMandatory
                errorMessage={errors['pregnancyStatus.name']}
              />
            )}
          </>
        )}
        <DropDownOrganism
          label={'Designation'}
          placeholder={'Designation'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Designation',
              Data: departmentList,
              selectedData: localDepartment,
              setSelectedData: (data: any) => {
                setLocalDepartment(data);
                setErrors((prev: any) => ({
                  ...prev,
                  'selecteddepartment.name': '',
                }));
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={localDepartment?.name}
          isMandatory
          errorMessage={errors['selecteddepartment.name']}
        />

        <TextInputOrganisms
          label={'Place of posting'}
          placeholder={'Place of posting'}
          value={localPosting}
          onChangeText={(val: any) => {
            setLocalPosting(val);
            setErrors((prev: any) => ({ ...prev, placeOfPosting: '' }));
          }}
          isMandatory
          errorMessage={errors.placeOfPosting}
        />
        <TextAtom
          numberOfLines={0}
          style={{
            color: colors.black,
            fontFamily: fonts.Roboto_Regular,
            fontSize: vw(11),
            marginBottom: vh(10),
          }}
        >
          <TextAtom
            numberOfLines={0}
            style={{
              color: colors.red,
              fontFamily: fonts.Roboto_Regular,
              fontSize: vw(11),
            }}
          >
            NOTE:{' '}
          </TextAtom>
          If Place of Posting is not given by the department. Please enter
          BIPARD as the place of posting.
        </TextAtom>
        {localIsRegistered?.id === 'No' && (
          <>
            <TextInputOrganisms
              label={strings.aadhaar_no}
              placeholder={strings.aadhaar_no}
              value={localAadhar}
              onChangeText={(val: any) => {
                const formatted = normalizeNumber(val);
                setLocalAadhar(formatted);
                setErrors((prev: any) => ({ ...prev, aadharNumber: '' }));
              }}
              maxLength={12}
              keyboardType="numeric"
              isMandatory
              errorMessage={errors.aadharNumber}
            />

            <DropDownOrganism
              label={'Blood Group'}
              placeholder={'Blood Group'}
              onPress={() => {
                navigation.navigate('DropDownModal', {
                  name: 'Blood Group',
                  Data: bloodGroupList,
                  selectedData: localBloodGroup,
                  setSelectedData: (data: any) => {
                    setLocalBloodGroup(data);
                    setErrors((prev: any) => ({
                      ...prev,
                      'selectedBloodGroup.name': '',
                    }));
                  },
                  typeName: 'name',
                  typeId: 'id',
                });
              }}
              inputText={localBloodGroup?.name}
              isMandatory
              errorMessage={errors['selectedBloodGroup.name']}
            />
          </>
        )}
      </KeyboardAwareScrollView>

      <ButtonOrganism
        bttnText="Next"
        onPress={handleNext}
        containerStyle={{ width: vw(328), marginBottom: vh(30) }}
      />
    </SafeAreaView>
  );
};

export default PersonalInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: vh(20),
  },
  scrollView: {
    flex: 1,
  },
});

const DATA = [
  { id: 'Yes', name: 'Yes' },
  { id: 'No', name: 'No' },
];
