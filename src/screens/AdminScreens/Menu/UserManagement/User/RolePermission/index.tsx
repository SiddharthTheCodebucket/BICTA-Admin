import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useListGlobalPermissionsListMutation,
  useUpdateGlobalPermissionsListMutation,
} from '../../../../../../injectEndpoints/userTypeEndpoints';
import { useGetCentre } from '../../../../../../hooks/useGetCentre';

interface Props {
  navigation: NavigationType;
}

const initialForm = {
  userRoleList: [],
  selectedUserRole: {},
  permissionGrantedList: [],
  moduleList: [],
  selectedModule: {},
  subModuleList: [],
  selectedSubModule: {},
  permissionNameList: [],
  selectedPermissions: [],
};

const RolePermission = ({ navigation }: Props) => {
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listGlobalPermissionsListApi] = useListGlobalPermissionsListMutation();
  const [updateGlobalPermissionsListApi] =
    useUpdateGlobalPermissionsListMutation();
  const center = useGetCentre();
  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Role Permission');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    getUserRoleList();
  }, []);

  const setValue = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const schema = Yup.object().shape({
    selectedUserRole: Yup.object({
      id: Yup.string().required('User Role is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      updateGlobalPermissionsList();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const getUserRoleList = () => {
    setLoader(true);
    const params = {
      listType: 'select_user_role',
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('userRoleList', res.data || []);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const getGlobalPermissionList = (roleId: string) => {
    setLoader(true);
    const params = {
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: [['role_id', '=', roleId]],
      pageNo: 1,
    };

    listGlobalPermissionsListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('permissionGrantedList', res.data.data || []);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const removePermission = (id: number) => {
    const updated = form.permissionGrantedList.filter(
      (item: any) => item.id !== id,
    );
    setValue('permissionGrantedList', updated);
  };

  const getModuleList = () => {
    setLoader(true);
    const params = {
      listType: 'select_global_module',
      bipardCentre: center,
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('moduleList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({ type: 'error', text2: err.data.message });
      });
  };

  const getSubModuleList = (id: string) => {
    setLoader(true);
    const params = {
      listType: 'select_global_sub_module',
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('subModuleList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({ type: 'error', text2: err.data.message });
      });
  };

  const getGlobalPermission = (moduleId: string, subModuleId: string) => {
    setLoader(true);
    const params = {
      listType: 'select_global_permissions',
      replacements: ['%%', moduleId, subModuleId],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('permissionNameList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({ type: 'error', text2: err.data.message });
      });
  };

  const addPermission = (permission: any) => {
    const alreadyExists = form.selectedPermissions.some(
      (item: any) => item?.id === permission.id,
    );

    if (alreadyExists) {
      Toast.show({
        type: 'error',
        text2: 'Permission already added',
      });
      return;
    }

    setValue('selectedPermissions', [...form.selectedPermissions, permission]);
  };

  const removeSelectedPermission = (id: number) => {
    const updated = form.selectedPermissions.filter(
      (item: any) => item?.id !== id,
    );
    setValue('selectedPermissions', updated);
  };

  const getAllPermissionIds = () => {
    const grantedIds = form.permissionGrantedList?.map(
      (item: any) => item?.permissionId ?? item.id,
    );

    const selectedIds = form.selectedPermissions?.map((item: any) => item?.id);

    return Array.from(new Set([...grantedIds, ...selectedIds]));
  };

  const updateGlobalPermissionsList = () => {
    setLoader(true);

    const permissionIds = getAllPermissionIds();

    const params = {
      select_admin_role: form.selectedUserRole.id,
      select_permissions: permissionIds,
    };

    updateGlobalPermissionsListApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res?.data?.message || 'Permissions updated successfully',
        });
        setLoader(false);
        navigation.goBack();
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        keyboardShouldPersistTaps="handled"
      >
        <DropDownOrganism
          label={'User Role'}
          placeholder={'User Role'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'User Role',
              Data: form.userRoleList,
              selectedData: form.selectedUserRole,
              setSelectedData: (item: any) => {
                setValue('selectedUserRole', item);
                setErrors({ ...errors, 'selectedUserRole.id': '' });
                getGlobalPermissionList(item.id);
                setValue('permissionGrantedList', []);
                getModuleList();
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedUserRole?.name}
          isMandatory
          errorMessage={errors['selectedUserRole.id']}
        />

        <ViewAtom style={{ marginTop: vh(0) }}>
          <TextAtom style={styles.labelStyle}>Permissions Granted</TextAtom>

          {form.permissionGrantedList?.length > 0 ? (
            <ViewAtom style={styles.permissionScrollWrapper}>
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled
              >
                <ViewAtom style={styles.chipContainer}>
                  {form.permissionGrantedList.map((item: any) => (
                    <ViewAtom key={item.id} style={styles.chip}>
                      <TextAtom style={styles.chipText}>
                        {item.permissionName}
                      </TextAtom>

                      <TouchableOpacity
                        onPress={() => removePermission(item.id)}
                        style={styles.crossBtn}
                      >
                        <TextAtom style={styles.crossText}>✕</TextAtom>
                      </TouchableOpacity>
                    </ViewAtom>
                  ))}
                </ViewAtom>
              </KeyboardAwareScrollView>
            </ViewAtom>
          ) : (
            <TextAtom style={styles.noPermissionText}>
              No Permission Granted
            </TextAtom>
          )}
        </ViewAtom>

        <DropDownOrganism
          label={'Module'}
          placeholder={'Module'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Modulee',
              Data: form.moduleList,
              selectedData: form.selectedModule,
              setSelectedData: (item: any) => {
                setValue('selectedModule', item);
                getSubModuleList(item.id);
                setValue('selectedSubModule', {});
                setValue('permissionNameList', []);
                setValue('selectedPermissions', []);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedModule?.name}
        />

        <DropDownOrganism
          label={'Sub Module'}
          placeholder={'Sub Module'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Sub Module',
              Data: form.subModuleList,
              selectedData: form.selectedSubModule,
              setSelectedData: (item: any) => {
                setValue('selectedSubModule', item);
                setValue('permissionNameList', []);
                setValue('selectedPermissions', []);
                getGlobalPermission(form.selectedModule.id, item.id);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedSubModule?.name}
        />

        <DropDownOrganism
          label={'Permission Name'}
          placeholder={'Permission Name'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Permission Name',
              Data: form.permissionNameList,
              selectedData: {},
              setSelectedData: (item: any) => {
                addPermission(item);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={''}
        />

        <ViewAtom style={{ marginTop: vh(0) }}>
          {form.selectedPermissions?.length > 0 ? (
            <ViewAtom style={styles.permissionScrollWrapper}>
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled
              >
                <ViewAtom style={styles.chipContainer}>
                  {form.selectedPermissions.map((item: any) => (
                    <ViewAtom key={item.id} style={styles.chip}>
                      <TextAtom style={styles.chipText}>{item.name}</TextAtom>

                      <TouchableOpacity
                        onPress={() => removeSelectedPermission(item.id)}
                        style={styles.crossBtn}
                      >
                        <TextAtom style={styles.crossText}>✕</TextAtom>
                      </TouchableOpacity>
                    </ViewAtom>
                  ))}
                </ViewAtom>
              </KeyboardAwareScrollView>
            </ViewAtom>
          ) : (
            <TextAtom style={styles.noPermissionText}>
              No Selected Permission
            </TextAtom>
          )}
        </ViewAtom>
      </KeyboardAwareScrollView>

      <ButtonOrganism onPress={onSubmit} bttnText={strings.submit} />
    </SafeAreaView>
  );
};

export default RolePermission;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingTop: vw(20),
  },

  contentScroll: {
    paddingBottom: vh(20),
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

  crossText: {
    color: colors.white,
    fontSize: vw(12),
    fontWeight: 'bold',
  },

  labelStyle: {
    width: vw(328),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    alignSelf: 'center',
    color: colors.black,
  },
  noPermissionText: {
    color: colors.grey,
    fontSize: vw(12),
    marginTop: vh(6),
    textAlign: 'center',
    marginBottom: vh(8),
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
});
