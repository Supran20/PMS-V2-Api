import Role from "./role.model";
import Permission from "../permissions/permission.model";
import ApiError from "../../middleware/error-handlers/ApiError";

class RoleService {
  //--------------------------------
  // GET All Roles
  //--------------------------------
  static async getAllRoles(): Promise<Role[]> {
    return await Role.findAll();
  }

  //--------------------------------
  // GET Role's Default Permissions
  //--------------------------------
  static async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await Role.findByPk(roleId, {
      include: [
        {
          model: Permission,
          as: "permissions",
          through: { attributes: [] },
        },
      ],
    });

    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    return role.permissions ?? [];
  }
}

export default RoleService;
