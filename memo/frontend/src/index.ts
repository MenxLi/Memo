import {getCookie, setCookie} from './libs/cookie.js'
import {FRONTENDURL} from './config.js'
import {authUsr} from './login.js'
import {ServerConn, BriefInfoT} from './serverConn.js'
import { utcStamp2LocaleStr } from './libs/timeUtils.js'
import "./banner.js"

const conn = new ServerConn();

function checkUsrInfo(): void {
    const usrId = getCookie("usrId");
    const usrEncPasswd = getCookie("usrEncPasswd");
    authUsr(usrId, usrEncPasswd, {
        onSuccess : () => {
            setCookie("usrId", usrId, 3);
            setCookie("usrEncPasswd", usrEncPasswd, 3);
        },
        onFailure : (msg: string) => {
            if (msg == "nouser" || msg == "unauthorized"){
                window.location.href = `${FRONTENDURL}/login.html`;
            }
            else{
                alert(`Failed to check usrInfo - (${msg})`);
            }
        }
    });
}

function fetchBriefInfo(){
    conn.index().then(
        render,
        (failed) => {
            console.log(failed);
        }
    );
}

function render(briefInfo: BriefInfoT[]){
    function parseShortContent(scontent: string): string{
        const MAX_LEN = 25;
        console.log(scontent);
        let ret = scontent.replace("\n/g", " ");
        if (ret.length > MAX_LEN) {
            ret = ret.slice(undefined, MAX_LEN);
            ret += "..."
        }
        return ret;
    }

    let bInfo: BriefInfoT;
    const indexDiv: HTMLDivElement = document.querySelector("#index_main_div")!;
    for (bInfo of briefInfo){
        const entry = document.createElement("div");
        entry.classList.add("index_entry");
        entry.classList.add(bInfo.uid);
        entry.innerHTML = `
        <label class="time_added">${utcStamp2LocaleStr(bInfo.time_added, true)}</label>
        <label class="title">${bInfo.title}</label>
        <label class="uid">${bInfo.uid}</label>
        <br>
        <label class="short_content">${parseShortContent(bInfo.short_content)}</label>
        `
        indexDiv.appendChild(entry);

        // enclosure of the uid
        const redirectMethod = function(){
            const uid = bInfo.uid;
            return ()=>{
                const url = new URL(`${conn.FRONTENDURL}/editor.html`);
                url.searchParams.append("memo_id", uid)
                window.location.href = url.toString();
            }
        }

        entry.addEventListener("click", redirectMethod());
    }
}

// main
checkUsrInfo();
fetchBriefInfo();
