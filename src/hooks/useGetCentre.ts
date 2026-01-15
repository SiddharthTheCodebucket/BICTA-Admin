import { useAppSelector } from '.';

export const useGetCentre = () => {
  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  if (tenantId === 1) {
    return ['Gaya'];
  } else if (tenantId === 2) {
    return ['Patna'];
  } else {
    return ['Gaya', 'Patna'];
  }
};
