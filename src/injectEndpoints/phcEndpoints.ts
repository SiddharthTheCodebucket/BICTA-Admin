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
    listMedicineType: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_medicine_type,
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
  }),
  overrideExisting: false,
});
export const {
  useListPatientPrescriptionsMutation,
  useListMedicineMutation,
  useListMedicineTypeMutation,
  useListMedicineBatchMutation,
  useListPharmacyReportMutation,
  useListTraineeBmiMutation,
} = apiEndpoints;
