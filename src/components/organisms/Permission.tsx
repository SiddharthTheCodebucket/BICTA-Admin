import { useAppSelector } from '../../hooks';
import { matchPermission } from '../../utils/PermissionChecker';

export default function Permission({ name, module, parent, children }: any) {
  const userPermissions = useAppSelector(
    state => state.Auth.crediantialData.globalPermissions[0].permissions,
  );

  const allowed = matchPermission(userPermissions, { name, module, parent });

  if (!allowed) return null;
  return children;
}
