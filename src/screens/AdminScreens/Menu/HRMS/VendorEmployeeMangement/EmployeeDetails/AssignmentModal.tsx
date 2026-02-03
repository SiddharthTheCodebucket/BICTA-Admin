import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';

interface Props {
  visible: boolean;
  type: 'RO' | 'AA' | 'VENDOR' | null;
  onClose: () => void;
  onSubmit: (selectedItem: any) => void;
  navigation: any;
  dropdownData: any[];
  initialSelection?: any;
  isBulk?: boolean;
}

const AssignmentModal = ({
  visible,
  type,
  onClose,
  onSubmit,
  navigation,
  dropdownData,
  initialSelection,
  isBulk,
}: Props) => {
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [error, setError] = useState('');
  const [tempHidden, setTempHidden] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedItem(initialSelection || {});
      setError('');
      setTempHidden(false);
    }
  }, [visible, initialSelection]);

  const handleSubmit = () => {
    if (!selectedItem?.id) {
      if (type === 'RO') setError('Please select R.O');
      else if (type === 'AA') setError('Please select A.A');
      else if (type === 'VENDOR') setError('Please select Vendor');
      return;
    }

    setError('');
    onSubmit(selectedItem);
  };

  const getTitle = () => {
    if (type === 'RO') return isBulk ? 'Assign R.O (Bulk)' : 'Assign R.O';
    if (type === 'AA') return isBulk ? 'Assign A.A (Bulk)' : 'Assign A.A';
    if (type === 'VENDOR') return 'Change Vendor';
    return '';
  };

  const getLabel = () => {
    if (type === 'RO') return isBulk ? 'Select R.O (Bulk)' : 'Select R.O';
    if (type === 'AA') return isBulk ? 'Select A.A (Bulk)' : 'Select A.A';
    if (type === 'VENDOR') return 'Select Vendor';
    return '';
  };

  return (
    <Modal
      visible={visible && !tempHidden}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <ViewAtom style={styles.modalBox}>
          <TextAtom style={styles.title}>{getTitle()}</TextAtom>

          <DropDownOrganism
            label={''}
            placeholder={getLabel()}
            onPress={() => {
              // Temporarily hide this modal
              setTempHidden(true);

              navigation.navigate('DropDownModal', {
                name: getLabel(),
                Data: dropdownData,
                selectedData: selectedItem,
                setSelectedData: (data: any) => {
                  setSelectedItem(data);
                  if (error) setError('');
                  // Show modal again after selection
                  setTimeout(() => {
                    setTempHidden(false);
                  }, 100);
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={selectedItem?.name}
            contentContainerStyle={styles.centerContent}
            downArrowStyle={styles.centerDownArrow}
          />

          {!!error && <TextAtom style={styles.errorText}>{error}</TextAtom>}

          <View style={styles.btnRow}>
            <TouchableAtom style={styles.cancelBtn} onPress={onClose}>
              <TextAtom style={styles.cancelText}>Cancel</TextAtom>
            </TouchableAtom>

            <TouchableAtom style={styles.submitBtn} onPress={handleSubmit}>
              <TextAtom style={styles.submitText}>Submit</TextAtom>
            </TouchableAtom>
          </View>
        </ViewAtom>
      </View>
    </Modal>
  );
};

export default AssignmentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: vw(20),
  },
  modalBox: {
    backgroundColor: colors.white,
    borderRadius: vw(8),
    padding: vw(15),
  },
  title: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    marginBottom: vh(10),
    color: colors.black,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: vh(15),
    gap: vw(10),
  },
  cancelBtn: {
    paddingHorizontal: vw(15),
    paddingVertical: vh(6),
  },
  cancelText: {
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: vw(18),
    paddingVertical: vh(6),
    borderRadius: vw(4),
  },
  submitText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
  },
  errorText: {
    marginTop: vh(4),
    color: colors.red,
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
  },
  centerContent: {
    width: vw(300),
    marginTop: vh(5),
  },
  centerDownArrow: {
    marginLeft: vh(-300),
  },
});
