import { Keyboard, Linking, StyleSheet, TouchableOpacity } from 'react-native';
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
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
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
import RadioSelectableOrganism from '../../../../../../components/organisms/RadioSelectableOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import { pick } from '@react-native-documents/picker';
import { useListFacultyDetailsMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

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
};

const AddFacultyDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listFacultyDetailsApi] = useListFacultyDetailsMutation();
  const [addHostelFloorApi] = useAddHostelFloorMutation();
  const [updateHostelFloorApi] = useUpdateHostelFloorMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      !isNullUndefined(item) ? 'Edit Faculty Details' : 'Add Faculty Details',
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
    getFacultyType();
    if (!item) return;

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId] || {};

    // getHostelName(selectedLocation.name);
    // getGenderTypeName(selectedLocation.name);

    // setForm((prev: any) => ({
    //   ...prev,

    //   bipardLocation: selectedLocation,

    //   hostel: {
    //     id: item.selectHostelNameId,
    //     name: item.selectHostelName,
    //   },

    //   genderType: {
    //     id: item.floorType,
    //     name: item.floorType,
    //   },

    //   nameOfFloor: item.nameOfFloors ?? '',
    //   noOfRooms: item.noOfRooms?.toString() ?? '',
    // }));
  }, [item]);

  const schema = Yup.object().shape({
    status: Yup.object({
      uri: Yup.string().required('Status is required'),
    }),
    documentCard: Yup.object({
      uri: Yup.string().required('Document is required'),
    }),
    selectedState: Yup.object({
      id: Yup.string().required('State is required'),
    }),
    selectedLocation: Yup.object({
      id: Yup.string().required('Location is required'),
    }),
    panNo: Yup.string()
      .required('Pan Number is required')
      .length(10, 'Pan number must be 10 digits'),
    selectedPayLevel: Yup.object({
      id: Yup.string().required('BIPARD pay level is required'),
    }),
    selectedCategory: Yup.object({
      id: Yup.string().required('Category is required'),
    }),
    mobileNo: Yup.string()
      .required('Mobile Number is required')
      .length(10, 'Mobile number must be 10 digits'),
    emailId: Yup.string().required('Email is required'),
    selectedFacultyName: Yup.object({
      id: Yup.string().required('Faculty name is required'),
    }),
    selectedSaluation: Yup.object({
      id: Yup.string().required('Salutation is required'),
    }),
    bipardLocation: Yup.object({
      id: Yup.string().required('Bipard location is required'),
    }),
    selectedFacultyType: Yup.object({
      id: Yup.string().required('Faculty type is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateFloorDetails();
      } else {
        addFloorDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addFloorDetails = () => {
    setLoader(true);
    let params = {
      id: null,
      bipardCentre: [form.bipardLocation?.name],
      selectHostelName: form.hostel.id,
      nameOfFloors: form.nameOfFloor,
      noOfRooms: form.noOfRooms,
      selectHostelNameShow: '',
      floorType: form.genderType.id,
    };

    addHostelFloorApi(params)
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
  const updateFloorDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      bipardCentre: [form.bipardLocation?.name],
      selectHostelName: form.hostel.id,
      nameOfFloors: form.nameOfFloor,
      noOfRooms: form.noOfRooms,
      selectHostelNameShow: '',
      floorType: form.genderType.id,
    };

    updateHostelFloorApi(params)
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

  const getFacultyType = () => {
    setLoader(true);
    const params = {
      listType: 'select_faculty_type',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('facultyTypeList', res.data);
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

  const getSalutation = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_salutation',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('saluationList', res.data);
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

  const getFaculty = (id: any) => {
    setLoader(true);

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
        setLoader(false);
        const newData = res.data?.data ?? [];

        const modifiedList = newData.map((item: any) => ({
          ...item,
          id: item.id,
          name: `${item.id}, ${item.facultyName}, ${
            item.designation || ''
          }`.trim(),
        }));
        setValue('facultyNameList', modifiedList);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const getCategory = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'faculty_category',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('categoryList', res.data);
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
  const getPayLevel = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_faculty_pay_level',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('payLevelList', res.data);
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
  const getState = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_state_for_faculty_details',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('stateList', res.data);
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

  const handleFileUpload = async () => {
    try {
      const result = await pick({
        type: ['application/pdf'],
        allowMultiSelection: false,
      });

      if (result && result[0]) {
        const file = result[0];

        // file size validation
        const MAX_SIZE = 3 * 1024 * 1024;
        if (file.size && file.size > MAX_SIZE) {
          Toast.show({
            type: 'error',
            text2: strings.file_size_exceeded,
          });
          return;
        }

        const fileData = {
          uri: file.uri,
          fileName: file.name,
          type: file.type,
          size: file.size || 0,
        };

        setForm((prev: any) => ({
          ...prev,
          documentCard: fileData,
        }));
        setErrors({
          ...errors,
          'documentCard.uri': '',
        });

        Toast.show({
          type: 'success',
          text2: `${file.name} ${strings.file_selected}`,
        });
      }
    } catch (err: any) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') return;

      Toast.show({
        type: 'error',
        text2: strings.file_pick_failed,
      });
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
        extraScrollHeight={vh(120)}
      >
        <DropDownOrganism
          label={'Faculty Type'}
          placeholder={'Faculty Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Faculty Type',
              Data: form.facultyTypeList,
              selectedData: form.selectedFacultyType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedFacultyType: data,
                }));

                setErrors({ ...errors, 'selectedFacultyType.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedFacultyType?.name}
          isMandatory
          errorMessage={errors['selectedFacultyType.id']}
        />

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
                }));
                getSalutation(data.name);
                getFaculty(data.name);
                getCategory(data.name);
                getPayLevel(data.name);
                getState(data.name);
                setErrors({ ...errors, 'bipardLocation.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.id']}
        />

        <DropDownOrganism
          label={'Salutation'}
          placeholder={'Salutation'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Salutation',
              Data: form.saluationList,
              selectedData: form.selectedSaluation,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedSaluation: data,
                }));

                setErrors({ ...errors, 'selectedSaluation.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedSaluation?.name}
          isMandatory
          errorMessage={errors['selectedSaluation.id']}
        />
        <DropDownOrganism
          label={'Faculty Name'}
          placeholder={'Faculty Name'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Faculty Name',
              Data: form.facultyNameList,
              selectedData: form.selectedFacultyName,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedFacultyName: data,
                }));

                setErrors({ ...errors, 'selectedFacultyName.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedFacultyName?.name}
          isMandatory
          errorMessage={errors['selectedFacultyName.id']}
        />
        <TextInputOrganisms
          label={'Email'}
          placeholder={'Email'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.emailId}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('emailId', val);
            setErrors({ ...errors, emailId: '' });
          }}
          isMandatory
          errorMessage={errors.emailId}
        />

        <TextInputOrganisms
          label={'Mobile Number'}
          placeholder={'Mobile Number'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={form.mobileNo}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('mobileNo', normalizeNumber(val));
            setErrors({ ...errors, mobileNo: '' });
          }}
          isMandatory
          errorMessage={errors.mobileNo}
          maxLength={10}
          keyboardType="numeric"
        />
        <DropDownOrganism
          label={'Category'}
          placeholder={'Category'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Category',
              Data: form.categoryList,
              selectedData: form.selectedCategory,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedCategory: data,
                }));

                setErrors({ ...errors, 'selectedCategory.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedCategory?.name}
          isMandatory
          errorMessage={errors['selectedCategory.id']}
        />
        <DropDownOrganism
          label={'BIPARD Pay Level'}
          placeholder={'BIPARD Pay Level'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'BIPARD Pay Level',
              Data: form.payLevelList,
              selectedData: form.selectedPayLevel,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedPayLevel: data,
                }));

                setErrors({ ...errors, 'selectedPayLevel.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedPayLevel?.name}
          isMandatory
          errorMessage={errors['selectedPayLevel.id']}
        />

        <TextInputOrganisms
          label={'Pan Number'}
          placeholder={'Pan Number'}
          ref={input3_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.panNo}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('panNo', normalizeLettersAndNumbers(val));
            setErrors({ ...errors, panNo: '' });
          }}
          isMandatory
          errorMessage={errors.panNo}
          maxLength={10}
        />
        <RadioSelectableOrganism
          data={[
            { id: 'Bihar', value: 'Bihar' },
            { id: 'Outside Bihar', value: 'Outside Bihar' },
          ]}
          onSelect={(item: any) => {
            setValue('selectedLocation', item);
            setErrors({ ...errors, 'selectedLocation.id': '' });
          }}
          label={'Location'}
          selectedType={form.selectedLocation}
          typeName={'value'}
          typeId={'id'}
          isMandatory
          errorMessage={errors['selectedLocation.id']}
        />
        {form.selectedLocation?.id === 'Outside Bihar' && (
          <DropDownOrganism
            label={'State'}
            placeholder={'State'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'State',
                Data: form.stateList,
                selectedData: form.selectedState,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedState: data,
                  }));

                  setErrors({ ...errors, 'selectedState.id': '' });
                },
                typeName: 'state',
                typeId: 'id',
              });
            }}
            inputText={form.selectedState?.name}
            isMandatory
            errorMessage={errors['selectedState.id']}
          />
        )}
        <TextAtom style={styles.labelStyle} numberOfLines={2}>
          Upload File
        </TextAtom>
        <TouchableOpacity
          style={[
            styles.uploadBtn,
            {
              borderColor: errors['documentCard.uri']
                ? colors.red
                : colors.grey_1,
            },
          ]}
          activeOpacity={0.8}
          onPress={handleFileUpload}
        >
          <TextAtom numberOfLines={0} style={styles.uploadText}>
            {!isNullUndefined(form.file)
              ? form.documentCard.fileName
              : strings.choose_file}
          </TextAtom>
          <TextAtom style={styles.instructionText}>{'Add File'}</TextAtom>
        </TouchableOpacity>
        <RadioSelectableOrganism
          data={[
            { id: 'Active', value: 'Active' },
            { id: 'Inactive', value: 'Inactive' },
          ]}
          onSelect={(item: any) => {
            setValue('status', item);
            setErrors({ ...errors, 'status.id': '' });
          }}
          label={'Status'}
          selectedType={form.status}
          typeName={'value'}
          typeId={'id'}
          isMandatory
          errorMessage={errors['status.id']}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddFacultyDetails;

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
});
