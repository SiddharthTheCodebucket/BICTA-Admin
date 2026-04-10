import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Keyboard, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';

import { strings, vh } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import {
  isNullUndefined,
  normalizeLettersAndNumbers,
  normalizeNumber,
} from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useAddHostelFloorMutation,
  useUpdateHostelFloorMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import { useListFacultyDetailsMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import {
  FormDropdownFieldWithTitle,
  FormFileUploadWithTitle,
  FormGradientButton,
  FormRadioFieldWithTitle,
  FormStepper,
  FormSwitchWithTitle,
  FormTextInputWithTitle,
} from '../../../../../../components/templates';
import FormFieldWrapper from '../../../../../../components/templates/FormFieldWrapper';
import { globalStyles } from '../../../../../../utils/globalStyles';
import TextAtom from '../../../../../../components/atoms/TextAtom';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  facultyTypeList: [],
  selectedFacultyType: {},

  bipardLocationList: [],
  bipardLocation: {},

  saluationList: [],
  selectedSaluation: {},

  facultyNameList: [],
  selectedFacultyName: {},

  emailId: '',
  mobileNo: '',

  categoryList: [],
  selectedCategory: {},

  payLevelList: [],
  selectedPayLevel: {},

  panNo: '',

  selectedLocation: {},
  stateList: [],
  selectedState: {},

  documentCard: {},
  status: {},

  bankName: '',
  accountName: '',
  ifscCode: '',
  branchName: '',
  accountHolderName: '',
  experties: '',
};

const locationOptions = [
  {
    id: strings.lms.facultyManagement.details.bihar,
    value: strings.lms.facultyManagement.details.bihar,
  },
  {
    id: strings.lms.facultyManagement.details.outsideBihar,
    value: strings.lms.facultyManagement.details.outsideBihar,
  },
];

const AddFacultyDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const input1Ref = useRef<any>(null);
  const input2Ref = useRef<any>(null);
  const input3Ref = useRef<any>(null);
  const bank1Ref = useRef<any>(null);
  const bank2Ref = useRef<any>(null);
  const bank3Ref = useRef<any>(null);
  const bank4Ref = useRef<any>(null);
  const bank5Ref = useRef<any>(null);
  const bank6Ref = useRef<any>(null);

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listFacultyDetailsApi] = useListFacultyDetailsMutation();
  const [addHostelFloorApi] = useAddHostelFloorMutation();
  const [updateHostelFloorApi] = useUpdateHostelFloorMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(1);

  const steps = ['Faculty', 'Uploads', 'Bank'];

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      !isNullUndefined(item)
        ? strings.lms.facultyManagement.details.editTitle
        : strings.lms.facultyManagement.details.addTitle,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation, item]);

  const setValue = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const clearError = (key: string) => {
    setErrors((prev: any) => ({ ...prev, [key]: '' }));
  };

  useEffect(() => {
    getBipardCenter();
    getFacultyType();

    if (!item) return;

    // Map edit values here if your API returns them
    // Example:
    // setForm(prev => ({
    //   ...prev,
    //   selectedFacultyType: { id: item.facultyTypeId, name: item.facultyTypeName },
    //   ...
    // }));
  }, [item]);

  const facultySchema = Yup.object().shape({
    status: Yup.object({
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.statusRequired,
      ),
    }),
    selectedState: Yup.object({
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.stateRequired,
      ),
    }),
    selectedLocation: Yup.object({
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.locationRequired,
      ),
    }),
    panNo: Yup.string()
      .required(strings.lms.facultyManagement.validation.panRequired)
      .length(10, strings.lms.facultyManagement.validation.panDigits),
    selectedPayLevel: Yup.object({
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.payLevelRequired,
      ),
    }),
    selectedCategory: Yup.object({
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.categoryRequired,
      ),
    }),
    mobileNo: Yup.string()
      .required(strings.lms.facultyManagement.validation.mobileRequired)
      .length(10, strings.lms.facultyManagement.validation.mobileDigits),
    emailId: Yup.string().required(
      strings.lms.facultyManagement.validation.emailRequired,
    ),
    selectedFacultyName: Yup.object({
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.facultyNameRequired,
      ),
    }),
    selectedSaluation: Yup.object({
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.salutationRequired,
      ),
    }),
    bipardLocation: Yup.object({
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.bipardLocationRequired,
      ),
    }),
    selectedFacultyType: Yup.object({
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.facultyTypeRequired,
      ),
    }),
  });

  const uploadSchema = Yup.object().shape({
    documentCard: Yup.object({
      uri: Yup.string().required(
        strings.lms.facultyManagement.validation.documentRequired,
      ),
    }),
  });

  const bankSchema = Yup.object().shape({
    bankName: Yup.string().required('Bank name is required'),
    accountName: Yup.string().required('Account name is required'),
    ifscCode: Yup.string()
      .required('IFSC code is required')
      .length(11, 'IFSC code must be 11 characters'),
    branchName: Yup.string().required('Branch name is required'),
    accountHolderName: Yup.string().required('Account holder name is required'),
    experties: Yup.string().required('Expertise is required'),
  });

  const fullSchema = facultySchema.concat(uploadSchema).concat(bankSchema);

  const applyValidationErrors = (validationError: any) => {
    const nextErrors: any = {};

    if (validationError?.inner?.length) {
      validationError.inner.forEach((err: any) => {
        if (err?.path && !nextErrors[err.path]) {
          nextErrors[err.path] = err.message;
        }
      });
    } else if (validationError?.path) {
      nextErrors[validationError.path] = validationError.message;
    }

    setErrors(nextErrors);
  };

  const getFacultyType = () => {
    const params = {
      listType: 'select_faculty_type',
      bipardCentre: [],
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('facultyTypeList', res.data);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
          autoHide: true,
        });
      });
  };

  const getBipardCenter = () => {
    const params = {
      listType: 'select_training_centre',
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('bipardLocationList', res.data);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
          autoHide: true,
        });
      });
  };

  const getSalutation = (id: any) => {
    const params = {
      listType: 'select_salutation',
      bipardCentre: [id],
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('saluationList', res.data);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
          autoHide: true,
        });
      });
  };

  const getFaculty = (id: any) => {
    const params: any = {
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: 1,
      itemsPerPage: null,
      bipardCentre: [id],
    };

    listFacultyDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data ?? [];
        const modifiedList = newData.map((faculty: any) => ({
          ...faculty,
          id: faculty.id,
          name: `${faculty.id}, ${faculty.facultyName}, ${
            faculty.designation || ''
          }`.trim(),
        }));
        setValue('facultyNameList', modifiedList);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const getCategory = (id: any) => {
    const params = {
      listType: 'faculty_category',
      bipardCentre: [id],
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('categoryList', res.data);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
          autoHide: true,
        });
      });
  };

  const getPayLevel = (id: any) => {
    const params = {
      listType: 'select_faculty_pay_level',
      bipardCentre: [id],
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('payLevelList', res.data);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
          autoHide: true,
        });
      });
  };

  const getState = (id: any) => {
    const params = {
      listType: 'select_state_for_faculty_details',
      bipardCentre: [id],
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('stateList', res.data);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
          autoHide: true,
        });
      });
  };

  const handleBipardLocationChange = (data: any) => {
    setValue('bipardLocation', data);
    clearError('bipardLocation.id');

    setValue('selectedSaluation', {});
    setValue('selectedFacultyName', {});
    setValue('selectedCategory', {});
    setValue('selectedPayLevel', {});
    setValue('selectedState', {});

    setValue('saluationList', []);
    setValue('facultyNameList', []);
    setValue('categoryList', []);
    setValue('payLevelList', []);
    setValue('stateList', []);

    getSalutation(data?.name);
    getFaculty(data?.name);
    getCategory(data?.name);
    getPayLevel(data?.name);
    getState(data?.name);
  };

  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      await facultySchema.validate(form, { abortEarly: false });
    } else if (currentStep === 2) {
      await uploadSchema.validate(form, { abortEarly: false });
    } else {
      await fullSchema.validate(form, { abortEarly: false });
    }
  };

  const buildPayload = () => {
    return {
      id: item?.id ?? null,

      facultyTypeId: form.selectedFacultyType?.id,
      bipardLocationId: form.bipardLocation?.id,
      salutationId: form.selectedSaluation?.id,
      facultyNameId: form.selectedFacultyName?.id,
      emailId: form.emailId,
      mobileNo: form.mobileNo,
      categoryId: form.selectedCategory?.id,
      payLevelId: form.selectedPayLevel?.id,
      panNo: form.panNo,
      locationId: form.selectedLocation?.id,
      stateId: form.selectedState?.id || null,
      statusId: form.status?.id,

      documentCard: form.documentCard,

      bankName: form.bankName,
      accountName: form.accountName,
      ifscCode: form.ifscCode,
      branchName: form.branchName,
      accountHolderName: form.accountHolderName,
      experties: form.experties,
    };
  };

  const submitFinal = async () => {
    const params = buildPayload();

    try {
      if (item) {
        const res: any = await updateHostelFloorApi(params).unwrap();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
      } else {
        const res: any = await addHostelFloorApi(params).unwrap();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
      }

      navigation.goBack();
      props.route.params?.onDone?.();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message || strings.something_went_wrong,
      });
    }
  };

  const goNext = async () => {
    try {
      setLoader(true);
      await validateCurrentStep();
      setErrors({});

      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      } else {
        await submitFinal();
      }
    } catch (err: any) {
      applyValidationErrors(err);
    } finally {
      setLoader(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={vh(120)}
      >
        <View style={{ padding: vh(12) }}>
          <FormStepper steps={steps} currentStep={currentStep} />

          <FormFieldWrapper>
            {currentStep === 1 && (
              <>
                <FormDropdownFieldWithTitle
                  title={strings.lms.facultyManagement.details.facultyType}
                  isMandatory
                  data={form.facultyTypeList}
                  value={form.selectedFacultyType?.id}
                  onChange={data => {
                    setValue('selectedFacultyType', data);
                    clearError('selectedFacultyType.id');
                  }}
                  labelField="name"
                  valueField="id"
                  placeholder={
                    strings.lms.facultyManagement.details.facultyType
                  }
                  errorMessage={errors['selectedFacultyType.id']}
                />

                <FormDropdownFieldWithTitle
                  title={strings.lms.facultyManagement.details.bipardLocation}
                  isMandatory
                  data={[
                    {
                      id: strings.dashboardIndex.gaya,
                      name: strings.dashboardIndex.gaya,
                    },
                    {
                      id: strings.dashboardIndex.patna,
                      name: strings.dashboardIndex.patna,
                    },
                  ]}
                  value={form.bipardLocation?.id}
                  onChange={handleBipardLocationChange}
                  labelField="name"
                  valueField="id"
                  placeholder={
                    strings.lms.facultyManagement.details.bipardLocation
                  }
                  errorMessage={errors['bipardLocation.id']}
                />

                <FormDropdownFieldWithTitle
                  title={strings.lms.facultyManagement.details.salutation}
                  isMandatory
                  data={form.saluationList}
                  value={form.selectedSaluation?.id}
                  onChange={data => {
                    setValue('selectedSaluation', data);
                    clearError('selectedSaluation.id');
                  }}
                  labelField="name"
                  valueField="id"
                  placeholder={strings.lms.facultyManagement.details.salutation}
                  errorMessage={errors['selectedSaluation.id']}
                />

                <FormDropdownFieldWithTitle
                  title={strings.lms.facultyManagement.details.facultyName}
                  isMandatory
                  data={form.facultyNameList}
                  value={form.selectedFacultyName?.id}
                  onChange={data => {
                    setValue('selectedFacultyName', data);
                    clearError('selectedFacultyName.id');
                  }}
                  labelField="name"
                  valueField="id"
                  placeholder={
                    strings.lms.facultyManagement.details.facultyName
                  }
                  errorMessage={errors['selectedFacultyName.id']}
                />

                <FormTextInputWithTitle
                  ref={input1Ref}
                  title={strings.lms.facultyManagement.details.email}
                  isMandatory
                  placeholder={strings.lms.facultyManagement.details.email}
                  value={form.emailId}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => input2Ref.current?.focus?.()}
                  onChangeText={(val: string) => {
                    setValue('emailId', val);
                    clearError('emailId');
                  }}
                  errorMessage={errors.emailId}
                />

                <FormTextInputWithTitle
                  ref={input2Ref}
                  title={strings.lms.facultyManagement.details.mobileNumber}
                  isMandatory
                  placeholder={
                    strings.lms.facultyManagement.details.mobileNumber
                  }
                  value={form.mobileNo}
                  keyboardType="numeric"
                  maxLength={10}
                  returnKeyType="next"
                  onSubmitEditing={() => input3Ref.current?.focus?.()}
                  onChangeText={(val: string) => {
                    setValue('mobileNo', normalizeNumber(val));
                    clearError('mobileNo');
                  }}
                  errorMessage={errors.mobileNo}
                />

                <FormDropdownFieldWithTitle
                  title={strings.lms.facultyManagement.details.category}
                  isMandatory
                  data={form.categoryList}
                  value={form.selectedCategory?.id}
                  onChange={data => {
                    setValue('selectedCategory', data);
                    clearError('selectedCategory.id');
                  }}
                  labelField="name"
                  valueField="id"
                  placeholder={strings.lms.facultyManagement.details.category}
                  errorMessage={errors['selectedCategory.id']}
                />

                <FormDropdownFieldWithTitle
                  title={strings.lms.facultyManagement.details.payLevel}
                  isMandatory
                  data={form.payLevelList}
                  value={form.selectedPayLevel?.id}
                  onChange={data => {
                    setValue('selectedPayLevel', data);
                    clearError('selectedPayLevel.id');
                  }}
                  labelField="name"
                  valueField="id"
                  placeholder={strings.lms.facultyManagement.details.payLevel}
                  errorMessage={errors['selectedPayLevel.id']}
                />

                <FormTextInputWithTitle
                  ref={input3Ref}
                  title={strings.lms.facultyManagement.details.panNumber}
                  isMandatory
                  placeholder={strings.lms.facultyManagement.details.panNumber}
                  value={form.panNo}
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={(val: string) => {
                    setValue('panNo', normalizeLettersAndNumbers(val));
                    clearError('panNo');
                  }}
                  errorMessage={errors.panNo}
                />

                <FormRadioFieldWithTitle
                  title={strings.lms.facultyManagement.details.location}
                  isMandatory
                  data={locationOptions}
                  selectedValue={form.selectedLocation?.id}
                  onSelect={item => {
                    setValue('selectedLocation', item);
                    clearError('selectedLocation.id');
                  }}
                  labelField="value"
                  valueField="id"
                  errorMessage={errors['selectedLocation.id']}
                />

                {form.selectedLocation?.id ===
                  strings.lms.facultyManagement.details.outsideBihar && (
                  <FormDropdownFieldWithTitle
                    title={strings.lms.facultyManagement.details.state}
                    isMandatory
                    data={form.stateList}
                    value={form.selectedState?.id}
                    onChange={data => {
                      setValue('selectedState', data);
                      clearError('selectedState.id');
                    }}
                    labelField="name"
                    valueField="id"
                    placeholder={strings.lms.facultyManagement.details.state}
                    errorMessage={errors['selectedState.id']}
                  />
                )}

                <FormSwitchWithTitle
                  title={strings.lms.facultyManagement.details.status}
                  isMandatory
                  data={[
                    {
                      id: strings.lms.facultyManagement.details.active,
                      label: strings.lms.facultyManagement.details.active,
                    },
                    {
                      id: strings.lms.facultyManagement.details.inactive,
                      label: strings.lms.facultyManagement.details.inactive,
                    },
                  ]}
                  selectedValue={form.status?.id}
                  onSelect={(selected: any) => {
                    setValue('status', selected);
                    clearError('status.id');
                  }}
                  errorMessage={errors['status.id']}
                />
              </>
            )}

            {currentStep === 2 && (
              <FormFileUploadWithTitle
                title={strings.lms.facultyManagement.details.uploadFile}
                isMandatory
                showNote
                noteText={strings.lms.facultyManagement.details.addFile}
                fileName={
                  form.documentCard?.name || form.documentCard?.fileName
                }
                onFileSelected={file => {
                  setValue('documentCard', {
                    uri: file?.uri,
                    name: file?.name,
                    fileName: file?.name,
                    type: file?.type,
                    size: file?.size,
                  });
                  clearError('documentCard.uri');
                  Toast.show({
                    type: 'success',
                    text2: `${file?.name} ${strings.file_selected}`,
                  });
                }}
                onFileRemove={() => {
                  setValue('documentCard', {});
                  clearError('documentCard.uri');
                }}
                accept={['application/pdf']}
                maxSizeMB={3}
                errorMessage={errors['documentCard.uri']}
              />
            )}

            {currentStep === 3 && (
              <>
                <FormTextInputWithTitle
                  ref={bank1Ref}
                  title="Bank Name"
                  isMandatory
                  placeholder="Bank Name"
                  value={form.bankName}
                  returnKeyType="next"
                  onSubmitEditing={() => bank2Ref.current?.focus?.()}
                  onChangeText={(val: string) => {
                    setValue('bankName', val);
                    clearError('bankName');
                  }}
                  errorMessage={errors.bankName}
                />

                <FormTextInputWithTitle
                  ref={bank2Ref}
                  title="Account Name"
                  isMandatory
                  placeholder="Account Name"
                  value={form.accountName}
                  returnKeyType="next"
                  onSubmitEditing={() => bank3Ref.current?.focus?.()}
                  onChangeText={(val: string) => {
                    setValue('accountName', val);
                    clearError('accountName');
                  }}
                  errorMessage={errors.accountName}
                />

                <FormTextInputWithTitle
                  ref={bank3Ref}
                  title="IFSC Code"
                  isMandatory
                  placeholder="IFSC Code"
                  value={form.ifscCode}
                  autoCapitalize="characters"
                  maxLength={11}
                  returnKeyType="next"
                  onSubmitEditing={() => bank4Ref.current?.focus?.()}
                  onChangeText={(val: string) => {
                    setValue('ifscCode', val.toUpperCase());
                    clearError('ifscCode');
                  }}
                  errorMessage={errors.ifscCode}
                />

                <FormTextInputWithTitle
                  ref={bank4Ref}
                  title="Branch Name"
                  isMandatory
                  placeholder="Branch Name"
                  value={form.branchName}
                  returnKeyType="next"
                  onSubmitEditing={() => bank5Ref.current?.focus?.()}
                  onChangeText={(val: string) => {
                    setValue('branchName', val);
                    clearError('branchName');
                  }}
                  errorMessage={errors.branchName}
                />

                <FormTextInputWithTitle
                  ref={bank5Ref}
                  title="Account Holder Name"
                  isMandatory
                  placeholder="Account Holder Name"
                  value={form.accountHolderName}
                  returnKeyType="next"
                  onSubmitEditing={() => bank6Ref.current?.focus?.()}
                  onChangeText={(val: string) => {
                    setValue('accountHolderName', val);
                    clearError('accountHolderName');
                  }}
                  errorMessage={errors.accountHolderName}
                />

                <FormTextInputWithTitle
                  ref={bank6Ref}
                  title="Experties"
                  isMandatory
                  placeholder="Experties"
                  value={form.experties}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={(val: string) => {
                    setValue('experties', val);
                    clearError('experties');
                  }}
                  errorMessage={errors.experties}
                />
              </>
            )}
          </FormFieldWrapper>

          {/* <View style={{ marginTop: vh(20) }}>
            <FormGradientButton
              title={
                currentStep < 3
                  ? 'Next'
                  : item
                  ? strings.lms.facultyManagement.details.update
                  : strings.lms.facultyManagement.details.add
              }
              onPress={goNext}
            />
          </View> */}

          <View style={globalStyles.footerButtonsRow}>
            {!isFirstStep ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={goBack}
                style={[globalStyles.footerButton, globalStyles.backButton]}
              >
                <TextAtom style={globalStyles.backButtonText}>Back</TextAtom>
              </TouchableOpacity>
            ) : null}

            <View style={{ flex: 1 }}>
              <FormGradientButton
                title={
                  isLastStep
                    ? item
                      ? strings.lms.facultyManagement.details.update
                      : strings.lms.facultyManagement.details.add
                    : 'Next'
                }
                onPress={goNext}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddFacultyDetails;
