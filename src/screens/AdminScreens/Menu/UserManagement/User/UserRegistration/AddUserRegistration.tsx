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
import {
  aadharCardRegex,
  emailRegex,
  isNullUndefined,
  mobileRegex,
  normalizeLettersAndNumbers,
  normalizeNumber,
  panCardRegex,
} from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';
import {
  useAddUserManagementMutation,
  useUpdateUserManagementMutation,
} from '../../../../../../injectEndpoints/userTypeEndpoints';
import moment from 'moment';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  userTypeList: [],
  selectedUserType: {},
  name: '',
  dob: '',
  aadharNo: '',
  pranNo: '',
  panNo: '',
  officialEmail: '',
  personalEmail: '',
  mobileNo: '',
  designationList: [],
  selectedDesignation: {},
  sectionList: [],
  selectedSection: {},
  roleList: [],
  selectedRole: [],
  requestedByList: [],
  selectedRequestedBy: {},
  centerList: [],
  selectedCenter: {},
  file: {},
};

const AddUserRegistration = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const input5_ref: any = createRef();
  const input6_ref: any = createRef();
  const input7_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addUserManagementApi] = useAddUserManagementMutation();
  const [updateUserManagementApi] = useUpdateUserManagementMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add User Management' : 'Update User Management',
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
    getUserTypeList();
    getDesignationList();
    getSectionList();
    getUserRoleList();
    getRequestedByList();
    getCenterList();
  }, []);

  const getBipardCentreByTenant = (tenantId: number) => {
    if (tenantId === 1) return ['Gaya'];
    if (tenantId === 2) return ['Patna'];
    return [];
  };

  useEffect(() => {
    if (tenantId === 1) {
      setForm((prev: any) => ({
        ...prev,
        selectedCenter: { id: 'Gaya', name: 'Gaya' },
      }));
    }

    if (tenantId === 2) {
      setForm((prev: any) => ({
        ...prev,
        selectedCenter: { id: 'Patna', name: 'Patna' },
      }));
    }
  }, [tenantId]);

  useEffect(() => {
    if (!item) return;

    setForm((prev: any) => ({
      ...prev,

      name: item.name || '',
      dob: moment(item.pickADob, 'YYYY-MM-DD').format('DD-MM-YYYY') || '',
      aadharNo: item.aadhaarNo || '',
      panNo: item.panNo || '',
      pranNo: item.pran || '',
      officialEmail: item.officialEmail || '',
      personalEmail: item.personalEmail || '',
      mobileNo: item.mobile || '',

      selectedDesignation: item.selectDesignation
        ? { id: item.selectDesignation, name: item.selectDesignation }
        : {},

      selectedSection: item.selectSection
        ? { id: item.selectSection, name: item.selectSection }
        : {},

      selectedRequestedBy: item.selectRequestedBy
        ? { id: item.selectRequestedBy, name: item.selectRequestedBy }
        : {},

      selectedCenter: item.trainingCenterName
        ? { id: item.trainingCenterName, name: item.trainingCenterName }
        : {},

      selectedUserType: item.userType
        ? { id: item.userTypeId || item.userType, name: item.userType }
        : {},

      selectedRole: Array.isArray(item.roleId)
        ? item.roleId.map((id: any, index: number) => ({
            id,
            name: item.roleIdName?.[index],
          }))
        : [],

      file: item.attachedFile ? { uri: item.attachedFile } : {},
    }));
  }, [item]);

  const schema = Yup.object().shape({
    selectedCenter: Yup.object({
      id: Yup.string().required('Center is required'),
    }),
    selectedRequestedBy: Yup.object({
      id: Yup.string().required('Requested By is required'),
    }),
    selectedRole: Yup.array()
      .min(1, 'Role is required')
      .required('Role is required'),
    selectedSection: Yup.object({
      id: Yup.string().required('Section is required'),
    }),
    selectedDesignation: Yup.object({
      id: Yup.string().required('Designation is required'),
    }),
    mobileNo: Yup.string()
      .required('Mobile Number is required')
      .max(10, strings.enter_valid_mobile)
      .min(10, strings.enter_valid_mobile)
      .matches(mobileRegex, strings.enter_valid_mobile),
    personalEmail: Yup.string()
      .required('Personal Email is required')
      .matches(emailRegex, strings.enter_valid_email),
    officialEmail: Yup.string()
      .required('Offical Email is required')
      .matches(emailRegex, strings.enter_valid_email),
    panNo: Yup.string()
      .required('PAN Number is required')
      .max(10, 'Enter valid pan number')
      .min(10, 'Enter valid pan number')
      .matches(panCardRegex, 'Enter valid pan number'),
    pranNo: Yup.string()
      .required('PRAN Number is required')
      .max(10, 'Enter valid PRAN number')
      .min(10, 'Enter valid PRAN number'),
    aadharNo: Yup.string()
      .required('Aadhar Number is required')
      .max(12, 'Enter valid Aadhar number')
      .min(12, 'Enter valid Aadhar number')
      .matches(aadharCardRegex, 'Enter valid Aadhar number'),
    dob: Yup.string().required('DOB is required'),
    name: Yup.string().required('Name is required'),
    selectedUserType: Yup.object({
      id: Yup.string().required('User Type is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateUserManagement();
      } else {
        addUserManagement();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addUserManagement = () => {
    setLoader(true);

    const formData = new FormData();

    formData.append('name', form.name);
    formData.append(
      'pick_a_dob',
      moment(form.dob, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formData.append('aadhaar_no', form.aadharNo);
    formData.append('pan_no', form.panNo);
    formData.append('pran', form.pranNo);
    formData.append('official_email', form.officialEmail);
    formData.append('personal_email', form.personalEmail);
    formData.append('mobile', form.mobileNo);

    formData.append('select_designation', form.selectedDesignation?.id);
    formData.append('select_section', form.selectedSection?.id);
    formData.append('select_requested_by', form.selectedRequestedBy?.id);
    formData.append('training_center', form.selectedCenter?.id);
    formData.append('user_type', form.selectedUserType?.id);
    formData.append(
      'select_role',
      form.selectedRole.map((r: any) => r.id)?.join(','),
    );

    if (form.file?.uri) {
      formData.append('attached_file', {
        uri: form.file.uri,
        name: form.file.fileName || 'user_file.jpg',
        type: form.file.type || 'image/jpeg',
      } as any);
    }

    addUserManagementApi(formData)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({ type: 'success', text2: res.data.message });
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

  const updateUserManagement = () => {
    setLoader(true);

    const isLocalFile = !!form.file?.uri?.startsWith('file://');

    const params: any = {
      admin_user_id: item.adminUserId,

      name: form.name,
      pick_a_dob: moment(form.dob, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      aadhaar_no: form.aadharNo,
      pan_no: form.panNo,
      pran: form.pranNo,
      official_email: form.officialEmail,
      personal_email: form.personalEmail,
      mobile: form.mobileNo,

      select_designation: form.selectedDesignation?.id,
      select_section: form.selectedSection?.id,
      select_requested_by: form.selectedRequestedBy?.id,
      training_center: form.selectedCenter?.id,
      user_type: form.selectedUserType?.id,
      select_role: form.selectedRole.map((r: any) => r.id).join(','),
    };

    if (!isLocalFile) {
      updateUserManagementApi(params)
        .unwrap()
        .then((res: any) => {
          navigation.goBack();
          props.route.params?.onDone?.();
          Toast.show({ type: 'success', text2: res.data.message });
        })
        .catch((err: any) => {
          Toast.show({
            type: 'error',
            text2: err?.data?.message || strings.something_went_wrong,
          });
        })
        .finally(() => setLoader(false));

      return;
    }

    const formData = new FormData();

    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        formData.append(key, String(params[key]));
      }
    });

    formData.append('attached_file', {
      uri: form.file.uri,
      name: form.file.fileName || 'user_file.jpg',
      type: form.file.type || 'image/jpeg',
    } as any);

    updateUserManagementApi(formData)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({ type: 'success', text2: res.data.message });
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || strings.something_went_wrong,
        });
      })
      .finally(() => setLoader(false));
  };

  const getUserTypeList = () => {
    setLoader(true);
    const params = {
      listType: 'select_user_type',
      bipardCentre: getBipardCentreByTenant(tenantId),
      replacements: [],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('userTypeList', res.data);

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

  const getDesignationList = () => {
    setLoader(true);
    const params = {
      listType: 'internal_user_select_designation',
      bipardCentre: getBipardCentreByTenant(tenantId),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('designationList', res.data);
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

  const getSectionList = () => {
    setLoader(true);

    const params = {
      listType: 'internal_user_select_section',
      bipardCentre: getBipardCentreByTenant(tenantId),
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('sectionList', res.data);
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

  const getUserRoleList = () => {
    setLoader(true);

    const params = {
      listType: 'internal_users_roles',
      bipardCentre: getBipardCentreByTenant(tenantId),
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('roleList', res.data);
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

  const getRequestedByList = () => {
    setLoader(true);

    const params = {
      listType: 'internal_user_select_requested_by',
      bipardCentre: getBipardCentreByTenant(tenantId),
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('requestedByList', res.data);
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

  const getCenterList = () => {
    setLoader(true);

    const params = {
      listType: 'select_training_centre',
      bipardCentre: [],
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('centerList', res.data);
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

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const removeRole = (role: any) => {
    setForm((prev: any) => ({
      ...prev,
      selectedRole: prev.selectedRole.filter((r: any) => r.id !== role.id),
    }));
  };

  const addRole = (role: any) => {
    const alreadyExists =
      Array.isArray(form.selectedRole) &&
      form.selectedRole.some((r: any) => r?.id === item?.id);
    if (alreadyExists) {
      Toast.show({
        type: 'error',
        text2: 'Role already added',
      });
      return;
    }

    setForm((prev: any) => ({
      ...prev,
      selectedRole: [...prev.selectedRole, role],
    }));
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
          label={'User Type'}
          placeholder={'User Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'User Type',
              Data: form.userTypeList,
              selectedData: form.selectedUserType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedUserType: data,
                }));
                setErrors({ ...errors, 'selectedUserType.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedUserType?.id}
          isMandatory
          errorMessage={errors['selectedUserType.id']}
        />

        <TextInputOrganisms
          label={'Name'}
          placeholder={'Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.name}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setForm((prev: any) => ({
              ...prev,
              name: val,
            }));
            setErrors({ ...errors, name: '' });
          }}
          isMandatory
          errorMessage={errors.name}
        />

        <DateInputOrganism
          label={'DOB'}
          placeholder={'DOB'}
          value={form.dob}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              dob: val,
            }));
            setErrors({ ...errors, dob: '' });
          }}
          fieldName={'date'}
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.dob}
          maxDate={eighteenYearsAgo}
        />

        <TextInputOrganisms
          label={'Aadhar Number'}
          placeholder={'Aadhar Number'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={form.aadharNo}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              aadharNo: normalizeNumber(val),
            }));
            setErrors({ ...errors, aadharNo: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          maxLength={12}
          keyboardType="numeric"
          isMandatory
          errorMessage={errors.aadharNo}
        />
        <TextInputOrganisms
          label={'PRAN Number'}
          placeholder={'PRAN Numner'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={form.pranNo}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setForm((prev: any) => ({
              ...prev,
              pranNo: normalizeNumber(val),
            }));
            setErrors({ ...errors, pranNo: '' });
          }}
          isMandatory
          errorMessage={errors.pranNo}
          maxLength={10}
          keyboardType="numeric"
        />

        <TextInputOrganisms
          label={strings.lms.facultyManagement.details.panNumber}
          placeholder={strings.lms.facultyManagement.details.panNumber}
          ref={input4_ref}
          onSubmitEditing={() => input5_ref.current.focus()}
          value={form.panNo}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setForm((prev: any) => ({
              ...prev,
              panNo: normalizeLettersAndNumbers(val)?.toUpperCase(),
            }));
            setErrors({ ...errors, panNo: '' });
          }}
          isMandatory
          errorMessage={errors.panNo}
          maxLength={10}
        />

        <TextInputOrganisms
          label={'Official Email'}
          placeholder={'Official Email'}
          ref={input5_ref}
          onSubmitEditing={() => input6_ref.current.focus()}
          value={form.officialEmail}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setForm((prev: any) => ({
              ...prev,
              officialEmail: val,
            }));
            setErrors({ ...errors, officialEmail: '' });
          }}
          isMandatory
          errorMessage={errors.officialEmail}
        />
        <TextInputOrganisms
          label={'Personal Email'}
          placeholder={'Personal Email'}
          ref={input6_ref}
          onSubmitEditing={() => input7_ref.current.focus()}
          value={form.personalEmail}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setForm((prev: any) => ({
              ...prev,
              personalEmail: val,
            }));
            setErrors({ ...errors, personalEmail: '' });
          }}
          isMandatory
          errorMessage={errors.personalEmail}
        />

        <TextInputOrganisms
          label={'Mobile Number'}
          placeholder={'Mobile Number'}
          ref={input7_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.mobileNo}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              mobileNo: normalizeNumber(val),
            }));
            setErrors({ ...errors, mobileNo: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          maxLength={10}
          keyboardType="numeric"
          isMandatory
          errorMessage={errors.mobileNo}
        />

        <DropDownOrganism
          label={'Designation'}
          placeholder={'Designation'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Designation',
              Data: form.designationList,
              selectedData: form.selectedDesignation,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedDesignation: data,
                }));
                setErrors({ ...errors, 'selectedDesignation.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedDesignation?.name}
          isMandatory
          errorMessage={errors['selectedDesignation.id']}
        />
        <DropDownOrganism
          label={'Section'}
          placeholder={'Section'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Section',
              Data: form.sectionList,
              selectedData: form.selectedSection,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedSection: data,
                }));
                setErrors({ ...errors, 'selectedSection.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedSection?.name}
          isMandatory
          errorMessage={errors['selectedSection.id']}
        />

        <DropDownOrganism
          label={'Role'}
          placeholder={'Role'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Role',
              Data: form.roleList,
              selectedData: {},
              setSelectedData: (item: any) => {
                addRole(item);
                setErrors((prev: any) => ({ ...prev, selectedRole: '' }));
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={''}
          isMandatory
          errorMessage={errors.selectedRole}
        />

        {form.selectedRole?.length >= 0 && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              width: vw(328),
              alignSelf: 'center',
              marginTop: vh(5),
            }}
          >
            {form.selectedRole?.map((item: any, index: number) => (
              <View
                key={index.toString() + item?.id}
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
                  {item.name}
                </Text>

                <TouchableOpacity
                  onPress={() => removeRole(item)}
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

        <DropDownOrganism
          label={'Requested By'}
          placeholder={'Requested By'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Requested By',
              Data: form.requestedByList,
              selectedData: form.selectedRequestedBy,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedRequestedBy: data,
                }));
                setErrors({ ...errors, 'selectedRequestedBy.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedRequestedBy?.name}
          isMandatory
          errorMessage={errors['selectedRequestedBy.id']}
        />
        <DropDownOrganism
          label={'Center'}
          placeholder={'Center'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Center',
              Data: form.centerList,
              selectedData: form.selectedCenter,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedCenter: data,
                }));
                setErrors({ ...errors, 'selectedCenter.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedCenter?.name}
          isMandatory
          errorMessage={errors['selectedCenter.id']}
          isDisabled={tenantId !== 3}
        />
        <ImageUploadOrganism
          label={'Attach File'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            setForm((prev: any) => ({
              ...prev,
              file: file,
            }));
          }}
          defaultImage={form.file?.uri}
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

export default AddUserRegistration;

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
