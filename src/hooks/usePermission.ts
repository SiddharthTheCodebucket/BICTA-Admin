import { useAppSelector } from '../hooks';
import { matchPermission } from '../utils/PermissionChecker';

export const usePermission = (name?: string) => {
  const userPermissions = useAppSelector(
    state =>
      state.Auth.crediantialData?.globalPermissions?.[0]?.permissions || [],
  );

  return matchPermission(userPermissions, { name });
};
