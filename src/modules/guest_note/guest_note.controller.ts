import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import GuestNoteService from "./guest_note.service";
import {
  createGuestNoteSchema,
  updateGuestNoteSchema,
} from "./guest_note.validation";

export class GuestNoteController {
  //--------------------------------
  // CREATE NOTE
  //--------------------------------
  static async create(req: AuthRequest, res: Response) {
    try {
      const validated = createGuestNoteSchema.parse(req.body);

      const note = await GuestNoteService.createNote(
        validated.guest_id,
        validated,
        req.user,
      );

      res.status(201).json({
        success: true,
        message: "Note created successfully",
        data: note,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // GET NOTES BY GUEST
  //--------------------------------
  static async getByGuest(req: AuthRequest, res: Response) {
    try {
      const notes = await GuestNoteService.getNotesByGuest(
        String(req.params.guestId),
      );

      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // UPDATE NOTE
  //--------------------------------
  static async update(req: AuthRequest, res: Response) {
    try {
      const validated = updateGuestNoteSchema.parse(req.body);

      const note = await GuestNoteService.updateNote(
        String(req.params.id),
        validated,
        req.user,
      );

      res.status(200).json({
        success: true,
        message: "Note updated successfully",
        data: note,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //--------------------------------
  // DELETE NOTE
  //--------------------------------
  static async delete(req: AuthRequest, res: Response) {
    try {
      await GuestNoteService.deleteNote(String(req.params.id));

      res.status(200).json({
        success: true,
        message: "Note deleted successfully",
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}
