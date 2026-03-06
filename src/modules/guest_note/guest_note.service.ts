import { sequelize } from "../../config/db";
import { Transaction } from "sequelize";
import GuestNote from "./guest_note.model";
import Guest from "../guest/guest.model";
import ApiError from "../../middleware/error-handlers/ApiError";
import User from "../users/user.model";

class GuestNoteService {
  //--------------------------------
  // CREATE NOTE
  //--------------------------------
  static async createNote(
    guestId: string,
    data: any,
    user: any,
  ): Promise<GuestNote> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const guest = await Guest.findByPk(guestId, { transaction });

      if (!guest) {
        throw new ApiError(404, "Guest not found");
      }

      const note = await GuestNote.create(
        {
          guest_id: guestId,
          title: data.title,
          description: data.description ?? null,
          created_by: user.id,
          updated_by: user.id,
        },
        { transaction },
      );

      await transaction.commit();

      return note;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // GET NOTES BY GUEST
  //--------------------------------
  static async getNotesByGuest(guestId: string): Promise<GuestNote[]> {
    const guest = await Guest.findByPk(guestId);

    if (!guest) {
      throw new ApiError(404, "Guest not found");
    }

    return await GuestNote.findAll({
      where: { guest_id: guestId },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "full_name"],
        },
        {
          model: User,
          as: "updater",
          attributes: ["id", "full_name"],
        },
      ],
    });
  }
  //--------------------------------
  // UPDATE NOTE
  //--------------------------------
  static async updateNote(
    id: string,
    data: any,
    user: any,
  ): Promise<GuestNote> {
    const note = await GuestNote.findByPk(id);

    if (!note) {
      throw new ApiError(404, "Note not found");
    }

    await note.update({
      ...data,
      updated_by: user.id,
    });

    return note;
  }

  //--------------------------------
  // DELETE NOTE
  //--------------------------------
  static async deleteNote(id: string): Promise<void> {
    const note = await GuestNote.findByPk(id);

    if (!note) {
      throw new ApiError(404, "Note not found");
    }

    await note.destroy();
  }
}

export default GuestNoteService;
