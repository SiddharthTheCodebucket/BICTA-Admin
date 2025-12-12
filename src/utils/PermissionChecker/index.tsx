export const matchPermission = (
  userPerms: any,
  { name, module, parent }: any,
) => {
  return userPerms?.some((p: any) => {
    return (
      (name ? p.permissionName === name : true) &&
      (module ? p.module === module : true) &&
      (parent ? p.parent === parent : true)
    );
  });
};
