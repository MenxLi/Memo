import {BACKENDURL, FRONTENDURL} from "./config.js"

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

export {BACKENDURL, FRONTENDURL} from "./config.js"

export interface BriefInfoT {
    uid: string;
    title: string;
    time_added: number;
    short_content: string;
}

export interface MemoT {
    memo_id: string | null;
    // Time stamp are in seconds
    time_added: number;
    time_edit: number;
    usr_id: string;
    content: string;
    attachment: string[];
}
// export interface MemoNewT extends Omit<MemoT, "memo_id">{
//     memo_id: null
// }

export interface MemoManipulateJsonT {
    action: "edit" | "delete";
    memo?: MemoT;
    memo_id?: string;
}

export interface MemoManipulateResponseJsonT {
    status: boolean;
    memo_id?: string;
}

