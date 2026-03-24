import { ObjectId } from "mongodb";

export const INVALID_INDEX = 1000000000;
export const OWNER_ID = ObjectId.createFromHexString("fade-deaf-face-babe-cafe-deed".replaceAll("-", ""));
