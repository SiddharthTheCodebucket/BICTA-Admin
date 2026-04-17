import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  FormDropdownFieldWithTitle,
  FormRadioFieldWithTitle,
  FormTextInputWithTitle,
  FormFieldWrapper,
} from '../../../../../../components/templates';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import { colors, vh, vw } from '../../../../../../constants';

interface Props {
  form: any;
  errors: any;
  setValue: (key: string, value: any) => void;
  setErrors: (errors: any) => void;
  trainingCenterList: any[];
  trainingNameList: any[];
  batchNumberList: any[];
  departmentList: any[];
  designationList: any[];
  genderList: any[];
  bloodGroupList: any[];
  isBulk: boolean;
  isManual: boolean;
  isNo: boolean;
  tenantId: number;
  onTrainingCenterChange: (item: any) => void;
  onTrainingNameChange: (item: any) => void;
}

const AddTraineeRegistration_1 = ({
  form,
  errors,
  setValue,
  setErrors,
  trainingCenterList,
  trainingNameList,
  batchNumberList,
  departmentList,
  designationList,
  genderList,
  bloodGroupList,
  isBulk,
  isManual,
  isNo,
  tenantId,
  onTrainingCenterChange,
  onTrainingNameChange,
}: Props) => {
  return (
    <FormFieldWrapper>
      <FormDropdownFieldWithTitle
        title="Registration Type"
        placeholder="Manual Upload"
        data={form.registrationTypeList}
        value={form.selectedRegistration?.id}
        onChange={(data: any) => {
          setValue('selectedRegistration', data);
          setErrors({ ...errors, 'selectedRegistration.name': '' });
        }}
        labelField="name"
        valueField="id"
        isMandatory
        errorMessage={errors['selectedRegistration.name']}
      />

      {!isBulk && (
        <FormRadioFieldWithTitle
          title="Is Already Registered?"
          data={form.isAlereadyRegistredList}
          selectedValue={form.selectedIsAlereadyRegistred?.id}
          onSelect={(data: any) => {
            setValue('selectedIsAlereadyRegistred', data);
            setErrors({ ...errors, 'selectedIsAlereadyRegistred.name': '' });
          }}
          labelField="name"
          valueField="id"
          isMandatory
          errorMessage={errors['selectedIsAlereadyRegistred.name']}
        />
      )}

      <FormDropdownFieldWithTitle
        title="Training Centre"
        placeholder="Select"
        data={trainingCenterList}
        value={form.selectedTrainingCenter?.id}
        onChange={onTrainingCenterChange}
        labelField="name"
        valueField="id"
        isMandatory
        disabled={tenantId !== 3}
        errorMessage={errors['selectedTrainingCenter.name']}
      />

      <FormDropdownFieldWithTitle
        title="Training Name"
        placeholder="Select"
        data={trainingNameList}
        value={form.selectedTrainingName?.id}
        onChange={onTrainingNameChange}
        labelField="name"
        valueField="id"
        isMandatory
        errorMessage={errors['selectedTrainingName.name']}
      />

      <FormDropdownFieldWithTitle
        title="Batch No"
        placeholder="Select"
        data={batchNumberList}
        value={form.selectedBatchList?.id}
        onChange={(data: any) => {
          setValue('selectedBatchList', data);
          setErrors({ ...errors, 'selectedBatchList.name': '' });
        }}
        labelField="name"
        valueField="id"
        isMandatory
        errorMessage={errors['selectedBatchList.name']}
      />

      {(isBulk || (isManual && isNo)) && (
        <FormDropdownFieldWithTitle
          title="Department"
          placeholder="Select"
          data={departmentList}
          value={form.selectedDepartmentList?.id}
          onChange={(data: any) => {
            setValue('selectedDepartmentList', data);
            setErrors({ ...errors, 'selectedDepartmentList.name': '' });
          }}
          labelField="name"
          valueField="id"
          isMandatory
          errorMessage={errors['selectedDepartmentList.name']}
        />
      )}

      {isManual && (
        <>
          <FormTextInputWithTitle
            title="Name"
            placeholder="Enter"
            value={form.name}
            onChangeText={(val: string) => {
              setValue('name', val);
              setErrors({ ...errors, name: '' });
            }}
            isMandatory
            errorMessage={errors.name}
          />

          <FormDropdownFieldWithTitle
            title="Designation"
            placeholder="Select"
            data={designationList}
            value={form.selectedDesignation?.id}
            onChange={(data: any) => {
              setValue('selectedDesignation', data);
              setErrors({ ...errors, 'selectedDesignation.name': '' });
            }}
            labelField="name"
            valueField="id"
            isMandatory
            errorMessage={errors['selectedDesignation.name']}
          />

          <View>
            <FormTextInputWithTitle
              title="Place of Posting"
              placeholder="Gaya"
              value={form.placeOfPosting}
              onChangeText={(val: string) => {
                setValue('placeOfPosting', val);
                setErrors({ ...errors, placeOfPosting: '' });
              }}
              isMandatory
              errorMessage={errors.placeOfPosting}
            />
            <TextAtom style={styles.helperText}>
              NOTE: If the training shown above is not yours, please contact the
              concerned person or scan other available QR code.
            </TextAtom>
          </View>

          <FormDropdownFieldWithTitle
            title="Gender"
            placeholder="Male"
            data={genderList}
            value={form.selectedGender?.id}
            onChange={(data: any) => {
              setValue('selectedGender', data);
              setErrors({ ...errors, 'selectedGender.name': '' });
            }}
            labelField="name"
            valueField="id"
            isMandatory
            errorMessage={errors['selectedGender.name']}
          />

          <FormTextInputWithTitle
            title="Office Email"
            placeholder="Enter"
            value={form.officeEmail}
            onChangeText={(val: string) => {
              setValue('officeEmail', val);
              setErrors({ ...errors, officeEmail: '' });
            }}
            isMandatory
            errorMessage={errors.officeEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </>
      )}

      {isManual && isNo && (
        <>
          <FormTextInputWithTitle
            title="Date of Birth"
            placeholder="12-12-1990"
            value={form.dob}
            onChangeText={(val: string) => {
              setValue('dob', val);
              setErrors({ ...errors, dob: '' });
            }}
            isMandatory
            errorMessage={errors.dob}
          />

          <FormTextInputWithTitle
            title="Aadhaar No"
            placeholder="Enter"
            value={form.aadharNumber}
            onChangeText={(val: string) => {
              setValue('aadharNumber', val.replace(/\D/g, ''));
              setErrors({ ...errors, aadharNumber: '' });
            }}
            keyboardType="numeric"
            maxLength={12}
            isMandatory
            errorMessage={errors.aadharNumber}
          />

          <FormTextInputWithTitle
            title="Mobile Number"
            placeholder="Enter"
            value={form.mobileNumber}
            onChangeText={(val: string) => {
              setValue('mobileNumber', val.replace(/\D/g, ''));
              setErrors({ ...errors, mobileNumber: '' });
            }}
            isMandatory
            errorMessage={errors.mobileNumber}
            keyboardType="numeric"
            maxLength={10}
          />

          <FormDropdownFieldWithTitle
            title="Blood Group"
            placeholder="Select"
            data={bloodGroupList}
            value={form.selectedBloodGroup?.id}
            onChange={(data: any) => {
              setValue('selectedBloodGroup', data);
              setErrors({ ...errors, 'selectedBloodGroup.name': '' });
            }}
            labelField="name"
            valueField="id"
            isMandatory
            errorMessage={errors['selectedBloodGroup.name']}
          />
        </>
      )}
    </FormFieldWrapper>
  );
};

export default AddTraineeRegistration_1;

const styles = StyleSheet.create({
  helperText: {
    color: colors.red,
    fontSize: 11,
    marginBottom: vh(10),
    marginLeft: vw(8),
  },
});
