import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { Keyboard, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { pick, types } from '@react-native-documents/picker';
import { CommonActions } from '@react-navigation/native';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TextInputOrganisms from '../../../../../components/organisms/TextInputOrganisms';
import DateInputOrganism from '../../../../../components/organisms/DateInputOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import { useSubmitNoticeResponseMutation } from '../../../../../injectEndpointsTrainee/showCauseNoticeEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const ShowCauseNoticeEdit = (props: Props) => {
  const { navigation } = props;
  const data = props.route?.params?.data;
  const [submitNoticeResponseApi] = useSubmitNoticeResponseMutation();

  const input1_ref: any = createRef();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    category: '',
    title: '',
    description: '',
    dateOfNotice: '',
    noticeStatus: '',
    response: '',
    uploadFile: {},
    userUploadedFile: '',
    hasResponded: '',
    id: '',
  });
  const [errors, setErrors] = useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.show_cause_notice_edit);
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    if (data) {
      setForm({
        category: data.category || '',
        title: data.title || '',
        description: data.description || '',
        dateOfNotice: moment(data.dateOfNotice).format('DD-MM-YYYY') || '',
        noticeStatus: data.noticeStatus || '',
        response: data.response || '',
        userUploadedFile: data.userUploadedFile || '',
        hasResponded: data.hasResponded || 'No',
        id: data.id || '',
      });
    }
  }, [data]);

  const schema = Yup.object().shape({
    // uploadFile: Yup.object({
    //   uri: Yup.string().required('File is required'),
    // }),
    response: Yup.string().required(strings.response_required),
  });

  const setValue = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const isResponded = form.hasResponded === 'Yes';

  const handleFileUpload = async () => {
    try {
      const result = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
      });

      if (result?.[0]) {
        const file = result[0];

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
          type: file.type || 'application/pdf',
          size: file.size || 0,
        };

        setValue('uploadFile', fileData);

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

  const finalSubmitResponse = async () => {
    try {
      schema.validateSync(form);
      setLoader(true);

      const formData = new FormData();
      formData.append('responseId', form?.id);
      formData.append('response', form?.response);
      formData.append('file', {
        uri: form.uploadFile.uri,
        name: form.uploadFile.fileName || 'response.pdf',
        type: form.uploadFile.type || 'application/pdf',
      } as any);

      const res: any = await submitNoticeResponseApi(formData).unwrap();

      Toast.show({
        type: 'success',
        text2: res?.data?.message || strings.response_submitted,
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: screensName.ShowCauseNotice,
            },
          ],
        }),
      );
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        setErrors({ [err.path]: err.message });
      } else {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || strings.something_went_wrong,
        });
      }
    } finally {
      setLoader(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
        contentContainerStyle={{ marginTop: vh(20) }}
      >
        <TextInputOrganisms
          label={strings.category}
          value={form.category}
          editable={false}
        />
        <TextInputOrganisms
          label={strings.title}
          value={form.title}
          editable={false}
        />
        <TextInputOrganisms
          label={strings.description}
          value={form.description}
          editable={false}
        />

        <DateInputOrganism
          label={strings.date_of_notice}
          placeholder={strings.date_of_notice}
          value={form.dateOfNotice}
          isDisable
          onChangeText={() => {}}
        />

        <TextAtom style={styles.statusLabel}>{strings.status}</TextAtom>
        <ViewAtom style={styles.statusWrapper}>
          <ViewAtom
            style={[
              styles.statusCircleOuter,
              {
                borderColor:
                  form.noticeStatus === 'Active' ? colors.green : colors.red,
              },
            ]}
          >
            <ViewAtom
              style={[
                styles.statusCircleInner,
                {
                  backgroundColor:
                    form.noticeStatus === 'Active' ? colors.green : colors.red,
                },
              ]}
            />
          </ViewAtom>

          <TextAtom
            style={[
              styles.statusText,
              {
                color:
                  form.noticeStatus === 'Active' ? colors.green : colors.red,
              },
            ]}
          >
            {form.noticeStatus === 'Active' ? 'Active' : 'In Active'}
          </TextAtom>
        </ViewAtom>

        <TextInputOrganisms
          label={strings.response}
          placeholder={strings.response}
          ref={input1_ref}
          value={form.response}
          autoCapitalize="none"
          returnKeyType="done"
          onChangeText={(val: string) => {
            setValue('response', val);
            setErrors({ ...errors, response: '' });
          }}
          editable={!isResponded}
          disabled={isResponded}
          isMandatory={!isResponded}
          errorMessage={errors.response}
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        <TextAtom style={styles.fileLabel}>
          {isResponded ? strings.view_file : strings.upload_file}{' '}
          {!isResponded && <TextAtom style={styles.mandatoryStar}>*</TextAtom>}
        </TextAtom>

        {isResponded ? (
          <TouchableOpacity
            style={[styles.uploadBtn, { borderColor: colors.grey_1 }]}
            activeOpacity={0.8}
            onPress={() => {
              if (form.userUploadedFile) {
                Linking.openURL(form.userUploadedFile);
              } else {
                Toast.show({
                  type: 'info',
                  text2: strings.no_file_available,
                });
              }
            }}
          >
            <TextAtom style={[styles.uploadText, { color: colors.primary }]}>
              {strings.view_uploaded_file}
            </TextAtom>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              {
                borderColor: errors['uploadFile.uri']
                  ? colors.red
                  : colors.grey_1,
              },
            ]}
            activeOpacity={0.8}
            onPress={handleFileUpload}
          >
            <TextAtom style={styles.uploadText}>
              {form.uploadFile?.fileName
                ? form.uploadFile?.fileName
                : strings.choose_file}
            </TextAtom>
            <TextAtom style={styles.instructionText}>
              {strings.add_pdf}
            </TextAtom>
          </TouchableOpacity>
        )}
      </KeyboardAwareScrollView>

      {!isResponded && (
        <ButtonOrganism onPress={finalSubmitResponse} bttnText="Submit" />
      )}
    </SafeAreaView>
  );
};

export default ShowCauseNoticeEdit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  fileLabel: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    fontSize: vw(14),
    marginBottom: vh(6),
    marginLeft: vw(18),
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
  mandatoryStar: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Medium,
    color: colors.red,
  },
  errorMessage: {
    color: colors.red,
    marginLeft: vw(6),
    fontSize: vw(12),
    width: vw(328),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh(5),
  },
  statusLabel: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    fontSize: vw(14),
    marginBottom: vh(6),
    marginLeft: vw(18),
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: vw(20),
    marginBottom: vh(15),
  },
  statusCircleOuter: {
    width: vw(20),
    height: vw(20),
    borderRadius: vw(10),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw(8),
  },
  statusCircleInner: {
    width: vw(10),
    height: vw(10),
    borderRadius: vw(5),
  },
  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
});
