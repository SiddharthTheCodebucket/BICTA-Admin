import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import * as Yup from 'yup';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { useResolveSupportRaiseComplainMutation } from '../../../../../../injectEndpoints/supportEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const errorInitialData = {
  replyMsg: '',
  'selectedStatusList.id': '',
  'selectedAssignTo.id': '',
};

const SupportTicketHistoryReply = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const input1_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [supportResolveComplaintApi] = useResolveSupportRaiseComplainMutation();

  const [loader, setLoader] = useState(false);
  const [ticketStatusList, setTicketStatusList] = useState<any>([]);
  const [selectedStatusList, setSelectedStatusList] = useState<any>({});
  const [assignToList, setAssignToList] = useState<any>([]);
  const [selectedAssignTo, setSelectedAssignTo] = useState<any>({});
  const [replyMsg, setReplyMsg] = useState('');
  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState(errorInitialData);

  const [isTicketHistoryOpen, setIsTicketHistoryOpen] = useState(true);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Edit Support Ticket');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    getStatusList();
    getAssignTo();
  }, []);

  const isValidate = () => {
    try {
      const schema = Yup.object().shape({
        replyMsg: Yup.string().required('Your message is required'),
        selectedAssignTo: Yup.object({
          id: Yup.string().required('Assign to is required'),
        }),
        selectedStatusList: Yup.object({
          id: Yup.string().required('Ticket Status is required'),
        }),
      });
      schema.validateSync({ replyMsg, selectedAssignTo, selectedStatusList });
      return true;
    } catch (err: any) {
      setError({ ...error, [err.path]: err.message });
      return false;
    }
  };

  const getBipardCentreValue = (): string | undefined => {
    switch (Number(item?.tenantId)) {
      case 1:
        return 'Gaya';
      case 2:
        return 'Patna';
      default:
        return undefined;
    }
  };
  const getStatusList = () => {
    setLoader(true);
    const params = {
      listType: 'select_resolve_complain_current_status',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        const list = res.data || [];
        setTicketStatusList(list);

        const preSelectedStatus = list.find(
          (s: any) => String(s.id) === String(item.currentStatusId),
        );

        if (preSelectedStatus) {
          setSelectedStatusList(preSelectedStatus);
        }
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  };

  const getAssignTo = () => {
    const bipardCentreValue = getBipardCentreValue();
    setLoader(true);
    const params = {
      listType: 'select_resolve_complain_assign_to',
      bipardCentre: [bipardCentreValue],
      replacements: [item.primaryIssueTypeId, '%%', item.issueTypeId, '%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        const list = res.data || [];
        setAssignToList(list);

        const preSelectedAssignTo = list.find(
          (a: any) => String(a.id) === String(item.defaultAssignedToId),
        );

        if (preSelectedAssignTo) {
          setSelectedAssignTo(preSelectedAssignTo);
        }
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
  const submitAndReply = () => {
    setLoader(true);
    const bipardCentreValue = getBipardCentreValue();
    const formData = new FormData();

    formData.append('id', null);
    formData.append('bipardCentre', JSON.stringify([bipardCentreValue]));
    formData.append('ticketRaisedId', item.raiseComplainId);
    formData.append('reply', replyMsg);

    formData.append('assignedTo', selectedAssignTo?.id);
    formData.append('currentStatus', selectedStatusList?.id);
    formData.append('issueType', item.issueTypeId);

    if (file?.uri) {
      formData.append('file', {
        uri: file.uri,
        name: file.fileName,
        type: file.type,
      });
    }

    supportResolveComplaintApi(formData)
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
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  const renderTicketHistory = () => (
    <View style={styles.card}>
      <TouchableAtom
        style={styles.accordionHeader}
        onPress={() => setIsTicketHistoryOpen(!isTicketHistoryOpen)}
      >
        <TextAtom style={styles.cardTitle}>Ticket History</TextAtom>
        <TextAtom style={{ color: colors.black }}>
          {isTicketHistoryOpen ? '▲' : '▼'}
        </TextAtom>
      </TouchableAtom>

      {isTicketHistoryOpen && (
        <View style={styles.accordionBody}>
          <Row label="Tracking Id" value={item.trackingId} />
          <Row
            label="Created on"
            value={moment(item.createdDate).format('DD/MM/YYYY')}
          />
          <Row
            label="Updated on"
            value={moment(item.updatedAt).format('DD/MM/YYYY')}
          />
          <Row
            label="Due Date"
            value={moment(item.dueDate).format('DD/MM/YYYY')}
          />
          <Row
            label="Current Status"
            value={item.currentStatus}
            valueStyle={{ color: colors.primary }}
          />

          {item?.complainQuestionResponse?.map((q: any, index: number) => (
            <View
              key={index.toString() + 'kjljk'}
              style={{ marginTop: vh(10) }}
            >
              <TextAtom style={styles.label}>
                Question - {q.questionName.replace(/<[^>]*>/g, '')}
              </TextAtom>
              <TextAtom style={styles.value}>Answer - {q.answer}</TextAtom>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderReporterDetails = () => (
    <View style={styles.card}>
      <TextAtom style={styles.cardTitle}>Reporter Details</TextAtom>

      <View style={styles.reporterRow}>
        <ReporterCol label="Contact" value={item.name} />
        <ReporterCol label="Phone No." value={item.phone} />
      </View>

      <View style={styles.reporterRow}>
        <ReporterCol label="Queries" value={item.subject} />
        <ReporterCol
          label="Last Action Taken By"
          value={item.lastActionTakenBy}
        />
      </View>
    </View>
  );

  const renderBasicTicketInfo = () => {
    const bipardCentreValue = getBipardCentreValue();
    return (
      <View style={styles.basicInfoContainer}>
        <BasicRow label="Bipard Location" value={bipardCentreValue} />
        <BasicRow label="Category" value={item.category} />
        <BasicRow label="Sub Category" value={item.subCategory} />
        <BasicRow label="Primary Issue Type" value={item.primaryIssueType} />
        <BasicRow label="Issue Type" value={item.issueType} />
        <BasicRow label="Priority" value={item.priority} />
      </View>
    );
  };

  const renderAddReplySection = () => (
    <View style={styles.replySection}>
      <TextAtom style={styles.replyTitle}>Post Your Reply Here</TextAtom>

      <TextInputOrganisms
        label="Your Message"
        placeholder="Your Message"
        ref={input1_ref}
        value={replyMsg}
        onSubmitEditing={() => Keyboard.dismiss()}
        onChangeText={(val: string) => {
          setReplyMsg(val);
          setError({ ...error, replyMsg: '' });
        }}
        isMandatory
        errorMessage={error.replyMsg}
      />

      <ImageUploadOrganism
        label="Choose File"
        buttonText="Choose File"
        onSelectImage={(f: any) => setFile(f)}
        defaultImage={file?.uri}
      />

      <ButtonOrganism
        bttnText="Submit"
        onPress={() => {
          if (isValidate()) submitAndReply();
        }}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FullscreenLoading isVisible={loader} />

        <TextAtom style={styles.subject}>Subject: {item.subject}</TextAtom>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: vh(30) }}
        >
          {renderBasicTicketInfo()}
          <DropDownOrganism
            label={'Ticket Status'}
            placeholder={'Ticket Status'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Ticket Status',
                Data: ticketStatusList,
                selectedData: selectedStatusList,
                setSelectedData: (data: any) => {
                  setSelectedStatusList(data);
                  setError({ ...error, 'selectedStatusList.id': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={selectedStatusList?.name}
            isMandatory
            errorMessage={error['selectedStatusList.id']}
          />

          <DropDownOrganism
            label={'Assign To'}
            placeholder={'Assign To'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Assign To',
                Data: assignToList,
                selectedData: selectedAssignTo,
                setSelectedData: (data: any) => {
                  setSelectedAssignTo(data);
                  setError({ ...error, 'selectedAssignTo.id': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={selectedAssignTo?.name}
            isMandatory
            errorMessage={error['selectedAssignTo.id']}
          />
          {renderTicketHistory()}
          {renderReporterDetails()}
          {renderAddReplySection()}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const Row = ({ label, value, valueStyle = {} }: any) => (
  <View style={styles.rowBetween}>
    <TextAtom style={styles.label}>{label} :</TextAtom>
    <TextAtom style={[styles.value, valueStyle]}>{value}</TextAtom>
  </View>
);

const BasicRow = ({ label, value }: any) => (
  <View style={styles.basicRow}>
    <TextAtom style={styles.basicLabel}>{label} :</TextAtom>
    <TextAtom numberOfLines={0} style={styles.basicValue}>
      {value || '-'}
    </TextAtom>
  </View>
);

const ReporterCol = ({ label, value }: any) => (
  <View style={{ flex: 1 }}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.value}>
      {value}
    </TextAtom>
  </View>
);

export default SupportTicketHistoryReply;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  subject: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    margin: vw(15),
    color: colors.black,
  },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    marginBottom: vh(15),
    padding: vw(15),
    borderRadius: vw(10),
    elevation: 3,
    marginTop: vh(8),
  },

  cardTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.black,
  },

  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  accordionBody: {
    marginTop: vh(10),
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(6),
  },

  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },

  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },

  reporterRow: {
    flexDirection: 'row',
    marginTop: vh(12),
  },

  replySection: {
    backgroundColor: colors.grey_5,
    padding: vw(15),
    marginTop: vh(10),
  },

  replyTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    marginBottom: vh(8),
    color: colors.black,
  },
  basicInfoContainer: {
    marginHorizontal: vw(15),
    marginBottom: vh(10),
  },

  basicRow: {
    flexDirection: 'row',
    marginBottom: vh(6),
  },

  basicLabel: {
    width: vw(150),
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },

  basicValue: {
    flex: 1,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },
});
