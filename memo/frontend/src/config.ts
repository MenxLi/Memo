
export const BACKENDURL = 'http://localhost:8888/backend';
export const FRONTENDURL = 'http://localhost:8888';

// Protocals
export interface AuthInfoT {
    usrId: string;
    usrEncPasswd: string;
};

export type AuthReturnT = "success" | "unauthorized" | "nouser";

