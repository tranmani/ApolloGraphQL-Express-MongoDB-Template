import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import { UserInputError } from "apollo-server-express"

import { createToken, verifyToken } from "../../utils/auth"
import UserModel from "../../models/user"

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.ADMIN_GMAIL,
//     pass: process.env.GMAIL_APP_PASS,
//   },
// });

export default {
  // Create new user based on role
  async createUser(root: any, args: { email: string; password: string; confirm: string; firstname: string; lastname: string }, context: any) {
    const {
      email,
      password,
      confirm,
      firstname,
      lastname,
    } = args;

    const existingUser: any = await UserModel.findOne({ email });

    if (existingUser) {
      throw new UserInputError("Email already exists!");
    }

    if (password !== confirm) {
      throw new UserInputError("Passwords are inconsistent!");
    }

    if (!firstname) {
      throw new UserInputError("First name is required!");
    }

    if (!lastname) {
      throw new UserInputError("Last name is required!");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user: any = new UserModel(
      {
        email,
        password: hashedPassword,
        firstname,
        lastname,
      },
    );

    // Save new user
    user.save();

    // // Send email to newly created user
    // const sendToUser = {
    //   from: "donal@trump.com",
    //   to: email,
    //   subject: "Account registration confirmation - FIFA Dashboard",
    //   html: `<h1>Welcome to FIFA Dashboard</h1><p>Thank you ${firstname} ${lastname}!</p>`,
    // };

    // // Notify admin for new user
    // const sendToAdmin = {
    //   from: "donal@trump.com",
    //   to: process.env.ADMIN_GMAIL,
    //   subject: "New Account created - FIFA Dashboard",
    //   html: `<h1>New Account at FIFA Dashboard</h1>
    //   <p>New user info:
    //   <br/> <strong>Email</strong> : ${email}
    //   <br/> <strong>First Name</strong> : ${firstname}
    //   <br/> <strong>Last Name</strong> : ${lastname}`
    // };

    // transporter.sendMail(sendToUser, function (error: any, info: { response: string }) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent to user: " + info.response);
    //   }
    // });

    // transporter.sendMail(sendToAdmin, function (error: any, info: { response: string }) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent to admin: " + info.response);
    //   }
    // });

    return { ...user._doc, ...createToken(user._id) };
  },
  // Verify user email
  async confirmEmail(root: any, args: { id: string; }, context: any) {
    const { id } = args;

    const user = await UserModel.findById({ _id: id });
    if (!user) throw new UserInputError("User does not exist!");
    if (user.verified) throw new UserInputError("Account are already verified!");

    return await UserModel.findByIdAndUpdate(
      { _id: id },
      { $set: { verified: true } },
      { returnDocument: "after" }
    );
  },
  // Update user profile
  async updateProfile(root: any, args: { oldPassword: string; newPassword: string; firstname: string; lastname: string; picture: string }, context: { token: string }) {
    const { token } = context;
    const _ = verifyToken(token);

    const { oldPassword, newPassword, firstname, lastname, picture } =
      args;

    // Validate user email
    const user: any = await UserModel.findById({ _id: _.id });
    if (!user) throw new UserInputError("User does not exist!");

    // Check old password, if right then hash new password
    let hashedPassword: string;
    if (oldPassword && newPassword) {
      const passwordIsValid = bcrypt.compareSync(oldPassword, user.password);
      if (!passwordIsValid) return "Old password incorrect";

      const salt = bcrypt.genSaltSync(10);
      hashedPassword = await bcrypt.hash(newPassword, salt);
    }

    // Update user profile
    return await UserModel.findByIdAndUpdate(
      { _id: _.id },
      {
        $set: {
          password: hashedPassword ? hashedPassword : user.password,
          firstname: firstname ? firstname : user.firstname,
          lastname: lastname ? lastname : user.lastname,
          picture: picture ? picture : user.picture,
          updatedAt: Date.now(),
        },
      },
      { returnDocument: "after" }
    );
  },
}