/*
 * Commnunicate (Connect) with the server
 * */
import {
    FRONTENDURL, 
    BACKENDURL, 
    BriefInfoT, 
    MemoT, 
    MemoManipulateJsonT, 
    MemoManipulateResponseT
} from "./protocal.js"

import {getCookie} from "./libs/cookie.js"

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
            return memo;
        }
        throw Error(`Got response (${response.status})`);
    }

    async saveMemo(memo: MemoT): Promise<MemoManipulateResponseT> {

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
        const ret: MemoManipulateResponseT = await response.json();
        return ret;
    }

    async deleteMemo(memoId: string): Promise<MemoManipulateResponseT> {
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
        const ret: MemoManipulateResponseT = await response.json();
        return ret;
    }
}



