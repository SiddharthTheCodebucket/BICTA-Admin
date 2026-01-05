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
      !isNullUndefined(item)
        ? strings.lms.facultyManagement.details.editTitle
        : strings.lms.facultyManagement.details.addTitle,
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
      1: { id: strings.dashboardIndex.gaya, name: strings.dashboardIndex.gaya },
      2: {
        id: strings.dashboardIndex.patna,
        name: strings.dashboardIndex.patna,
      },
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
      id: Yup.string().required(
        strings.lms.facultyManagement.validation.statusRequired,
      ),
    }),
    documentCard: Yup.object({
      uri: Yup.string().required(
        strings.lms.facultyManagement.validation.documentRequired,
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

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateFacultyRecord();
      } else {
        createFacultyRecord();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const createFacultyRecord = () => {
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
          text2: err?.data?.message || strings.something_went_wrong,
        });
        setLoader(false);
      });
  };
  const updateFacultyRecord = () => {
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
          text2: err?.data?.message || strings.something_went_wrong,
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
          text2: err.data?.message || strings.something_went_wrong,
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
          text2: err.data?.message || strings.something_went_wrong,
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
          text2: err.data?.message || strings.something_went_wrong,
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
          text2: err.data?.message || strings.something_went_wrong,
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
          text2: err.data?.message || strings.something_went_wrong,
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
          text2: err.data?.message || strings.something_went_wrong,
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
          text2: err.data?.message || strings.something_went_wrong,
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
        style={styles.flex1}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        <DropDownOrganism
          label={strings.lms.facultyManagement.details.facultyType}
          placeholder={strings.lms.facultyManagement.details.facultyType}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.lms.facultyManagement.details.facultyType,
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
          label={strings.lms.facultyManagement.details.bipardLocation}
          placeholder={strings.lms.facultyManagement.details.bipardLocation}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.lms.facultyManagement.details.bipardLocation,
              Data: [
                {
                  id: strings.dashboardIndex.gaya,
                  name: strings.dashboardIndex.gaya,
                },
                {
                  id: strings.dashboardIndex.patna,
                  name: strings.dashboardIndex.patna,
                },
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
          label={strings.lms.facultyManagement.details.salutation}
          placeholder={strings.lms.facultyManagement.details.salutation}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.lms.facultyManagement.details.salutation,
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
          label={strings.lms.facultyManagement.details.facultyName}
          placeholder={strings.lms.facultyManagement.details.facultyName}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.lms.facultyManagement.details.facultyName,
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
          label={strings.lms.facultyManagement.details.email}
          placeholder={strings.lms.facultyManagement.details.email}
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
          label={strings.lms.facultyManagement.details.mobileNumber}
          placeholder={strings.lms.facultyManagement.details.mobileNumber}
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
          label={strings.lms.facultyManagement.details.category}
          placeholder={strings.lms.facultyManagement.details.category}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.lms.facultyManagement.details.category,
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
          label={strings.lms.facultyManagement.details.payLevel}
          placeholder={strings.lms.facultyManagement.details.payLevel}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.lms.facultyManagement.details.payLevel,
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
          label={strings.lms.facultyManagement.details.panNumber}
          placeholder={strings.lms.facultyManagement.details.panNumber}
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
            {
              id: strings.lms.facultyManagement.details.bihar,
              value: strings.lms.facultyManagement.details.bihar,
            },
            {
              id: strings.lms.facultyManagement.details.outsideBihar,
              value: strings.lms.facultyManagement.details.outsideBihar,
            },
          ]}
          onSelect={(item: any) => {
            setValue('selectedLocation', item);
            setErrors({ ...errors, 'selectedLocation.id': '' });
          }}
          label={strings.lms.facultyManagement.details.location}
          selectedType={form.selectedLocation}
          typeName={'value'}
          typeId={'id'}
          isMandatory
          errorMessage={errors['selectedLocation.id']}
        />
        {form.selectedLocation?.id ===
          strings.lms.facultyManagement.details.outsideBihar && (
          <DropDownOrganism
            label={strings.lms.facultyManagement.details.state}
            placeholder={strings.lms.facultyManagement.details.state}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: strings.lms.facultyManagement.details.state,
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
          {strings.lms.facultyManagement.details.uploadFile}
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
            {!isNullUndefined(form.documentCard?.uri)
              ? form.documentCard.fileName
              : strings.choose_file}
          </TextAtom>
          <TextAtom style={styles.instructionText}>
            {strings.lms.facultyManagement.details.addFile}
          </TextAtom>
        </TouchableOpacity>
        <RadioSelectableOrganism
          data={[
            {
              id: strings.lms.facultyManagement.details.active,
              value: strings.lms.facultyManagement.details.active,
            },
            {
              id: strings.lms.facultyManagement.details.inactive,
              value: strings.lms.facultyManagement.details.inactive,
            },
          ]}
          onSelect={(item: any) => {
            setValue('status', item);
            setErrors({ ...errors, 'status.id': '' });
          }}
          label={strings.lms.facultyManagement.details.status}
          selectedType={form.status}
          typeName={'value'}
          typeId={'id'}
          isMandatory
          errorMessage={errors['status.id']}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism
        onPress={onSubmit}
        bttnText={
          item
            ? strings.lms.facultyManagement.details.update
            : strings.lms.facultyManagement.details.add
        }
      />
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
  flex1: { flex: 1 },
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
