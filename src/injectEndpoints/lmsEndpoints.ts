import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listTrainingCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_training_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addTrainingCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_training_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTrainingCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_training_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTrainingCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_training_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addFileNoTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_fileNo_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTraineeLoginDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_trainee_login_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    extendTrainingEndDate: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.extend_training_end_date,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTrainingBatchDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_training_batch_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTrainingBatchDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_training_batch_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTraineeDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_trainee_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    mergeTrainingBatchDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.merge_training_batch_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTraineeRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_trainee_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addTraineeRegistrationBulk: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_trainee_registration_bulk,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addTraineeRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_trainee_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTraineeRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_trainee_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
    approveTrainingIdCard: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.approve_training_id_card,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTrainingIdCard: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_training_id_card,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTraineeRegForm: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_trainee_reg_form,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTraineeManageIndemnityBond: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_trainee_manage_indemnity_bond,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTraineeManageIndemnityBond: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_trainee_manage_indemnity_bond,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTraineeDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_trainee_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    releaseTraineeFromTraining: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.release_trainee_from_training,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addMukhiyaRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_mukhiya_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listFacultyDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_faculty_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateFacultyDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_faculty_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listFacultyConfirmation: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_faculty_confirmation,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateFacultyConfirmation: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_faculty_confirmation,
        method: 'POST',
        body: requestParams,
      }),
    }),
    reportListFacultyFeedbackReport: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.report_list_faculty_feedback_report,
        method: 'POST',
        body: requestParams,
      }),
    }),
    reportListFacultySubFeedbackReport: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.report_list_faculty_sub_feedback_report,
        method: 'POST',
        body: requestParams,
      }),
    }),
    reportListFacultyTopicFeedbackReport: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.report_list_faculty_tpoic_feedback_report,
        method: 'POST',
        body: requestParams,
      }),
    }),
    reportListFeedbackTrainneDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.report_list_feedback_trainne_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteFacultyDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_faculty_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listKnowledgeManagement: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_knowledge_managemnet,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listKnowledgeManagementSubTopic: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_knowledge_managemnet_sub_topic,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listClassLocationDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_class_location_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateClassLocationDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_class_location_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listClassSubLocationDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_class_sub_location_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateClassSubLocationDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_class_sub_location_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListTrainingCategoryMutation,
  useAddTrainingCategoryMutation,
  useUpdateTrainingCategoryMutation,
  useDownloadTrainingCategoryMutation,
  useListTrainingDetailsMutation,
  useAddFileNoTrainingDetailsMutation,
  useUpdateTraineeLoginDetailsMutation,
  useExtendTrainingEndDateMutation,
  useDeleteTrainingDetailsMutation,
  useAddTrainingDetailsMutation,
  useUpdateTrainingDetailsMutation,
  useListTrainingBatchDetailsMutation,
  useUpdateTrainingBatchDetailsMutation,
  useListTraineeDetailsMutation,
  useMergeTrainingBatchDetailsMutation,
  useListTraineeRegistrationMutation,
  useAddTraineeRegistrationBulkMutation,
  useAddTraineeRegistrationMutation,
  useUpdateTraineeRegistrationMutation,
  useApproveTrainingIdCardMutation,
  useDownloadTrainingIdCardMutation,
  useDownloadTraineeRegFormMutation,
  useListTraineeManageIndemnityBondMutation,
  useDownloadTraineeManageIndemnityBondMutation,
  useDownloadTraineeDetailsMutation,
  useReleaseTraineeFromTrainingMutation,
  useAddMukhiyaRegistrationMutation,
  useListFacultyDetailsMutation,
  useUpdateFacultyDetailsMutation,
  useListFacultyConfirmationMutation,
  useUpdateFacultyConfirmationMutation,
  useReportListFacultyFeedbackReportMutation,
  useReportListFacultySubFeedbackReportMutation,
  useReportListFacultyTopicFeedbackReportMutation,
  useReportListFeedbackTrainneDetailsMutation,
  useDeleteFacultyDetailsMutation,
  useListKnowledgeManagementMutation,
  useListKnowledgeManagementSubTopicMutation,
  useListClassLocationDetailsMutation,
  useUpdateClassLocationDetailsMutation,
  useListClassSubLocationDetailsMutation,
  useUpdateClassSubLocationDetailsMutation,
} = apiEndpoints;
