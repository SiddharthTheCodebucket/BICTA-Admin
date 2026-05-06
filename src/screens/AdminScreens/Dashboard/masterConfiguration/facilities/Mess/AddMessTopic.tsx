import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import {
  colors,
  fonts,
  images,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import {
  FormDropdownFieldWithTitle,
  FormFileUploadWithTitle,
  FormGradientButton,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';
import { globalStyles } from '../../../../../../utils/globalStyles';
import {
  useCommonDropdownListMutation,
  useCommonFileUploadMutation,
} from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useMessManagementAddMessTopicMutation,
  useMessManagementUpdateMessTopicMutation,
} from '../../../../../../injectEndpoints/messManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

type FileData = {
  uri: string;
  name: string;
  type?: string | null;
  size?: number | null;
};

const locationOptions = [
  { id: 'Gaya', name: 'Gaya' },
  { id: 'Patna', name: 'Patna' },
];

const initialLocation = (tenantId?: number) => {
  if (tenantId === 1) return locationOptions[0];
  if (tenantId === 2) return locationOptions[1];
  return null;
};

const thumbnailValue = (item: any) => {
  const thumbnail = item?.thumbnail;
  if (typeof thumbnail === 'string') return thumbnail;
  return thumbnail?.url ?? item?.thumbnailUrl ?? null;
};

const AddMessTopic = ({ navigation, route }: Props) => {
  const item = route.params?.item;
  const isEdit = !!item;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData?.user?.[0]?.tenantId;

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [commonFileUploadApi] = useCommonFileUploadMutation();
  const [addApi] = useMessManagementAddMessTopicMutation();
  const [updateApi] = useMessManagementUpdateMessTopicMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<{
    bipardLocation: any;
    messList: any[];
    selectedMess: any;
    topic: string;
    description: string;
    thumbnail: FileData | null;
    uploadedThumbnail: any;
  }>({
    bipardLocation: initialLocation(tenantId),
    messList: [],
    selectedMess: null,
    topic: '',
    description: '',
    thumbnail: null,
    uploadedThumbnail: null,
  });
  const [errors, setErrors] = useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Facilities',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const getMessList = useCallback(
    (centreId: any) => {
      if (!centreId) return;
      setLoader(true);
      commonDropdownApi({
        listType: 'select_mess_for_mess_topic',
        bipardCentre: [centreId],
        replacements: ['%%'],
      })
        .unwrap()
        .then((res: any) => {
          setForm(prev => ({
            ...prev,
            messList: res.data || [],
          }));
          setLoader(false);
        })
        .catch((err: any) => {
          setLoader(false);
          Toast.show({
            type: 'error',
            text2: err?.data?.message || strings.something_went_wrong,
          });
        });
    },
    [commonDropdownApi],
  );

  useEffect(() => {
    if (form.bipardLocation?.id) {
      getMessList(form.bipardLocation.id);
    }
  }, [form.bipardLocation?.id, getMessList]);

  useEffect(() => {
    if (!item) return;
    const bipardLocation =
      initialLocation(item?.tenantId) ?? initialLocation(tenantId);
    setForm(prev => ({
      ...prev,
      bipardLocation,
      selectedMess: item?.messId
        ? { id: item.messId, name: item.messName }
        : item?.mess
        ? item.mess
        : null,
      topic: item?.topic ?? item?.topicName ?? '',
      description: item?.description ?? '',
      uploadedThumbnail: thumbnailValue(item),
    }));
    if (bipardLocation?.id) {
      getMessList(bipardLocation.id);
    }
  }, [getMessList, item, tenantId]);

  const schema = Yup.object().shape({
    bipardLocation: Yup.object({
      name: Yup.string().required('BIPARD location is required'),
    })
      .nullable()
      .required('BIPARD location is required'),
    selectedMess: Yup.object({
      id: Yup.string().required('Mess is required'),
    })
      .nullable()
      .required('Mess is required'),
    topic: Yup.string().trim().required('Topic is required'),
    description: Yup.string().trim().required('Description is required'),
    thumbnail: isEdit
      ? Yup.mixed().nullable()
      : Yup.mixed().required('Thumbnail is required'),
  });

  const validate = () => {
    try {
      schema.validateSync(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err: any) {
      const nextErrors: any = {};
      if (err?.inner?.length) {
        err.inner.forEach((validationErr: any) => {
          if (validationErr.path && !nextErrors[validationErr.path]) {
            nextErrors[validationErr.path] = validationErr.message;
          }
        });
      } else if (err?.path) {
        nextErrors[err.path] = err.message;
      }
      setErrors(nextErrors);
      return false;
    }
  };

  const uploadThumbnail = async () => {
    if (!form.thumbnail) return form.uploadedThumbnail;

    const formData = new FormData();
    formData.append('document', {
      uri: form.thumbnail.uri,
      name: form.thumbnail.name,
      type: form.thumbnail.type || 'image/jpeg',
    } as any);

    const res = await commonFileUploadApi(formData).unwrap();
    return res?.data;
  };

  const handleSuccess = (res: any) => {
    route.params?.onDone?.();
    navigation.goBack();
    Toast.show({
      type: 'success',
      text2: res?.data?.message || (isEdit ? 'Mess topic updated' : 'Mess topic added'),
    });
    setLoader(false);
  };

  const handleError = (err: any) => {
    setLoader(false);
    Toast.show({
      type: 'error',
      text2: err?.data?.message || strings.something_went_wrong,
    });
  };

  const onSubmit = async () => {
    if (!validate()) return;

    setLoader(true);
    try {
      const uploadedThumbnail = await uploadThumbnail();
      const params = {
        id: isEdit ? item?.id : null,
        bipardCentre: [form.bipardLocation?.name],
        mess: form.selectedMess?.id,
        topic: form.topic.trim(),
        description: form.description.trim(),
        thumbnail: uploadedThumbnail,
        status: 'Active',
      };

      const request = isEdit ? updateApi(params) : addApi(params);
      request.unwrap().then(handleSuccess).catch(handleError);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <TouchableAtom
          style={styles.titleRow}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <ImageAtom source={images.arrow_back} style={styles.backIcon} />
          <TextAtom style={styles.pageTitle}>
            {isEdit ? 'Edit Mess Topic' : 'Add Mess Topic'}
          </TextAtom>
        </TouchableAtom>

        <View style={globalStyles.adminFormCard}>
          <FormDropdownFieldWithTitle
            title="BIPARD Location"
            isMandatory
            data={locationOptions}
            value={form.bipardLocation?.id}
            placeholder="Select"
            disabled={tenantId !== 3}
            onChange={selected => {
              setForm(prev => ({
                ...prev,
                bipardLocation: selected,
                selectedMess: null,
              }));
              setErrors((prev: any) => ({
                ...prev,
                bipardLocation: '',
                'bipardLocation.name': '',
              }));
            }}
            errorMessage={errors['bipardLocation.name'] || errors.bipardLocation}
          />
          <FormDropdownFieldWithTitle
            title="Select Mess"
            isMandatory
            data={form.messList}
            value={form.selectedMess?.id}
            placeholder="Select"
            onChange={selected => {
              setForm(prev => ({ ...prev, selectedMess: selected }));
              setErrors((prev: any) => ({
                ...prev,
                selectedMess: '',
                'selectedMess.id': '',
              }));
            }}
            errorMessage={errors['selectedMess.id'] || errors.selectedMess}
          />
          <FormTextInputWithTitle
            title="Topic"
            isMandatory
            placeholder="Enter"
            value={form.topic}
            onChangeText={topic => {
              setForm(prev => ({ ...prev, topic }));
              setErrors((prev: any) => ({ ...prev, topic: '' }));
            }}
            errorMessage={errors.topic}
          />
          <FormTextInputWithTitle
            title="Description"
            isMandatory
            placeholder="Enter"
            value={form.description}
            multiline
            inputStyle={styles.descriptionInput}
            onSubmitEditing={() => Keyboard.dismiss()}
            onChangeText={description => {
              setForm(prev => ({ ...prev, description }));
              setErrors((prev: any) => ({ ...prev, description: '' }));
            }}
            errorMessage={errors.description}
          />
          <FormFileUploadWithTitle
            title="Upload Thumbnail"
            isMandatory={!isEdit}
            accept={['image/jpeg', 'image/png', 'image/jpg']}
            fileName={form.thumbnail?.name}
            onFileSelected={file => {
              setForm(prev => ({ ...prev, thumbnail: file }));
              setErrors((prev: any) => ({ ...prev, thumbnail: '' }));
            }}
            onFileRemove={() => {
              setForm(prev => ({ ...prev, thumbnail: null }));
            }}
            errorMessage={errors.thumbnail}
          />
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.footerRow}>
        <FormWhiteButton
          title="Cancel"
          onPress={() => navigation.goBack()}
          containerStyle={styles.footerButton}
          buttonStyle={styles.whiteButton}
        />
        <FormGradientButton
          title={isEdit ? 'Update' : 'Add'}
          onPress={onSubmit}
          loading={loader}
          containerStyle={styles.footerButton}
          buttonStyle={styles.gradientButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddMessTopic;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  scroll: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(120),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(12),
  },
  backIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.new_ui_heading,
    marginRight: vw(8),
  },
  pageTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  descriptionInput: {
    minHeight: vh(86),
    textAlignVertical: 'top',
    paddingTop: vh(8),
  },
  footerRow: {
    position: 'absolute',
    left: vw(12),
    right: vw(12),
    bottom: vh(36),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    width: '48.5%',
  },
  whiteButton: {
    height: vh(40),
    borderRadius: vw(6),
    borderColor: colors.new_ui_heading,
  },
  gradientButton: {
    height: vh(40),
    borderRadius: vw(6),
  },
});
