import { Router, Request, Response } from "express";
import { ChatService } from "../services/chat.service.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({
        success: false,
        message: "Message text is required.",
      });
      return;
    }

    const response = await ChatService.reply(message.trim(), Array.isArray(history) ? history : []);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to process chat request at this moment.",
    });
  }
});

export default router;
