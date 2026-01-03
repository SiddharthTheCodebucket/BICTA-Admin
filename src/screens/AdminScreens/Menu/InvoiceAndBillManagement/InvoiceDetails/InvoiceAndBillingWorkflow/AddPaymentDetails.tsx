import {
  Keyboard,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { pick } from '@react-native-documents/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import {
  isNullUndefined,
  normalizeNumber,
} from '../../../../../../utils/CommonFunction';
import moment from 'moment';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import {
  useAddVendorPaymentHistoryMutation,
  useUpdateVendorPaymentHistoryMutation,
} from '../../../../../../injectEndpoints/invoiceManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

type SelectedFile = {
  uri: string;
  fileName: string;
  type: 'application/pdf';
  size: number;
};

const AddPaymentDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const isEdit = props.route.params?.isEdit;

  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const input5_ref: any = createRef();
  const input6_ref: any = createRef();
  const input7_ref: any = createRef();

  const [addVendorPaymentHistoryApi] = useAddVendorPaymentHistoryMutation();
  const [updateVendorPaymentHistoryApi] =
    useUpdateVendorPaymentHistoryMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isEdit ? 'Edit Payment Details' : 'Add Payment Details',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation, isEdit]);

  const [loader, setLoader] = useState(false);

  const [form, setForm] = useState<any>({
    uniqueId: '',
    invoiceAmount: '',
    penaltyAmount: '',
    gstDeductionAmount: '',
    incomeTaxAmount: '',
    excessBillDeductionAmount: '',
    otherAmount: '',
    netPaymentAmount: '',
    date: '',
    paymentRemark: '',
    files: [] as SelectedFile[],
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (item) {
      setForm((prev: any) => ({
        ...prev,
        uniqueId: item.uniqueId ?? prev.uniqueId,
        invoiceAmount: `${item.invoiceAmount ?? prev.invoiceAmount ?? ''}`,
      }));
    }
  }, [item]);

  useEffect(() => {
    if (!isEdit || !item) return;

    const existingFiles: SelectedFile[] = Array.isArray(item.uploadedFile)
      ? item.uploadedFile.map((url: string, index: number) => ({
          uri: url,
          fileName: url.split('/').pop() || `document_${index + 1}.pdf`,
          type: 'application/pdf',
          size: 0,
        }))
      : [];

    setForm((prev: any) => ({
      ...prev,
      paymentId: item.paymentId ?? item.id ?? prev.paymentId,
      uniqueId: item.uniqueId ?? prev.uniqueId,
      invoiceAmount: `${item.invoiceAmount ?? prev.invoiceAmount ?? ''}`,
      penaltyAmount: isNullUndefined(item.penalty)
        ? prev.penaltyAmount
        : `${item.penalty}`,
      gstDeductionAmount: isNullUndefined(item.gstDeduction)
        ? prev.gstDeductionAmount
        : `${item.gstDeduction}`,
      incomeTaxAmount: isNullUndefined(item.incomeTax)
        ? prev.incomeTaxAmount
        : `${item.incomeTax}`,
      excessBillDeductionAmount: isNullUndefined(item.excessBillDeduction)
        ? prev.excessBillDeductionAmount
        : `${item.excessBillDeduction}`,
      otherAmount: isNullUndefined(item.other)
        ? prev.otherAmount
        : `${item.other}`,
      netPaymentAmount: isNullUndefined(item.netPayment)
        ? prev.netPaymentAmount
        : `${item.netPayment}`,
      date: item.paymentDate
        ? moment(item.paymentDate).format('DD-MM-YYYY')
        : prev.date,
      paymentRemark: item.paymentRemark ?? prev.paymentRemark,
      files: existingFiles,
    }));
  }, [isEdit, item]);

  const schema = Yup.object().shape({
    paymentRemark: Yup.string().trim().required('Payment Remark is required'),
    date: Yup.string().required('Date is required'),
    netPaymentAmount: Yup.string().required('Net Payment Amount is required'),
    otherAmount: Yup.string().required('Other Amount is required'),
    excessBillDeductionAmount: Yup.string().required(
      'Excess Bill Deduction Amount is required',
    ),
    incomeTaxAmount: Yup.string().required('Income Tax Amount is required'),
    gstDeductionAmount: Yup.string().required(
      'GST Deduction Amount is required',
    ),
    penaltyAmount: Yup.string().required('Penalty Amount is required'),
  });

  const MAX_SIZE = 3 * 1024 * 1024;

  const handleFileUpload = async () => {
    try {
      const result = await pick({
        type: ['application/pdf'],
        allowMultiSelection: true,
      });

      if (result?.length) {
        const mapped: SelectedFile[] = (result ?? [])
          .map(f => {
            const uri = String(f.uri);
            const fileName = f.name ?? 'document.pdf';
            const type = (f.type ?? 'application/pdf') as 'application/pdf';
            const size = typeof f.size === 'number' ? f.size : 0;

            return { uri, fileName, type, size };
          })
          .filter(f => f.type === 'application/pdf');

        for (const f of mapped) {
          if (f.size > MAX_SIZE) {
            Toast.show({
              type: 'error',
              text2: `${f.fileName} ${strings.file_size_exceeded}`,
            });
            return;
          }
        }

        const mergeUniqueFiles = (
          existing: SelectedFile[] = [],
          incoming: SelectedFile[] = [],
        ): SelectedFile[] => {
          const seen = new Set<string>();
          const result: SelectedFile[] = [];

          for (const f of existing) {
            if (!seen.has(f.uri)) {
              seen.add(f.uri);
              result.push(f);
            }
          }

          for (const f of incoming) {
            if (!seen.has(f.uri)) {
              seen.add(f.uri);
              result.push(f);
            }
          }

          return result;
        };

        setForm((prev: any) => {
          const existing = prev.files || [];
          const merged = mergeUniqueFiles(existing, mapped);
          return { ...prev, files: merged };
        });

        Toast.show({
          type: 'success',
          text2: `${mapped.length} ${strings.file_selected}`,
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

  const removeFileAt = (index: number) => {
    setForm((prev: any) => {
      const files = [...(prev.files || [])];
      files.splice(index, 1);
      return { ...prev, files };
    });
  };

  const submitPayment = async (validForm: any) => {
    try {
      setLoader(true);

      const fd = new FormData();

      const valueOrFallback = (formVal: any, itemVal: any) => {
        const f = typeof formVal === 'string' ? formVal.trim() : formVal;
        return f === '' || f === null || f === undefined ? itemVal : f;
      };

      const toNumberSafe = (val: any): number | undefined => {
        if (val == null) return undefined;

        if (typeof val === 'number') {
          return Number.isFinite(val) ? val : undefined;
        }

        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed === '') return undefined;

          const parsed = Number(trimmed);
          return Number.isFinite(parsed) ? parsed : undefined;
        }

        const coerced = Number(val);
        return Number.isFinite(coerced) ? coerced : undefined;
      };

      const formatApiDate = (ddmmyyyy: string) =>
        moment(ddmmyyyy, 'DD-MM-YYYY').format('YYYY-MM-DD');

      const uniqueId = valueOrFallback(validForm.uniqueId, item?.uniqueId);

      const penalty = toNumberSafe(
        valueOrFallback(
          validForm.penaltyAmount,
          item?.penaltyAmount ?? item?.penalty,
        ),
      );
      const gstDeduction = toNumberSafe(
        valueOrFallback(validForm.gstDeductionAmount, item?.gstDeduction),
      );
      const incomeTax = toNumberSafe(
        valueOrFallback(validForm.incomeTaxAmount, item?.incomeTax),
      );
      const excessBillDeduction = toNumberSafe(
        valueOrFallback(
          validForm.excessBillDeductionAmount,
          item?.excessBillDeduction,
        ),
      );
      const other = toNumberSafe(
        valueOrFallback(validForm.otherAmount, item?.other),
      );
      const netPayment = toNumberSafe(
        valueOrFallback(validForm.netPaymentAmount, item?.netPayment),
      );

      const paymentRemark = valueOrFallback(
        validForm.paymentRemark,
        item?.paymentRemark,
      );
      const paymentDateDDMMYYYY = valueOrFallback(
        validForm.date,
        item?.paymentDate ? moment(item.paymentDate).format('DD-MM-YYYY') : '',
      );
      const paymentDate = paymentDateDDMMYYYY
        ? formatApiDate(paymentDateDDMMYYYY)
        : undefined;

      (form.files || []).forEach((f: SelectedFile) => {
        if (f.uri.startsWith('http')) {
          fd.append('file[]', f.uri);
        } else {
          fd.append('file[]', {
            uri: f.uri,
            name: f.fileName,
            type: f.type,
          } as any);
        }
      });

      if (!isNullUndefined(uniqueId)) fd.append('uniqueId', `${uniqueId}`);

      if (!isNullUndefined(penalty)) fd.append('penalty', `${penalty}`);
      if (!isNullUndefined(gstDeduction))
        fd.append('gstDeduction', `${gstDeduction}`);
      if (!isNullUndefined(incomeTax)) fd.append('incomeTax', `${incomeTax}`);
      if (!isNullUndefined(excessBillDeduction))
        fd.append('excessBillDeduction', `${excessBillDeduction}`);
      if (!isNullUndefined(other)) fd.append('other', `${other}`);
      if (!isNullUndefined(netPayment))
        fd.append('netPayment', `${netPayment}`);

      if (!isNullUndefined(paymentRemark))
        fd.append('paymentRemark', `${paymentRemark}`);
      if (!isNullUndefined(paymentDate))
        fd.append('paymentDate', `${paymentDate}`);

      if (isEdit) {
        fd.append('paymentId', `${item.id}`);
      }

      const res: any = isEdit
        ? await updateVendorPaymentHistoryApi(fd).unwrap()
        : await addVendorPaymentHistoryApi(fd).unwrap();

      Toast.show({
        type: 'success',
        text2: res?.data?.message,
      });

      props.route.params?.onDone?.();
      navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text2: err?.data?.message ?? 'Submission failed',
        autoHide: true,
      });
    } finally {
      setLoader(false);
    }
  };

  const onSubmit = async () => {
    try {
      const valid = schema.validateSync(form);
      await submitPayment(valid);
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const openFile = async (file: SelectedFile) => {
    if (!file.uri?.startsWith('http')) return;

    const canOpen = await Linking.canOpenURL(file.uri);
    if (!canOpen) {
      return;
    }

    Linking.openURL(file.uri);
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
        <TextInputOrganisms
          label={'Unique ID'}
          placeholder={'Unique ID'}
          value={form.uniqueId}
          onChangeText={() => {}}
          disabled
          editable={false}
        />

        <TextInputOrganisms
          label={'Invoice Amount'}
          placeholder={'Invoice Amount'}
          value={form.invoiceAmount}
          onChangeText={() => {}}
          disabled
          editable={false}
        />

        <TextInputOrganisms
          label={'Penalty Amount'}
          placeholder={'Penalty Amount'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current?.focus()}
          value={form.penaltyAmount}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              penaltyAmount: normalizeNumber(val),
            }));
            setErrors({ ...errors, penaltyAmount: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          keyboardType="numeric"
          errorMessage={errors.penaltyAmount}
          isMandatory
        />

        <TextInputOrganisms
          label={'GST Deduction Amount'}
          placeholder={'GST Deduction Amount'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current?.focus()}
          value={form.gstDeductionAmount}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              gstDeductionAmount: normalizeNumber(val),
            }));
            setErrors({ ...errors, gstDeductionAmount: '' });
          }}
          isMandatory
          autoCapitalize={'none'}
          returnKeyType={'next'}
          keyboardType="numeric"
          errorMessage={errors.gstDeductionAmount}
        />

        <TextInputOrganisms
          label={'Income Tax Amount'}
          placeholder={'Income Tax Amount'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current?.focus()}
          value={form.incomeTaxAmount}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              incomeTaxAmount: normalizeNumber(val),
            }));
            setErrors({ ...errors, incomeTaxAmount: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          keyboardType="numeric"
          errorMessage={errors.incomeTaxAmount}
          isMandatory
        />

        <TextInputOrganisms
          label={'Excess Bill Deduction Amount'}
          placeholder={'Excess Bill Deduction Amount'}
          ref={input4_ref}
          onSubmitEditing={() => input5_ref.current?.focus()}
          value={form.excessBillDeductionAmount}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              excessBillDeductionAmount: normalizeNumber(val),
            }));
            setErrors({ ...errors, excessBillDeductionAmount: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          keyboardType="numeric"
          errorMessage={errors.excessBillDeductionAmount}
          isMandatory
        />

        <TextInputOrganisms
          label={'Other Amount'}
          placeholder={'Other Amount'}
          ref={input5_ref}
          onSubmitEditing={() => input6_ref.current?.focus()}
          value={form.otherAmount}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              otherAmount: normalizeNumber(val),
            }));
            setErrors({ ...errors, otherAmount: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          keyboardType="numeric"
          errorMessage={errors.otherAmount}
          isMandatory
        />

        <TextInputOrganisms
          label={'Net Payment Amount'}
          placeholder={'Net Payment Amount'}
          ref={input6_ref}
          onSubmitEditing={() => input7_ref.current?.focus()}
          value={form.netPaymentAmount}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              netPaymentAmount: normalizeNumber(val),
            }));
            setErrors({ ...errors, netPaymentAmount: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          keyboardType="numeric"
          errorMessage={errors.netPaymentAmount}
          isMandatory
        />

        <DateInputOrganism
          label={'Date'}
          placeholder={'Date'}
          value={form.date}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({ ...prev, date: val }));
            setErrors({ ...errors, date: '' });
          }}
          fieldName={'date'}
          dateFormat="DD-MM-YYYY"
          errorMessage={errors.date}
          isMandatory
        />

        <TextInputOrganisms
          label={'Payment Remark'}
          placeholder={'Payment Remark'}
          ref={input7_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.paymentRemark}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({ ...prev, paymentRemark: val }));
            setErrors({ ...errors, paymentRemark: '' });
          }}
          isMandatory
          errorMessage={errors.paymentRemark}
          autoCapitalize={'none'}
          returnKeyType={'done'}
        />

        <TextAtom style={styles.labelStyle} numberOfLines={2}>
          Upload Files (PDF)
        </TextAtom>

        <TouchableOpacity
          style={[
            styles.uploadBtn,
            { borderColor: errors.files ? colors.red : colors.grey_1 },
          ]}
          activeOpacity={0.8}
          onPress={handleFileUpload}
        >
          <TextAtom numberOfLines={0} style={styles.uploadText}>
            {form.files?.length
              ? `${form.files.length} file(s) selected`
              : strings.choose_file}
          </TextAtom>
          <TextAtom style={styles.instructionText}>{'Add Files'}</TextAtom>
        </TouchableOpacity>

        {errors.files ? (
          <TextAtom
            style={{
              color: colors.red,
              alignSelf: 'center',
              marginBottom: vh(8),
            }}
          >
            {errors.files}
          </TextAtom>
        ) : null}

        {form.files?.map((f: SelectedFile, idx: number) => (
          <View key={`${f.uri}-${idx}`} style={styles.fileRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openFile(f)}
              disabled={!f.uri?.startsWith('http')}
            >
              <TextAtom
                style={[
                  styles.fileName,
                  f.uri?.startsWith('http') && styles.linkText,
                ]}
                numberOfLines={2}
              >
                {f.fileName}
              </TextAtom>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => removeFileAt(idx)}
              style={styles.removeBtn}
              activeOpacity={0.7}
            >
              <TextAtom style={styles.removeText}>Remove</TextAtom>
            </TouchableOpacity>
          </View>
        ))}
      </KeyboardAwareScrollView>

      <ButtonOrganism
        onPress={onSubmit}
        bttnText={isEdit ? 'Edit Payment Details' : 'Add Payment Details'}
      />
    </SafeAreaView>
  );
};

export default AddPaymentDetails;

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
    fontSize: vw(12),
    textAlign: 'center',
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
  fileRow: {
    width: vw(328),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.grey_1,
    borderRadius: vw(8),
    paddingHorizontal: vw(12),
    paddingVertical: vh(8),
    marginBottom: vh(6),
    backgroundColor: colors.backgroundColor,
  },
  fileName: {
    width: vw(220),
    fontSize: vw(12),
    color: colors.black,
    fontFamily: fonts.Roboto_Regular,
  },
  removeBtn: {
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: vw(6),
    paddingHorizontal: vw(10),
    paddingVertical: vh(4),
  },
  removeText: {
    color: colors.red,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
