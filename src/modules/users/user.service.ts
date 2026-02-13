import bcrypt from "bcryptjs";
import { Transaction } from "sequelize";
import { sequelize } from "../../config/db";
import User from "./user.model";
import Role from "../roles/role.model";
import { CreateUserInput } from "./user.validation";
import { UserAttributes } from "./user.model";

export const createUserService = async (
  payload: CreateUserInput,
): Promise<Omit<UserAttributes, "password">> => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const existingEmail = await User.findOne({
      where: { email: payload.email },
      transaction,
    });

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const existingUsername = await User.findOne({
      where: { username: payload.username },
      transaction,
    });

    if (existingUsername) {
      throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await User.create(
      {
        full_name: payload.full_name,
        username: payload.username,
        email: payload.email,
        password: hashedPassword,
      },
      { transaction },
    );

    const role = await Role.findOne({
      where: { role_name: payload.role_name },
      transaction,
    });

    if (!role) {
      throw new Error("Role not found");
    }

    await user.addRole(role, { transaction });

    await transaction.commit();

    const { password, ...safeUser } = user.get({ plain: true });

    return safeUser;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
