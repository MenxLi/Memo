import {getCookie, setCookie} from './libs/cookie.js'
import {FRONTENDURL, getMemoURL, BriefInfoT} from './protocal.js'
import {authUsr} from './login.js'
import {ServerConn} from './serverConn.js'
import { utcStamp2LocaleStr } from './libs/timeUtils.js'
import { setValueChangeOnHover } from './libs/uiUtils.js'

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

function eraseUsrInfo(){
    setCookie("usrId", "", -1);
    setCookie("usrEncPasswd", "", -1);
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
        <label class="time_added">${utcStamp2LocaleStr(bInfo.time_added, true).slice(0, -3)}</label>
        <div class="entry_bInfo">
            <label class="title">${bInfo.title}</label>
            <label class="short_content">${parseShortContent(bInfo.short_content)}</label>
        </div>
        <label class="memo_id">${bInfo.uid}</label>
        `
        indexDiv.appendChild(entry);

        // enclosure of the uid
        const redirectMethod = function(){
            const uid = bInfo.uid;
            return ()=>{
                window.location.href = getMemoURL(uid);
            }
        }

        entry.addEventListener("click", redirectMethod());
    }
}

// main
const logoutBtn: HTMLInputElement = document.querySelector("div#banner #logoutBtn")!;
const writeBtn: HTMLInputElement = document.querySelector("div#banner #writeBtn")!;

checkUsrInfo();
fetchBriefInfo();
logoutBtn.addEventListener(
    "click", () => {
        eraseUsrInfo();
        window.location.href = `${conn.FRONTENDURL}/login.html`;
    }
)
setValueChangeOnHover<HTMLInputElement, string>(
    logoutBtn, 
    (elem) => {return elem.value},
    (elem, val) => {elem.value = val},
    () => {return "logout"}
)
writeBtn.addEventListener(
    "click", () => {
        const url = new URL(`${conn.FRONTENDURL}/editor.html?new`);
        url.searchParams.append("memo_id", "new");
        window.location.href = url.toString();
    }
)
setValueChangeOnHover<HTMLInputElement, string>(
    writeBtn, 
    (elem) => {return elem.value},
    (elem, val) => {elem.value = val},
    () => {return "write"}
)
