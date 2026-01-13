import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
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
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import RadioSelectableOrganism from '../../../../../../components/organisms/RadioSelectableOrganism';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';
import {
  useCommunicationAddAnnouncementMutation,
  useCommunicationUpdateAnnouncementMutation,
} from '../../../../../../injectEndpoints/communicationManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  bipardLocationList: [],
  bipardLocation: {},
  trainingList: [],
  selectedTraining: [],
  categoryList: [],
  selectedCategory: {},
  title: '',
  desc: '',
  file: {},
  startDate: '',
  endDate: '',
  status: {},
};

const AddNotice = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addAnnouncementDetailsApi] = useCommunicationAddAnnouncementMutation();
  const [updateAnnouncementDetailsApi] =
    useCommunicationUpdateAnnouncementMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item)
        ? 'Add Announcement Data'
        : 'Update Announcement Data',
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

    if (!item) return;

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId];

    const trainingArray =
      item.trainingNameId?.map((id: number, index: number) => ({
        id,
        name: item.trainingName?.[index],
      })) || [];

    setForm((prev: any) => ({
      ...prev,

      bipardLocation: selectedLocation,
      selectedTraining: trainingArray,
      selectedCategory: {
        id: item.categoryId,
        name: item.category,
      },
      title: item.title,
      desc: item.description,
      file: item.file
        ? {
            uri: item.file,
            name: item.file.split('/').pop(),
            type: 'image/*',
          }
        : {},
      startDate: moment(item.startDate).format('DD-MM-YYYY'),
      endDate: moment(item.endDate).format('DD-MM-YYYY'),

      status: {
        id: item.status,
        value: item.status,
      },
    }));
    getTrainingList(selectedLocation.name);
    getCategoryList(selectedLocation.name);
  }, [item]);

  const schema = Yup.object().shape({
    status: isNullUndefined(item)
      ? Yup.object({
          id: Yup.string().required('Status is required'),
        })
      : Yup.mixed().notRequired(),
    endDate: Yup.string()
      .required('End Date is required')
      .test('valid-end-date', 'End Date cannot be before today', value =>
        value
          ? moment(value, 'DD-MM-YYYY').isSameOrAfter(moment(), 'day')
          : false,
      )
      .when('startDate', (startDate, schema) =>
        startDate
          ? schema.test(
              'after-start-date',
              'End Date cannot be before Start Date',
              value =>
                value
                  ? moment(value, 'DD-MM-YYYY').isSameOrAfter(
                      moment(startDate, 'DD-MM-YYYY'),
                      'day',
                    )
                  : false,
            )
          : schema,
      ),

    startDate: Yup.string().required('Start Date is required'),
    selectedCategory: Yup.object({
      id: Yup.string().required('Category is required'),
    }),
    selectedTraining: Yup.array()
      .min(1, 'At least one training is required')
      .required('At least one training is required'),
    bipardLocation: Yup.object({
      name: Yup.string().required(
        strings.hostelManagement.addBedDetails.required.location,
      ),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateBedDetails();
      } else {
        addNoticeDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addNoticeDetails = () => {
    setLoader(true);

    const formData = new FormData();
    formData.append('id', null);
    formData.append(
      'trainingName',
      JSON.stringify(form.selectedTraining.map((t: any) => t.id)),
    );
    formData.append(
      'bipardCentre',
      JSON.stringify([form.bipardLocation?.name]),
    );
    formData.append('category', form.selectedCategory?.id);
    formData.append('title', form.title);
    formData.append('description', form.desc);
    formData.append(
      'startDate',
      moment(form.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formData.append(
      'endDate',
      moment(form.endDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formData.append('status', form.status?.id);
    if (form.file?.uri) {
      formData.append('file', {
        uri: form.file.uri,
        name: form.file.name || 'upload.pdf',
        type: form.file.type || 'application/pdf',
      } as any);
    }
    addAnnouncementDetailsApi(formData)
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

  const updateBedDetails = () => {
    setLoader(true);

    const formData = new FormData();

    formData.append('id', item.id);

    formData.append(
      'trainingName',
      JSON.stringify(form.selectedTraining.map((t: any) => t.id)),
    );

    formData.append(
      'bipardCentre',
      JSON.stringify([form.bipardLocation?.name]),
    );

    formData.append('category', form.selectedCategory?.id);
    formData.append('title', form.title);
    formData.append('description', form.desc);

    formData.append(
      'startDate',
      moment(form.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );

    formData.append(
      'endDate',
      moment(form.endDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );

    formData.append('status', form.status?.id);

    if (form.file?.uri) {
      if (form.file.uri.startsWith('http')) {
        formData.append('file', form.file.uri);
      } else {
        formData.append('file', {
          uri: form.file.uri,
          name: form.file.name || 'upload.png',
          type: form.file.type || 'image/png',
        } as any);
      }
    }

    updateAnnouncementDetailsApi(formData)
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
        if (!item) {
          if (tenantId === 1) {
            setValue('bipardLocation', { id: 'Gaya', name: 'Gaya' });
            getTrainingList('Gaya');
            getCategoryList('Gaya');
          } else if (tenantId === 2) {
            setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
            getTrainingList('Patna');
            getCategoryList('Patna');
          }
        }

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

  const getTrainingList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_training_for_announcement',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('trainingList', res.data);
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

  const getCategoryList = (id: string) => {
    setLoader(true);

    const params = {
      listType: 'communication_announcement_category',
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
        });
      });
  };
  const addTraining = (item: any) => {
    const exists = form.selectedTraining?.some((t: any) => t?.id === item.id);

    if (exists) return;

    const updatedTraining = [...form.selectedTraining, item];

    setForm((prev: any) => ({
      ...prev,
      selectedTraining: updatedTraining,
    }));
  };

  const removeTraining = (id: number) => {
    const updatedTraining = form.selectedTraining.filter(
      (item: any) => item.id !== id,
    );

    setForm((prev: any) => ({
      ...prev,
      selectedTraining: updatedTraining,
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
          label={strings.hostelManagement.addBedDetails.bipardLocation}
          placeholder={strings.hostelManagement.addBedDetails.bipardLocation}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.addBedDetails.bipardLocation,
              Data: [
                { id: 'Gaya', name: 'Gaya' },
                { id: 'Patna', name: 'Patna' },
              ],
              selectedData: form.bipardLocationList,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  bipardLocation: data,
                }));
                getTrainingList(data.name);
                getCategoryList(data.name);

                setErrors({ ...errors, 'bipardLocation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.name']}
          isDisabled={tenantId !== 3}
        />

        <DropDownOrganism
          label={'Training'}
          placeholder={'Training'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training',
              Data: form.trainingList,
              selectedData: {},
              setSelectedData: (data: any) => {
                addTraining(data);
                setErrors({ ...errors, selectedTraining: '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedTraining?.name}
          isMandatory
          errorMessage={errors.selectedTraining}
        />

        <ViewAtom style={{ marginTop: vh(0) }}>
          {form.selectedTraining?.length > 0 && (
            <ViewAtom style={styles.permissionScrollWrapper}>
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled
              >
                <ViewAtom style={styles.chipContainer}>
                  {form.selectedTraining.map((item: any) => (
                    <ViewAtom key={item?.id} style={styles.chip}>
                      <TextAtom style={styles.chipText}>{item?.name}</TextAtom>

                      <TouchableOpacity
                        onPress={() => removeTraining(item.id)}
                        style={styles.crossBtn}
                      >
                        <TextAtom style={styles.crossText}>✕</TextAtom>
                      </TouchableOpacity>
                    </ViewAtom>
                  ))}
                </ViewAtom>
              </KeyboardAwareScrollView>
            </ViewAtom>
          )}
        </ViewAtom>

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

        <TextInputOrganisms
          label={'Title'}
          placeholder={'Title'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current?.focus()}
          value={form.title}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('title', val);
          }}
        />
        <TextInputOrganisms
          label={'Description'}
          placeholder={'Description'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.desc}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('desc', val);
          }}
        />

        <ImageUploadOrganism
          label={'File'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            setValue('file', file);
          }}
          defaultImage={form.file?.uri}
        />

        <DateInputOrganism
          label={strings.blockedForm.startDate}
          placeholder={strings.blockedForm.startDate}
          value={form.startDate}
          onChangeText={(val: any) => {
            setValue('startDate', val);
            setErrors({ ...errors, startDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.startDate}
        />
        <DateInputOrganism
          label={strings.blockedForm.endDate}
          placeholder={strings.blockedForm.endDate}
          value={form.endDate}
          onChangeText={(val: any) => {
            setValue('endDate', val);
            setErrors({ ...errors, endDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          minDate={(() => {
            const today = moment().startOf('day');

            if (form.startDate) {
              const start = moment(form.startDate, 'DD-MM-YYYY');
              return moment.max(today, start).toDate();
            }

            return today.toDate();
          })()}
          isMandatory
          errorMessage={errors.endDate}
        />

        <RadioSelectableOrganism
          data={[
            {
              id: strings.hostelManagement.addBedDetails.active,
              value: strings.hostelManagement.addBedDetails.active,
            },
            {
              id: strings.hostelManagement.addBedDetails.inactive,
              value: strings.hostelManagement.addBedDetails.inactive,
            },
          ]}
          onSelect={(item: any) => {
            setValue('status', item);
            setErrors({ ...errors, 'status.id': '' });
          }}
          label={strings.hostelManagement.addBedDetails.status}
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
            ? strings.hostelManagement.addBedDetails.update
            : strings.hostelManagement.addBedDetails.add
        }
      />
    </SafeAreaView>
  );
};

export default AddNotice;

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
  permissionScrollWrapper: {
    maxHeight: vh(160),
    width: vw(328),
    alignSelf: 'center',
    marginTop: vh(6),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: vw(6),
    marginHorizontal: vw(6),
  },
  crossText: {
    color: colors.white,
    fontSize: vw(12),
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: vw(328),
    alignSelf: 'center',
    marginTop: vh(5),
    marginBottom: vh(8),
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: vw(14),
    paddingVertical: vh(6),
    paddingHorizontal: vh(12),
    marginRight: vw(8),
    marginTop: vh(6),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    marginLeft: vh(3),
  },

  chipText: {
    color: colors.primary,
    fontSize: vw(12),
    marginRight: vw(6),
  },

  crossBtn: {
    width: vw(18),
    height: vw(18),
    borderRadius: vw(9),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
