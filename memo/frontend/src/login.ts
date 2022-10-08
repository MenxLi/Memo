
import {setCookie, getCookie} from "./libs/cookie.js";
import {sha256} from "./libs/sha256lib.js"
import {BACKENDURL, AuthInfoT, FRONTENDURL} from './protocol.js'

const STAY_LOGIN_DAYS = 3;

function onSubmitLogin(){
    const usrIdInput: HTMLInputElement = document.querySelector("#usr_id")!; // ! <- non-null assertion
    const passwdInput: HTMLInputElement = document.querySelector("#usr_passwd")!;
    const usrId: string = usrIdInput.value;
    const usrPasswd: string = passwdInput.value;
    const encPasswd = encTextSha256(usrPasswd);

    const keepLoginCheckbox: HTMLInputElement = document.querySelector("#stay_login_chk")!;
    let keepTime: null|number = STAY_LOGIN_DAYS;
    authUsr(usrId, encPasswd, {
        onSuccess : () => {
            if (!keepLoginCheckbox.checked){
                keepTime = null;
            }
            setCookie("usrId", usrId, keepTime);
            setCookie("usrEncPasswd", encPasswd, keepTime);
            setCookie("keepLogin", keepLoginCheckbox.checked?"1":"0", keepTime);
            window.location.href = `${FRONTENDURL}/index.html`;
        },
        onFailure : (msg: string) => {
            alert(msg);
        }
    });
}

export function checkUsrInfo(): void {
    const usrId = getCookie("usrId");
    const usrEncPasswd = getCookie("usrEncPasswd");
    const keepLogin: boolean = Number.parseInt(getCookie("keepLogin")) == 1? true:false;
    let keepTime: null |number = null;
    if (keepLogin){
        keepTime = STAY_LOGIN_DAYS;
    }
    authUsr(usrId, usrEncPasswd, {
        onSuccess : () => {
            setCookie("usrId", usrId, keepTime);
            setCookie("usrEncPasswd", usrEncPasswd, keepTime);
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

export function eraseUsrInfo(){
    setCookie("usrId", "", -1);
    setCookie("usrEncPasswd", "", -1);
    setCookie("keepLogin", "0", -1);
}

export function authUsr(
    usrId: string, 
    encPasswd: string,
    {
        onSuccess = function(){},
        onFailure = function(msg){},
    }: {
        onSuccess?: ()=>void;
        onFailure?: (msg: string)=>void;
    } = {}): void{

        const params: AuthInfoT = {
            usrId: usrId,
            usrEncPasswd: encPasswd
        }

        fetch(`${BACKENDURL}/auth`, 
              {
                  method: "POST",
                  headers: {
                      "Content-Type":"application/json"
                  },
                  body: JSON.stringify(params)
              }).then(
                  (response) => {
                      if (response.ok){
                          // response is of AuthReturnT
                          return response.text();
                      }
                      else{
                          return `Failed - ${response.status.toString()}`;
                      }
                  }
              ).then(
                  (data) => {
                      if (data == "success"){
                          onSuccess();
                      }
                      else{
                          onFailure(data);
                      }
                  }
              )
}

function encTextSha256(txt: string): string{
    const enc = sha256(txt);
    if (enc){
        return enc
    }
    else{
        throw new Error("Error on encoding sha256: check if you input non-ascii code...")
    }
}

// main
// this script may be impoted as a module
// but the following code won't run on other scripts
// because querySelector will result in null
const submitBtn = document.querySelector("#submit_login_btn");
if (submitBtn){
    submitBtn.addEventListener("click", onSubmitLogin);
}
