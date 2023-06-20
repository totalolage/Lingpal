import { NextApiRequest, NextApiResponse } from "next";
import { connectToDB } from "../db/connect";

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) => unknown | Promise<unknown>;

export const validateRoute = (handler: Handler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) {
      console.log("no refresh token");
      return res.status(401).json({ message: "Access forbiden" });
    }
    const { db } = await connectToDB();
    const user = await db.collection("users").findOne({ refreshToken });
    if (!user) {
      console.log("user does not exist");
      return res.status(401).json({ message: "Access forbiden" });
    }
    return handler(req, res, user);
  };
};
