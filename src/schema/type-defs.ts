import { gql } from "apollo-server-express"

export const typeDefs = gql`
  scalar Date

  type Query {
    # Sign in/Sign up
    login(email: String!, password: String!): User!
    getUserByToken(token: String!): User!
    getSignedUrl(fileName: String!, fileType: String!): File!
  }

  type Mutation {
    # Sign in/Sign up
    createUser(
      email: String!
      password: String!
      confirm: String!
      firstname: String!
      lastname: String!
      code: String
    ): User!
    verifyToken(token: String!): User!
    confirmEmail(id: String!): User!

    # Setting
    updateProfile(
      oldPassword: String
      newPassword: String
      firstname: String!
      lastname: String!
      picture: String
    ): User!
  }
`;
