/*
 * Commnunicate (Connect) with the server
 * */
import {FRONTENDURL, BACKENDURL} from "./config.js"
import {getCookie} from "./libs/cookie.js"

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
}

export class ServerConn{
    constructor(){ };

    readonly FRONTENDURL: string = FRONTENDURL;
    readonly BACKENDURL: string = BACKENDURL;

    get usrId(): string {
        return getCookie("usrId");
    }

    get usrName(): string {
        // Test for now
        return ""
    }

    /*
     * Get brief information of all memos
    * */
    async index(): Promise<BriefInfoT[]> {
        const response = await fetch(`${this.BACKENDURL}/index`);
        if (response.ok){
            const res = await response.json();
            let info: BriefInfoT[] = res["brief_info"];
            return info;
        }
        throw Error(`Got response (${response.status})`);
    }

    /*
     * Get detailed info about one memo
    * */
    async fetchMemo(memo_id: string): Promise<MemoT> {
        const fetchUrl = new URL(`${this.BACKENDURL}/memo`);
        fetchUrl.searchParams.append("memo_id", memo_id);
        const response = await fetch(fetchUrl.toString());
        if (response.ok){
            const memo: MemoT = await response.json();
            console.log(memo);
            return memo;
        }
        throw Error(`Got response (${response.status})`);
    }

    async saveMemo(memo: MemoT): Promise<boolean> {

        const postParams: MemoManipulateJsonT = {
            action: "edit",
            memo: memo
        }
        const response = await fetch(
            `${this.BACKENDURL}/memo`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(postParams)
            }
        );
        const ret: MemoManipulateResponseJsonT = await response.json();
        return ret["status"];
    }

    async deleteMemo(memoId: string): Promise<boolean> {
        const postParams: MemoManipulateJsonT = {
            action: "delete",
            memo_id: memoId,
        }
        const response = await fetch(
            `${this.BACKENDURL}/memo`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(postParams)
            }
        );
        const ret: MemoManipulateResponseJsonT = await response.json();
        return ret["status"];
    }
}



