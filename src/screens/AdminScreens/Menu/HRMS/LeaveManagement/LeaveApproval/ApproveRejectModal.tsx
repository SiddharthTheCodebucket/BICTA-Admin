import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, TextInput } from 'react-native';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

interface Props {
  visible: boolean;
  status: 'Approved' | 'Rejected' | null;
  onClose: () => void;
  onSubmit: (remark: string) => void;
}

const ApproveRejectModal = ({ visible, status, onClose, onSubmit }: Props) => {
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setRemark('');
      setError('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!remark.trim()) {
      setError('Remarks is required');
      return;
    }

    setError('');
    onSubmit(remark);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <ViewAtom style={styles.modalBox}>
          <TextAtom style={styles.title}>
            {status === 'Approved' ? 'Approve Leave' : 'Reject Leave'}
          </TextAtom>

          <TextAtom style={styles.label}>Remarks</TextAtom>

          <TextInput
            value={remark}
            onChangeText={text => {
              setRemark(text);
              if (error) setError('');
            }}
            placeholder="Enter remarks"
            multiline
            style={[styles.input, error && { borderColor: colors.red }]}
          />

          {!!error && <TextAtom style={styles.errorText}>{error}</TextAtom>}

          <View style={styles.btnRow}>
            <TouchableAtom style={styles.cancelBtn} onPress={onClose}>
              <TextAtom style={styles.cancelText}>Cancel</TextAtom>
            </TouchableAtom>

            <TouchableAtom
              style={[
                styles.submitBtn,
                status === 'Rejected' && { backgroundColor: colors.red },
              ]}
              onPress={handleSubmit}
            >
              <TextAtom style={styles.submitText}>Submit</TextAtom>
            </TouchableAtom>
          </View>
        </ViewAtom>
      </View>
    </Modal>
  );
};

export default ApproveRejectModal;

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
  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    marginBottom: vh(5),
  },
  input: {
    minHeight: vh(80),
    borderWidth: 1,
    borderColor: colors.grey_1,
    borderRadius: vw(6),
    padding: vw(10),
    textAlignVertical: 'top',
    fontFamily: fonts.Roboto_Regular,
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
    backgroundColor: colors.green,
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
});
