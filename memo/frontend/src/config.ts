
export const BACKENDURL = 'http://localhost:8888/backend';
export const FRONTENDURL = 'http://localhost:8888';

export function getMemoURL(memo_id: string): string{
    const url = new URL(`${FRONTENDURL}/editor.html`);
    url.searchParams.append("memo_id", memo_id);
    return url.toString();
}


// Protocals
export interface AuthInfoT {
    usrId: string;
    usrEncPasswd: string;
};

export type AuthReturnT = "success" | "unauthorized" | "nouser";

