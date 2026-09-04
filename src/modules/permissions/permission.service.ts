import Permission from "./permission.model";

class PermissionService {
  //--------------------------------
  // GET All Permissions
  //--------------------------------
  static async getAllPermissions(): Promise<Permission[]> {
    return await Permission.findAll({
      order: [["permission_type", "ASC"]],
    });
  }
}

export default PermissionService;
