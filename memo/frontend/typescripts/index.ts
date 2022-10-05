import {getCookie, setCookie} from './libs/cookie.js'
import {FRONTENDURL} from './config.js'
import {authUsr} from './login.js'
import {ServerConn, BriefInfoT} from './serverConn.js'
import "./banner.js"

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
    const conn = new ServerConn();
    conn.index().then(
        render,
        (failed) => {
            console.log(failed);
        }
    );
}

function render(briefInfo: BriefInfoT[]){
    let bInfo: BriefInfoT;
    for (bInfo of briefInfo){

    }
}

// main
checkUsrInfo();
fetchBriefInfo();

