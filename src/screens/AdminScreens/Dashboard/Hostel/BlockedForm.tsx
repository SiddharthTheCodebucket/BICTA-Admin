import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import { normalizeNumber } from '../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import DateInputOrganism from '../../../../components/organisms/DateInputOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../components/atoms/ViewAtom';
import { useDashboardBlockBedMutation } from '../../../../injectEndpoints/dashboardEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  purpose: '',
  blockTypeList: [
    { id: 'Trainee', name: 'Trainee' },
    { id: 'Guest', name: 'Guest' },
  ],
  blockType: {},
  startDate: '',
  endDate: '',
  hostelList: [],
  hostel: {},
  count: '',
};

const BlockedForm = (props: Props) => {
  const { navigation } = props;

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [blockBedApi] = useDashboardBlockBedMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});
  const [selectedHostels, setSelectedHostels] = useState<any>([]);

  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Hostel Block Request');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (canFetchHostelList()) {
      fetchHostelList();
    }
  }, [form.purpose, form.blockType?.id, form.startDate, form.endDate]);

  const schema = Yup.object().shape({
    purpose: Yup.string().required('Purpose is required'),
    blockType: Yup.object({
      id: Yup.string().required('Block Type is required'),
    }),
    startDate: Yup.string().required('Start date is required'),
    endDate: Yup.string().required('End date is required'),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);

      if (selectedHostels.length === 0) {
        Toast.show({ type: 'error', text2: 'Please add at least one hostel' });
        return;
      }

      blockHostel();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const canFetchHostelList = () => {
    return form.purpose && form.blockType?.id && form.startDate && form.endDate;
  };

  const fetchHostelList = () => {
    setLoader(true);

    const formattedStart = moment(form.startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD',
    );
    const formattedEnd = moment(form.endDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD',
    );

    const params =
      form.blockType?.id === 'Trainee'
        ? {
            listType: 'select_vacant_bed_for_trainee',
            replacements: [
              formattedStart,
              formattedEnd,
              formattedStart,
              formattedEnd,
            ],
          }
        : {
            listType: 'select_vacant_bed_for_guest',
            replacements: [
              formattedStart,
              formattedEnd,
              formattedStart,
              formattedEnd,
            ],
          };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('hostelList', res.data);
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

  const addHostelEntry = () => {
    if (!form.hostel.hostelId) {
      Toast.show({ type: 'error', text2: 'Select Hostel' });
      return;
    }

    if (!form.count) {
      Toast.show({ type: 'error', text2: 'Enter Count' });
      return;
    }

    const exists = selectedHostels.find(
      (x: any) => x.hostelId === form.hostel.hostelId,
    );

    if (exists) {
      Toast.show({ type: 'error', text2: 'Hostel already added' });
      return;
    }

    const entry = {
      hostelId: form.hostel.hostelId,
      hostel: form.hostel.hostel,
      vacantBedIds: form.hostel.vacantBedIds,
      count: Number(form.count),
    };

    setSelectedHostels((prev: any) => [...prev, entry]);

    setForm((prev: any) => ({
      ...prev,
      hostel: {},
      count: '',
    }));
  };

  // ---------- SUBMIT BLOCK ----------
  const blockHostel = () => {
    setLoader(true);

    let bedIds: any[] = [];

    selectedHostels.forEach((item: any) => {
      let required = item.count;
      let selectedBeds = item.vacantBedIds.slice(0, required);
      bedIds.push(...selectedBeds);
    });

    const blockFrom = moment(form.startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    const blockTo = moment(form.endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');

    const params = {
      bedIds,
      blokPurpose: form.purpose,
      blokType: form.blockType?.id,
      blockFrom,
      blockTo,
    };

    blockBedApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({ type: 'success', text2: res.data.message });
        setLoader(false);

        navigation.navigate('BottomTabNavigator', {
          screen: 'Dashboard',
          params: { goToHostelPlanning: true },
        });
      })
      .catch(() => {
        setLoader(false);
        Toast.show({ type: 'error', text2: 'Something went wrong' });
      });
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
        {/* PURPOSE */}
        <TextInputOrganisms
          label="Purpose"
          placeholder="Purpose"
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.purpose}
          returnKeyType="next"
          onChangeText={(val: string) => {
            setValue('purpose', val);
            setErrors({ ...errors, purpose: '' });
          }}
          isMandatory
          errorMessage={errors.purpose}
        />

        {/* BLOCK TYPE */}
        <DropDownOrganism
          label="Block Type"
          placeholder="Block Type"
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Block Type',
              Data: form.blockTypeList,
              selectedData: form.blockType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  blockType: data,
                  hostelList: [],
                  hostel: {},
                }));

                setErrors({ ...errors, 'blockType.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.blockType?.name}
          isMandatory
          errorMessage={errors['blockType.id']}
        />

        {/* START DATE */}
        <DateInputOrganism
          label="Start Date"
          placeholder="Start Date"
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

        {/* END DATE */}
        <DateInputOrganism
          label="End Date"
          placeholder="End Date"
          value={form.endDate}
          onChangeText={(val: any) => {
            setValue('endDate', val);
            setErrors({ ...errors, endDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          minDate={
            form.startDate
              ? moment(form.startDate, 'DD-MM-YYYY').toDate()
              : undefined
          }
          isMandatory
          errorMessage={errors.endDate}
        />

        <DropDownOrganism
          label="Hostel"
          placeholder="Hostel"
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Hostel',
              Data: form.hostelList.filter(
                (h: any) =>
                  !selectedHostels.some((s: any) => s.hostelId === h.hostelId),
              ),
              selectedData: form.hostel,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  hostel: data,
                }));
                setErrors({ ...errors, 'hostel.hostelId': '' });
              },
              typeName: 'hostel',
              typeId: 'hostelId',
            });
          }}
          inputText={form.hostel?.hostel}
          isMandatory
          errorMessage={errors['hostel.hostelId']}
        />

        {form.hostel?.vacantBedIds && (
          <TextAtom
            style={{
              color: 'green',
              marginTop: vh(5),
              marginBottom: vh(5),
              fontSize: vw(14),
              fontFamily: fonts.Roboto_Medium,
            }}
          >
            Available Beds: {form.hostel.vacantBedIds.length}
          </TextAtom>
        )}

        <TextInputOrganisms
          label="Count"
          placeholder="Count"
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.count}
          returnKeyType="done"
          onChangeText={(val: string) => {
            setValue('count', normalizeNumber(val));
            setErrors({ ...errors, count: '' });
          }}
          isMandatory
          errorMessage={errors.count}
          maxLength={3}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={{
            marginTop: vh(10),
            padding: vw(10),
            backgroundColor: colors.primary,
            borderRadius: vw(6),
            alignItems: 'center',
          }}
          onPress={addHostelEntry}
        >
          <TextAtom style={{ color: colors.white, fontSize: vw(15) }}>
            + Add Another Hostel
          </TextAtom>
        </TouchableOpacity>

        {selectedHostels?.map((item: any, index: any) => (
          <ViewAtom
            key={index}
            style={{
              padding: vw(10),
              borderWidth: 1,
              borderColor: colors.grey,
              borderRadius: vw(8),
              marginTop: vh(10),
              backgroundColor: colors.white,
            }}
          >
            <TextAtom
              style={{
                fontSize: vw(14),
                fontFamily: fonts.Roboto_Medium,
                color: colors.grey,
              }}
            >
              {item.hostel}
            </TextAtom>

            <TextAtom
              style={{
                fontSize: vw(14),
                fontFamily: fonts.Roboto_Medium,
                color: colors.grey,
              }}
            >
              Count: {item.count}
            </TextAtom>

            <TouchableOpacity
              style={{ position: 'absolute', right: 10, top: 10 }}
              onPress={() =>
                setSelectedHostels(
                  selectedHostels.filter(
                    (x: any) => x.hostelId !== item.hostelId,
                  ),
                )
              }
            >
              <TextAtom style={{ color: colors.red }}>Remove</TextAtom>
            </TouchableOpacity>
          </ViewAtom>
        ))}
      </KeyboardAwareScrollView>

      <ButtonOrganism onPress={onSubmit} bttnText="Block" />
    </SafeAreaView>
  );
};

export default BlockedForm;

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
});
