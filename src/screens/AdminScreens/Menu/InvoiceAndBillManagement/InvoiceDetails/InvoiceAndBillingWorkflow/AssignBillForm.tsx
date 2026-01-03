import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useAssigneeAddVendorMutation,
  useAssigneeListVendorMutation,
} from '../../../../../../injectEndpoints/invoiceManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  remark: '',
  statusList: [],
  selectedStatus: {},
  assigneeList: [],
  selectedAssignee: {},
};

const AssignBillForm = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const updateAssigneeFlag = props.route.params?.updateAssigneeFlag;

  const input1_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [assigneeListApi] = useAssigneeListVendorMutation();
  const [addAssigneeDetailsApi] = useAssigneeAddVendorMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      updateAssigneeFlag ? 'Re-Assign' : 'Assign',
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
    getStatusList();
    getAssigneeList();
  }, []);

  const baseSchema = {
    selectedAssignee: Yup.object({
      id: Yup.string().required('Assignee is required'),
    }),
    selectedStatus: Yup.object({
      id: Yup.string().required('Status is required'),
    }),
  };

  const schema = Yup.object().shape(
    updateAssigneeFlag
      ? baseSchema
      : {
          ...baseSchema,
          remark: Yup.string().required('Remark is required'),
        },
  );

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      addAssigneeDetails();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addAssigneeDetails = () => {
    setLoader(true);

    const params: any = {
      id: null,
      uniqueId: item?.uniqueId,
      assignee: form?.selectedAssignee?.id,
      currentStatus: form?.selectedStatus?.id,
      updateAssigneeFlag: !!updateAssigneeFlag,
    };

    if (!updateAssigneeFlag) {
      params.remarks = form.remark;
      params.fileNo = null;
    }

    addAssigneeDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res?.data?.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  const getStatusList = () => {
    setLoader(true);
    const params = {
      listType: 'select_vendor_request_status',
      replacements: [['COMMON', 'ACCOUNTCONTROLLER'], '%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('statusList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message,
          autoHide: true,
        });
      });
  };

  const getAssigneeList = () => {
    setLoader(true);
    const params = {};
    assigneeListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('assigneeList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message,
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
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        {!updateAssigneeFlag && (
          <TextInputOrganisms
            label={'Remark'}
            placeholder={'Remark'}
            ref={input1_ref}
            onSubmitEditing={() => Keyboard.dismiss()}
            value={form.remark}
            autoCapitalize={'none'}
            returnKeyType={'done'}
            onChangeText={(val: string) => {
              setValue('remark', val);
              setErrors({ ...errors, remark: '' });
            }}
            isMandatory
            errorMessage={errors.remark}
          />
        )}

        <DropDownOrganism
          label={'Status'}
          placeholder={'Status'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Status',
              Data: form.statusList,
              selectedData: form.selectedStatus,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedStatus: data,
                }));
                setErrors({ ...errors, 'selectedStatus.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedStatus?.name}
          isMandatory
          errorMessage={errors['selectedStatus.id']}
        />

        <DropDownOrganism
          label={'Assignee'}
          placeholder={'Assignee'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Assignee',
              Data: form.assigneeList,
              selectedData: form.selectedAssignee,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedAssignee: data,
                }));
                setErrors({ ...errors, 'selectedAssignee.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedAssignee?.name}
          isMandatory
          errorMessage={errors['selectedAssignee.id']}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism
        onPress={onSubmit}
        bttnText={updateAssigneeFlag ? 'Re-Assign' : 'Assign'}
      />
    </SafeAreaView>
  );
};

export default AssignBillForm;

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
