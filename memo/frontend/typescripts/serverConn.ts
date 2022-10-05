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
}



