import bcrypt from "bcrypt"
import { uuidv4 } from "uuid"
import { s3 } from "../../s3"

import { createToken, verifyToken } from "../../utils/auth"
import UserModel from "../../models/user"
import { UserInputError } from "apollo-server-express";

export default {
  // Login
  async login(root: any, args: { email: string; password: string }, context: any) {
    const { email, password } = args;

    const user: any = await UserModel.findOne({ email });
    if (!user) throw new UserInputError("Email does not exist");

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) throw new UserInputError("Password incorrect");
    if (!user.verified) throw new UserInputError("Your account is being verified by the administrator");

    return { ...user._doc, ...createToken(user._id) }
  },
  // Get user detail by token
  async getUserByToken(root: any, args: { token: string }, context: any) {
    const { token } = args;

    const { id } = verifyToken(token);

    const user = await UserModel.findById({ _id: id });
    if (!user) throw new UserInputError("Email does not exist");

    return user;
  },
  // Return signed URL for front-end to use
  async getSignedUrl(root: any, args: { fileName: string; fileType: string }, context: { token: string }) {
    const { token } = context;
    const _ = verifyToken(token);

    const { fileName, fileType } = args;
    const newFileName = `${uuidv4()}-${fileName}`;

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: newFileName,
      Expires: 60 * 20,
      ContentType: fileType,
      ACL: "public-read",
    };

    const preSignedUrl = await new Promise((resolve, reject) => {
      s3.getSignedUrl("putObject", s3Params, function (err: any, url: unknown) {
        if (err) {
          reject(err);
        }
        resolve(url);
      });
    });

    const returnData = {
      signedUrl: preSignedUrl,
      fileName: `${process.env.AWS_S3_BASE_URL}/${newFileName}`,
    };

    return returnData;
  },
}