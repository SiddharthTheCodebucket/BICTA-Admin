import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  colors,
  fonts,
  screensName,
  vh,
  vw,
  strings,
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import TextInputOrganisms from '../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import ImageUploadOrganism from '../../../../../components/organisms/ImageUploadOrganism';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import { useListTraineeManageIndemnityBondMutation } from '../../../../../injectEndpointsTrainee/profileEndpoints';
import { useAppSelector } from '../../../../../hooks';
import {
  isNullUndefined,
  normalizeLetters,
} from '../../../../../utils/CommonFunction';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';

interface Props {
  navigation: NavigationType;
}

const IndemnityBondForm = ({ navigation }: Props) => {
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const input5_ref: any = createRef();
  const input6_ref: any = createRef();
  const input7_ref: any = createRef();
  const input8_ref: any = createRef();
  const input9_ref: any = createRef();
  const input10_ref: any = createRef();
  const input11_ref: any = createRef();
  const input12_ref: any = createRef();
  const input13_ref: any = createRef();
  const input14_ref: any = createRef();

  const [listIndemnityBondApi] = useListTraineeManageIndemnityBondMutation();
  const { profileData } = useAppSelector(state => state.Profile);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.indemnity_bond_form_title);
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [checkingSubmission, setCheckingSubmission] = useState(true);
  const [redirectAfterFetch, setRedirectAfterFetch] = useState(false);
  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    traineeId: '',
    name: '',
    relation: {},
    relationName: '',
    residence: '',
    employmentAt: '',
    duration: '',
    date: '',
    month: '',
    year: '',
    campus: '',
    district: '',
    firstWitnessName: '',
    firstWitnessDesignation: '',
    signatureOfWitnessFirst: '',
    secondWitnessName: '',
    secondWitnessDesignation: '',
    signatureOfWitnessSecond: '',
    signatureOfIndemnifier: '',
    uploadSignatureOfWitnessFirst: {},
    uploadSignatureOfWitnessSecond: {},
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    getListIndemnityBond();
  }, []);

  const setValue = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const getRelation = (id: any) =>
    RELEATION_DATA.find((x: any) => x.id === id) || {};

  const getListIndemnityBond = () => {
    setLoader(true);
    const params = {
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: [['traineeId', '=', Number(profileData.traineeId)]],
      pageNo: 1,
      itemsPerPage: 6,
      trainingId: Number(profileData.nameOfTrainingProgrammeId),
    };
    listIndemnityBondApi(params)
      .unwrap()
      .then((res: any) => {
        let data = res.data.data[0] || {};
        const isSubmitted =
          profileData?.isTraineeIndemnityBondSubmitted?.toLowerCase() === 'yes';

        setLoader(false);
        setCheckingSubmission(false);

        setForm((prev: any) => ({
          ...prev,
          traineeId: data.traineeId,
          name: data.name ?? '',
          relation: getRelation(data.relation),
          relationName: data.relationName ?? '',
          residence: data.residence ?? '',
          employmentAt: data.employmentAt ?? '',
          duration: !isNullUndefined(data.duration)
            ? String(data.duration)
            : '',
          date: !isNullUndefined(data.date) ? String(data.date) : '',
          month: data.month ?? '',
          year: !isNullUndefined(data.year) ? String(data.year) : '',
          campus: data.campus ?? '',
          district: data.district ?? '',
          firstWitnessName: data.firstWitnessName ?? '',
          firstWitnessDesignation: data.firstWitnessDesignation ?? '',
          signatureOfWitnessFirst: data.signatureOfWitnessFirst ?? '',
          secondWitnessName: data.secondWitnessName ?? '',
          secondWitnessDesignation: data.secondWitnessDesignation ?? '',
          signatureOfWitnessSecond: data.signatureOfWitnessSecond ?? '',
          signatureOfIndemnifier: data.signatureOfIndemnifier ?? '',
          uploadSignatureOfWitnessFirst: {},
          uploadSignatureOfWitnessSecond: {},
        }));
        if (isSubmitted) {
          navigation.replace(screensName.IndemnityBond, { data });
          return;
        }
      })
      .catch((err: any) => {
        setLoader(false);
        setCheckingSubmission(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const schema = Yup.object().shape({
    uploadSignatureOfWitnessSecond: Yup.object({
      uri: Yup.string().required(strings.err_signature_of_witness_bipard),
    }),
    secondWitnessDesignation: Yup.string().required(
      strings.witness_designation_required,
    ),
    secondWitnessName: Yup.string().required(strings.witness_name_required),
    uploadSignatureOfWitnessFirst: Yup.object({
      uri: Yup.string().required(strings.err_signature_of_witness_bipard),
    }),
    firstWitnessDesignation: Yup.string().required(
      strings.witness_designation_required,
    ),
    firstWitnessName: Yup.string().required(strings.witness_name_required),
    district: Yup.string().required(strings.district_required),
    campus: Yup.string().required(strings.campus_required),
    relationName: Yup.string().required(strings.relation_name_required),
    relation: Yup.object({
      name: Yup.string().required(strings.relation_required),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      navigation.navigate(screensName.IndemnityBond, {
        data: form,
      });
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  if (checkingSubmission) return <FullscreenLoading isVisible={true} />;

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      {!redirectAfterFetch && !checkingSubmission && (
        <>
          <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
            <TextInputOrganisms
              label={strings.name}
              placeholder={strings.name}
              ref={input1_ref}
              onSubmitEditing={() => input2_ref.current.focus()}
              value={form.name}
              autoCapitalize={'none'}
              returnKeyType={'next'}
              onChangeText={(val: string) => {
                setValue('name', val);
              }}
              disabled
              editable={false}
            />
            <DropDownOrganism
              label={strings.relation}
              placeholder={strings.relation}
              onPress={() => {
                navigation.navigate('DropDownModal', {
                  name: strings.relation,
                  Data: RELEATION_DATA,
                  selectedData: form.relation,
                  setSelectedData: (data: any) => {
                    setValue('relation', data);
                    setErrors({ ...errors, 'relation.name': '' });
                  },
                  typeName: strings.name,
                  typeId: 'id',
                });
              }}
              inputText={form.relation?.name}
              isMandatory
              errorMessage={errors['relation.name']}
            />
            <TextInputOrganisms
              label={strings.relation_name}
              placeholder={strings.relation_name}
              ref={input2_ref}
              onSubmitEditing={() => input3_ref.current.focus()}
              value={form.relationName}
              autoCapitalize={'none'}
              returnKeyType={'next'}
              onChangeText={(val: string) => {
                let formattedInput = normalizeLetters(val);
                setValue('relationName', formattedInput);
                setErrors({ ...errors, relationName: '' });
              }}
              isMandatory
              errorMessage={errors.relationName}
            />
            <ViewAtom style={styles.rowContainer}>
              <TextInputOrganisms
                label={strings.residence}
                placeholder={strings.residence}
                ref={input3_ref}
                onSubmitEditing={() => input4_ref.current.focus()}
                value={form.residence}
                autoCapitalize={'none'}
                returnKeyType={'next'}
                onChangeText={(val: string) => {
                  setValue('residence', val);
                }}
                contentContainerStyle={{ width: vw(100) }}
                textInputStyle={{ width: vw(100) }}
                style={{ width: vw(100) }}
                labelStyle={{ width: vw(100) }}
                disabled
                editable={false}
              />
              <TextInputOrganisms
                label={strings.employment_at}
                placeholder={strings.empployme}
                ref={input4_ref}
                onSubmitEditing={() => input5_ref.current.focus()}
                value={form.employmentAt}
                autoCapitalize={'none'}
                returnKeyType={'next'}
                onChangeText={(val: string) => {
                  setValue('employmentAt', val);
                }}
                contentContainerStyle={{ width: vw(100) }}
                textInputStyle={{ width: vw(100) }}
                style={{ width: vw(100) }}
                labelStyle={{ width: vw(100) }}
                disabled
                editable={false}
              />

              <TextInputOrganisms
                label={strings.duration}
                placeholder={strings.duration}
                ref={input5_ref}
                onSubmitEditing={() => input6_ref.current.focus()}
                value={form.duration}
                autoCapitalize={'none'}
                returnKeyType={'next'}
                onChangeText={(val: string) => {
                  setValue('duration', val);
                }}
                contentContainerStyle={{ width: vw(100) }}
                textInputStyle={{ width: vw(100) }}
                style={{ width: vw(100) }}
                labelStyle={{ width: vw(100) }}
                disabled
                editable={false}
              />
            </ViewAtom>

            <ViewAtom style={styles.rowContainer}>
              <TextInputOrganisms
                label={strings.date}
                placeholder={strings.date}
                ref={input6_ref}
                onSubmitEditing={() => input7_ref.current.focus()}
                value={form.date}
                autoCapitalize={'none'}
                returnKeyType={'next'}
                onChangeText={(val: string) => {
                  setValue('date', val);
                }}
                contentContainerStyle={{ width: vw(100) }}
                textInputStyle={{ width: vw(100) }}
                style={{ width: vw(100) }}
                labelStyle={{ width: vw(100) }}
                disabled
                editable={false}
              />
              <TextInputOrganisms
                label={strings.month}
                placeholder={strings.month}
                ref={input7_ref}
                onSubmitEditing={() => input8_ref.current.focus()}
                value={form.month}
                autoCapitalize={'none'}
                returnKeyType={'next'}
                onChangeText={(val: string) => {
                  setValue('month', val);
                }}
                contentContainerStyle={{ width: vw(100) }}
                textInputStyle={{ width: vw(100) }}
                style={{ width: vw(100) }}
                labelStyle={{ width: vw(100) }}
                disabled
                editable={false}
              />
              <TextInputOrganisms
                label={strings.year}
                placeholder={strings.year}
                ref={input8_ref}
                onSubmitEditing={() => input9_ref.current.focus()}
                value={form.year}
                autoCapitalize={'none'}
                returnKeyType={'next'}
                onChangeText={(val: string) => {
                  setValue('year', val);
                }}
                contentContainerStyle={{ width: vw(100) }}
                textInputStyle={{ width: vw(100) }}
                style={{ width: vw(100) }}
                labelStyle={{ width: vw(100) }}
                disabled
                editable={false}
              />
            </ViewAtom>
            <TextInputOrganisms
              label={strings.campus}
              placeholder={strings.campus}
              ref={input9_ref}
              onSubmitEditing={() => input10_ref.current.focus()}
              value={form.campus}
              autoCapitalize={'none'}
              returnKeyType={'next'}
              onChangeText={(val: string) => {
                let formattedInput = normalizeLetters(val);
                setValue('campus', formattedInput);
                setErrors({ ...errors, campus: '' });
              }}
              isMandatory
              errorMessage={errors.campus}
            />
            <TextInputOrganisms
              label={strings.district}
              placeholder={strings.district}
              ref={input10_ref}
              onSubmitEditing={() => input11_ref.current.focus()}
              value={form.district}
              autoCapitalize={'none'}
              returnKeyType={'next'}
              onChangeText={(val: string) => {
                let formattedInput = normalizeLetters(val);
                setValue('district', formattedInput);
                setErrors({ ...errors, district: '' });
              }}
              isMandatory
              errorMessage={errors.district}
            />
            <TextInputOrganisms
              label={strings.witness_name}
              placeholder={strings.witness_name}
              ref={input11_ref}
              onSubmitEditing={() => input12_ref.current.focus()}
              value={form.firstWitnessName}
              autoCapitalize={'none'}
              returnKeyType={'next'}
              onChangeText={(val: string) => {
                let formattedInput = normalizeLetters(val);
                setValue('firstWitnessName', formattedInput);
                setErrors({ ...errors, firstWitnessName: '' });
              }}
              isMandatory
              errorMessage={errors.firstWitnessName}
            />
            <TextInputOrganisms
              label={strings.designation}
              placeholder={strings.designation}
              ref={input12_ref}
              onSubmitEditing={() => input13_ref.current.focus()}
              value={form.firstWitnessDesignation}
              autoCapitalize={'none'}
              returnKeyType={'next'}
              onChangeText={(val: string) => {
                let formattedInput = normalizeLetters(val);
                setValue('firstWitnessDesignation', formattedInput);
                setErrors({ ...errors, firstWitnessDesignation: '' });
              }}
              isMandatory
              errorMessage={errors.firstWitnessDesignation}
            />
            <ImageUploadOrganism
              label={strings.signature_of_witness_bipard}
              isMandatory
              buttonText={strings.choose_file}
              onSelectImage={(file: any) => {
                setValue('uploadSignatureOfWitnessFirst', file);
                setErrors({
                  ...errors,
                  'uploadSignatureOfWitnessFirst.uri': '',
                });
              }}
              defaultImage={form.signatureOfWitnessFirst}
              errorMessage={errors['uploadSignatureOfWitnessFirst.uri']}
              instruction={''}
            />
            <TextInputOrganisms
              label={strings.witness_name}
              placeholder={strings.witness_name}
              ref={input13_ref}
              onSubmitEditing={() => input14_ref.current.focus()}
              value={form.secondWitnessName}
              autoCapitalize={'none'}
              returnKeyType={'next'}
              onChangeText={(val: string) => {
                let formattedInput = normalizeLetters(val);
                setValue('secondWitnessName', formattedInput);
                setErrors({ ...errors, secondWitnessName: '' });
              }}
              isMandatory
              errorMessage={errors.secondWitnessName}
            />
            <TextInputOrganisms
              label={strings.designation}
              placeholder={strings.designation}
              ref={input14_ref}
              onSubmitEditing={() => Keyboard.dismiss()}
              value={form.secondWitnessDesignation}
              autoCapitalize={'none'}
              returnKeyType={'next'}
              onChangeText={(val: string) => {
                let formattedInput = normalizeLetters(val);
                setValue('secondWitnessDesignation', formattedInput);
                setErrors({ ...errors, secondWitnessDesignation: '' });
              }}
              isMandatory
              errorMessage={errors.secondWitnessDesignation}
            />
            <ImageUploadOrganism
              label={strings.signature_of_witness_bipard}
              isMandatory
              buttonText={strings.choose_file}
              onSelectImage={(file: any) => {
                setValue('uploadSignatureOfWitnessSecond', file);
                setErrors({
                  ...errors,
                  'uploadSignatureOfWitnessSecond.uri': '',
                });
              }}
              defaultImage={form.signatureOfWitnessSecond}
              errorMessage={errors['uploadSignatureOfWitnessSecond.uri']}
              instruction={''}
            />
          </KeyboardAwareScrollView>
          <ButtonOrganism onPress={onSubmit} bttnText={strings.preview} />
        </>
      )}
    </SafeAreaView>
  );
};

export default IndemnityBondForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: vw(80),
    height: vw(80),
    resizeMode: 'contain',
  },
  headingHindi: {
    color: colors.black,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
  },
  subTextHindi: {
    color: colors.black,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
  },
  headingEnglish: {
    color: colors.black,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    textAlign: 'center',
    marginTop: vh(10),
  },
  subTextEnglish: {
    color: colors.black,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
  },
  title: {
    color: colors.black,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    textAlign: 'center',
    marginTop: vh(10),
  },
  seperator: {
    height: vh(1),
    backgroundColor: colors.chinese_silver,
    width: '100%',
    marginTop: vh(10),
  },
  formContainer: {
    marginTop: vh(15),
    width: '100%',
    paddingHorizontal: vw(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: vh(10),
  },
  text: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.black,
    marginRight: vw(5),
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: colors.black,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    paddingVertical: 0,
  },
  dropdown: {
    width: vw(80),
    marginRight: vw(5),
  },
});

const RELEATION_DATA = [
  { id: 'S/O', name: 'S/O' },
  { id: 'D/O', name: 'D/O' },
  { id: 'W/O', name: 'W/O' },
];
