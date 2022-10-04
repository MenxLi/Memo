
export const BACKENDURL = 'http://localhost:8888';
export const FRONTENDURL = 'http://localhost:8888/frontend';

// Protocals
export interface AuthInfoT {
    usrId: string;
    usrEncPasswd: string;
};

export type AuthReturnT = "success" | "unauthorized" | "nouser";

