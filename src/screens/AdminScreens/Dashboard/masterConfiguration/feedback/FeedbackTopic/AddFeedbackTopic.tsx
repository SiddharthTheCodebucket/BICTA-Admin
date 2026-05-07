/* eslint-disable react-hooks/exhaustive-deps */
import { Keyboard, StyleSheet } from 'react-native';
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
import {
  useAddFeedbackTopicMutation,
  useUpdateFeedbackTopicMutation,
} from '../../../../../../injectEndpoints/feedbackManagementEndpoints';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  bipardLocationList: [],
  bipardLocation: {},
  feedbackCategoryList: [],
  selectedFeedbackCategory: {},
  feedbackSubCategoryList: [],
  selectedFeedbackSubCategory: {},
  feedbackTopic: '',
  description: '',
  thumbnail: {},
  status: {},
};

const AddFeedbackTopic = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addFeedbackTopicApi] = useAddFeedbackTopicMutation();
  const [updateFeedbackTopicApi] = useUpdateFeedbackTopicMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Feedback Topic' : 'Update Feedback Topic',
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

    setForm((prev: any) => ({
      ...prev,
      bipardLocation: locationMap[item.tenantId] || {},
      feedbackTopic: item.feedbackTopic || '',
      description: item.description || '',
      status: {
        id: item.status,
        value: item.status,
      },
      thumbnail: item.thumbnail ? { uri: item.thumbnail } : {},
    }));
  }, [item]);
  useEffect(() => {
    if (!form.bipardLocation?.id) return;

    getFeedbackCategory(form.bipardLocation.id);
  }, [form.bipardLocation?.id]);

  useEffect(() => {
    if (!form.selectedFeedbackCategory?.id) return;

    getFeedbackSubCategory(form.selectedFeedbackCategory.id);
  }, [form.selectedFeedbackCategory?.id]);

  const schema = Yup.object().shape({
    status: Yup.object({
      id: Yup.string().required('Status is required'),
    }),
    description: Yup.string().required('Description is required'),
    feedbackTopic: Yup.string().required('Feedback Topic is required'),
    selectedFeedbackSubCategory: Yup.object({
      id: Yup.string().required('Feedback Sub Category is required'),
    }),
    selectedFeedbackCategory: Yup.object({
      id: Yup.string().required('Feedback Category is required'),
    }),
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
        updateFeedbackTopic();
      } else {
        addFeedbackTopic();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addFeedbackTopic = () => {
    setLoader(true);

    const formData = new FormData();

    formData.append(
      'bipardCentre',
      JSON.stringify([form.bipardLocation?.name]),
    );
    formData.append('feedbackCategory', form.selectedFeedbackCategory.id);
    formData.append('feedbackSubCategory', form.selectedFeedbackSubCategory.id);
    formData.append('feedbackTopic', form.feedbackTopic);
    formData.append('description', form.description);
    formData.append('status', form.status.id);
    if (form.thumbnail?.uri) {
      formData.append('thumbnail', {
        uri: form.thumbnail.uri,
        name: form.thumbnail.fileName,
        type: form.thumbnail.type,
      });
    }

    addFeedbackTopicApi(formData)
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

  const updateFeedbackTopic = () => {
    setLoader(true);
    const isLocalImage = (uri?: string) => {
      return uri?.startsWith('file://');
    };
    const formData = new FormData();
    formData.append('id', item.id);
    formData.append(
      'bipardCentre',
      JSON.stringify([form.bipardLocation?.name]),
    );
    formData.append('feedbackCategory', form.selectedFeedbackCategory.id);
    formData.append('feedbackSubCategory', form.selectedFeedbackSubCategory.id);
    formData.append('feedbackTopic', form.feedbackTopic);
    formData.append('description', form.description);
    formData.append('status', form.status.id);

    if (form.thumbnail?.uri && isLocalImage(form.thumbnail.uri)) {
      formData.append('thumbnail', {
        uri: form.thumbnail.uri,
        name: form.thumbnail.fileName || 'thumbnail.jpg',
        type: form.thumbnail.type || 'image/jpeg',
      });
    } else if (form.thumbnail?.uri) {
      formData.append('thumbnail', form.thumbnail?.uri);
    }

    updateFeedbackTopicApi(formData)
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
          } else if (tenantId === 2) {
            setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
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

  const getFeedbackCategory = (center: string) => {
    setLoader(true);
    const params = {
      listType: 'feedback_category',
      bipardCentre: [center],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('feedbackCategoryList', res.data);
        if (item?.feedbackCategoryId) {
          const selected = res.data.find(
            (i: any) => i.id === item.feedbackCategoryId,
          );

          if (selected) {
            setValue('selectedFeedbackCategory', selected);
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

  const getFeedbackSubCategory = (id: string) => {
    setLoader(true);
    const params = {
      listType: 'feedback_sub_category',
      bipardCentre: [form.bipardLocation.id],
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('feedbackSubCategoryList', res.data);
        if (item?.feedbackSubCategoryId) {
          const selected = res.data.find(
            (i: any) => i.id === item.feedbackSubCategoryId,
          );

          if (selected) {
            setValue('selectedFeedbackSubCategory', selected);
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
                  selectedFeedbackCategory: {},
                  selectedFeedbackSubCategory: {},
                }));
                getFeedbackCategory(data.id);
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
          label={'Feedback Category'}
          placeholder={'Feedback Category'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Feedback Category',
              Data: form.feedbackCategoryList,
              selectedData: form.selectedFeedbackCategory,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedFeedbackCategory: data,
                  selectedFeedbackSubCategory: {},
                }));
                getFeedbackSubCategory(data.id);
                setErrors({ ...errors, 'selectedFeedbackCategory.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedFeedbackCategory?.name}
          isMandatory
          errorMessage={errors['selectedFeedbackCategory.id']}
        />
        <DropDownOrganism
          label={'Feedback Sub Category'}
          placeholder={'Feedback Sub Category'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Feedback Sub Category',
              Data: form.feedbackSubCategoryList,
              selectedData: form.selectedFeedbackSubCategory,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedFeedbackSubCategory: data,
                }));
                setErrors({ ...errors, 'selectedFeedbackSubCategory.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedFeedbackSubCategory?.name}
          isMandatory
          errorMessage={errors['selectedFeedbackSubCategory.id']}
        />
        <TextInputOrganisms
          label={'Feedback Topic'}
          placeholder={'Feedback Topic'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.feedbackTopic}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('feedbackTopic', val);
            setErrors({ ...errors, feedbackTopic: '' });
          }}
          isMandatory
          errorMessage={errors.feedbackTopic}
        />

        <TextInputOrganisms
          label={'Description'}
          placeholder={'Description'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.description}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('description', val);
            setErrors({ ...errors, description: '' });
          }}
          isMandatory
          errorMessage={errors.description}
        />

        <ImageUploadOrganism
          label={'Thumbnail'}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            setForm((prev: any) => ({
              ...prev,
              thumbnail: file,
            }));
          }}
          defaultImage={form.thumbnail?.uri}
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

export default AddFeedbackTopic;

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
