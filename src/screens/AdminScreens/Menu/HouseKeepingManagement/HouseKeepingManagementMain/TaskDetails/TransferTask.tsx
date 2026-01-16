import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import Toast from 'react-native-toast-message';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import { useHouseKeepingTransferAssignedTaskMutation } from '../../../../../../injectEndpoints/houseKeepingManagementEndpoints';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useGetCentre } from '../../../../../../hooks/useGetCentre';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const initialForm = {
  staffList: [],
  selectedStaff: {},
  supportAdminList: [],
  selectedSupportAdmin: {},
  roomList: [],
  selectedRoom: [],
};

interface Props {
  route: any;
  navigation: NavigationType;
}

const FieldRow = ({ label, value }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.value}>
      {value ?? '-'}
    </TextAtom>
  </ViewAtom>
);

const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.fullValue}>
      {value ?? '-'}
    </TextAtom>
  </ViewAtom>
);

const SectionHeader = ({ title }: any) => (
  <ViewAtom style={styles.sectionContainer}>
    <ViewAtom style={styles.separator} />
    <TextAtom style={styles.sectionTitle}>{title}</TextAtom>
  </ViewAtom>
);

const TransferTask = (props: Props) => {
  const { navigation } = props;
  const data = props.route?.params?.data || {};
  let center = useGetCentre();
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [transferApi] = useHouseKeepingTransferAssignedTaskMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Transfer Task');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (data) {
      getStaffList(data.taskTitleId);
      getAdminList(data.taskTitleId);
      getRoomList(data.id);
    }
  }, [data]);

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const schema = Yup.object().shape({
    selectedSupportAdmin: Yup.object({
      id: Yup.string().required('Support Admin is required'),
    }),
    selectedStaff: Yup.object({
      id: Yup.string().required('Staff is required'),
    }),
    selectedRoom: Yup.array()
      .min(1, 'At least one room is required')
      .required('At least one room is required'),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      addDetails();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addDetails = () => {
    setLoader(true);
    let params: any = {
      id: data.id,
      taskLocationId: data.taskLocationId,
      taskDetailsId: data.taskDetailsId,
      staff: form.selectedStaff.id,
      supportAdmin: form.selectedSupportAdmin.id,
      hostelRooms: form.selectedRoom.map((r: any) => r.id),
      subLocations: [],
      subLocationsOutisideBipard: [],
    };
    transferApi(params)
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

  const getStaffList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_staff_for_house_keeping',
      bipardCentre: center,
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('staffList', res.data);
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

  const getAdminList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_support_admin_for_house_keeping',
      bipardCentre: center,
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('supportAdminList', res.data);
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
  const getRoomList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_room_for_house_keeping_task_transfer',
      bipardCentre: center,
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        const roomList = res.data || [];
        const preSelectedRooms = roomList?.filter((room: any) =>
          data?.roomOrSubLocationId?.includes(room.id),
        );

        setForm((prev: any) => ({
          ...prev,
          roomList: roomList,
          selectedRoom: preSelectedRooms,
        }));
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

  const addRoom = (item: any) => {
    const exists = form.selectedRoom?.some((t: any) => t?.id === item.id);

    if (exists) return;

    const updatedRoom = [...form.selectedRoom, item];

    setForm((prev: any) => ({
      ...prev,
      selectedRoom: updatedRoom,
    }));
  };

  const removeRoom = (id: number) => {
    const updatedRoom = form.selectedRoom.filter((item: any) => item.id !== id);

    setForm((prev: any) => ({
      ...prev,
      selectedRoom: updatedRoom,
    }));
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <FullWidthField label="Staff Name" value={data?.staffName} />

        <SectionHeader title="Task Details" />

        <FieldRow label="Shift" value={data?.shift} />
        <FieldRow label="Task Type" value={data?.taskType} />
        <FullWidthField label="Task Title" value={data?.taskTitle} />
        <FieldRow label="Floor" value={data?.hostelFloor} />
        <DropDownOrganism
          label={'Room'}
          placeholder={'Room'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Room',
              Data: form.roomList,
              selectedData: {},
              setSelectedData: (data: any) => {
                addRoom(data);
                setErrors({ ...errors, 'selectedRoom.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedRoom?.name}
          isMandatory
          errorMessage={errors.selectedRoom}
        />

        <ViewAtom style={{ marginTop: vh(0), marginBottom: vh(10) }}>
          {form.selectedRoom?.length > 0 && (
            <ViewAtom style={styles.permissionScrollWrapper}>
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled
              >
                <ViewAtom style={styles.chipContainer}>
                  {form.selectedRoom.map((item: any) => (
                    <ViewAtom key={item?.id} style={styles.chip}>
                      <TextAtom style={styles.chipText}>{item?.name}</TextAtom>

                      <TouchableOpacity
                        onPress={() => removeRoom(item.id)}
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
        <SectionHeader title="Task Transfer To" />

        <DropDownOrganism
          label={'Staff'}
          placeholder={'Staff'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Staff',
              Data: form.staffList,
              selectedData: form.selectedStaff,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedStaff: data,
                }));
                setErrors({ ...errors, 'selectedStaff.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedStaff?.name}
          isMandatory
          errorMessage={errors['selectedStaff.id']}
        />

        <DropDownOrganism
          label={'Support Admin'}
          placeholder={'Support Admin'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Support Admin',
              Data: form.supportAdminList,
              selectedData: form.selectedSupportAdmin,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedSupportAdmin: data,
                }));
                setErrors({ ...errors, 'selectedSupportAdmin.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedSupportAdmin?.name}
          isMandatory
          errorMessage={errors['selectedSupportAdmin.id']}
        />
      </ScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={'Done'} />
    </SafeAreaView>
  );
};

export default TransferTask;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  scrollContainer: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(40),
    paddingTop: vh(10),
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(12),
  },

  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    flex: 1,
  },

  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    flex: 1,
    textAlign: 'right',
  },

  sectionContainer: {
    marginBottom: vh(10),
  },

  separator: {
    height: 1,
    backgroundColor: colors.chinese_silver,
    marginBottom: vh(6),
  },

  sectionTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.black,
  },

  fullWidthBox: {
    marginBottom: vh(12),
  },

  fullLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(5),
  },

  fullValue: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
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
