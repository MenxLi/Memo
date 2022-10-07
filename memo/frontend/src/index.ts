import {setCookie} from './libs/cookie.js'
import {getMemoURL, BriefInfoT} from './protocal.js'
import {ServerConn} from './serverConn.js'
import { checkUsrInfo } from './login.js'
import { utcStamp2LocaleStr } from './libs/timeUtils.js'
import { setValueChangeOnHover } from './libs/uiUtils.js'

const conn = new ServerConn();

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
    function clipShortContent(scontent: string): string{
        const MAX_LEN = 40;
        let ret = scontent.replace("\n/g", " ");
        if (ret.length > MAX_LEN) {
            ret = ret.slice(undefined, MAX_LEN);
            ret += "..."
        }
        return ret;
    }

    let bInfo: BriefInfoT;
    // sort by time added reverse
    briefInfo.sort((a, b) => {return b.time_added - a.time_added});
    const indexDiv: HTMLDivElement = document.querySelector("#index_main_div")!;
    for (bInfo of briefInfo){
        const entry = document.createElement("div");
        entry.classList.add("index_entry");
        entry.classList.add(bInfo.uid);
        entry.innerHTML = `
        <label class="time_added">${utcStamp2LocaleStr(bInfo.time_added, true).slice(0, -3)}</label>
        <div class="entry_bInfo">
            <label class="title">${bInfo.title}</label>
            <label class="short_content">${clipShortContent(bInfo.short_content)}</label>
        </div>
        <label class="memo_id">${bInfo.uid.slice(0, 12)}</label>
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
    };

    if (briefInfo.length === 0){
        // When empty memo,
        // create a prompt label
        const emptyPrompt = document.createElement("div");
        emptyPrompt.id = "emptyPromptDiv";
        emptyPrompt.innerHTML = "<p>Click on the write button to add your first memo!</p>";
        indexDiv.appendChild(emptyPrompt);
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
