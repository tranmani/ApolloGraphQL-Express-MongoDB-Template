import { gql } from "apollo-server-express"

export const userSchema = gql`
  scalar Long

  type User {
    _id: String
    email: String
    password: String
    role: String
    picture: String
    firstname: String
    lastname: String
    token: String
    code: String
    verified: Boolean
    createdAt: Long
    updatedAt: Long
  }

  input UserInput {
    email: String
    password: String
    picture: String
    firstname: String
    lastname: String
    code: String
  }

  type File {
    signedUrl: String!
    fileName: String!
  }
`;
