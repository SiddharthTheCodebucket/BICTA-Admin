import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpointsTrainee';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listAssignmentResponse: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_assignment_ressponse,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listCourseModule: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_course_module,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listWeekOfMonth: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_week_of_month,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listClassroomTimeTable: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_classroom_time_table,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateAssignmentResponse: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_assignment_response,
        method: 'POST',
        body: requestParams,
      }),
    }),
    feedbackListFaculty: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.feedback_list_faculty,
        method: 'POST',
        body: requestParams,
      }),
    }),
    feedbackAddFaculty: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.feedback_add_faculty,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListAssignmentResponseMutation,
  useListCourseModuleMutation,
  useListWeekOfMonthMutation,
  useListClassroomTimeTableMutation,
  useUpdateAssignmentResponseMutation,
  useFeedbackListFacultyMutation,
  useFeedbackAddFacultyMutation,
} = apiEndpoints;
