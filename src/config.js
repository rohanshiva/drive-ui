import { Deta } from "deta-test";

const deta = Deta(process.env.REACT_APP_PROJECT_KEY);
export const drive = deta.Drive(process.env.REACT_APP_DRIVE_NAME);
