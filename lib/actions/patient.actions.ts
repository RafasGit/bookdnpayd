"use server"

import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file"

import {
    BUCKET_ID,
    DATABASE_ID,
    ENDPOINT,
    PATIENT_COLLECTION_ID,
    PROJECT_ID,
    databases,
    storage,
    
  } from "../appwrite.config";
  import { parseStringify } from "../utils";
  import { users, } from "../appwrite.config";


  export const createUser = async (user: CreateUserParams) => {
    try {
      // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
      const newUser = await users.create(
        ID.unique(),
        user.email,
        user.phone,
        undefined,
        user.name
      )
      console.log({newUser})
      return parseStringify(newUser);
      
    } catch (error: any) {
      // Check existing user
      if (error && error?.code === 409) {
        const existingUser = await users.list([
          Query.equal("email", [user.email]),
        ]);
  
        return existingUser.users[0];
      }
      console.error("An error occurred while creating a new user:", error);
    }
  };

  // GET USER
export const getUser = async (userId: string) => {
    try {
      const user = await users.get(userId);
  
      return parseStringify(user);
    } catch (error) {
      console.error(
        "An error occurred while retrieving the user details:",
        error
      );
    }
  };
  //66cc975c0011c129780c  66cc8ea7001cee116f48  66cc8dc10012e97c462f
    // GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
     
    );
    console.log(`Patient data:`, PATIENT_COLLECTION_ID)
    if (!patients.documents || patients.documents.length === 0) {
      throw new Error(`No patient found for userId: ${userId}`);
    }

    const patientData = patients.documents[0];
    console.log(`Patient data:`, patientData);

    // Parse the patient data
    const parsedPatient = parseStringify(patientData);

    // Check if parsing was successful
    if (!parsedPatient) {
      throw new Error('Failed to parse patient data');
    }

    return parsedPatient;
  } 
    catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error
    );
  }
};
  
 // REGISTER PATIENT
export const registerPatient = async ({
    identificationDocument,
    ...patient
  }: RegisterUserParams) => {
    try {
      // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile
      let file;
      if (identificationDocument) {
        const inputFile =
          identificationDocument &&
          InputFile.fromBuffer(
            identificationDocument?.get("blobFile") as Blob,
            identificationDocument?.get("fileName") as string
          );
  
        file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
      }
  
      // Create new patient document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument
      const newPatient = await databases.createDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        ID.unique(),
        
        {
          identificationDocumentId: file?.$id ? file.$id : null,
          identificationDocumentUrl:  `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view??project=${PROJECT_ID}`
            ,
          ...patient,
        }
      );
      console.log({newPatient})


      return parseStringify(newPatient);
    } catch (error) {
      console.error("An error occurred while creating a new patient:", error);
    }
  };
   

