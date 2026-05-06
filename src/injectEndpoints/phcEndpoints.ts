import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listPatientPrescriptions: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_patient_prescriptions,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listMedicine: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_medicine,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addMedicine: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_medicine,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateMedicine: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_medicine,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteMedicine: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_medicine,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listMedicineType: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_medicine_type,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addMedicineType: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_medicine_type,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateMedicineType: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_medicine_type,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteMedicineType: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_medicine_type,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listMedicineBatch: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_medicine_batch,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listPharmacyReport: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_pharmacy_report,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTraineeBmi: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_trainee_bmi,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listPatientSymptomsDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_patient_symptoms_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListPatientPrescriptionsMutation,
  useListMedicineMutation,
  useAddMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
  useListMedicineTypeMutation,
  useAddMedicineTypeMutation,
  useUpdateMedicineTypeMutation,
  useDeleteMedicineTypeMutation,
  useListMedicineBatchMutation,
  useListPharmacyReportMutation,
  useListTraineeBmiMutation,
  useListPatientSymptomsDetailsMutation,
} = apiEndpoints;
