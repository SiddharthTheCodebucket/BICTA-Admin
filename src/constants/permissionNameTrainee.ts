import { usePermission } from '../hooks/usePermission';

export const canDownloadProfile = () =>
  usePermission('DOWNLOAD TRAINEE REGISTRATION FORM FOR USER');
export const canDownloadIndemnity = () =>
  usePermission('DOWNLOAD TRAINEE INDEMNITY BOND FOR USER');
