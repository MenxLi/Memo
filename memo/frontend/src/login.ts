
import {setCookie, getCookie} from "./libs/cookie.js";
import {sha256} from "./libs/sha256lib.js"
import {BACKENDURL, AuthInfoT, FRONTENDURL} from './protocal.js'

function onSubmitLogin(){
    const usrIdInput: HTMLInputElement = document.querySelector("#usr_id")!; // ! <- non-null assertion
    const passwdInput: HTMLInputElement = document.querySelector("#usr_passwd")!;
    const usrId: string = usrIdInput.value;
    const usrPasswd: string = passwdInput.value;
    const encPasswd = encTextSha256(usrPasswd);

    authUsr(usrId, encPasswd, {
        onSuccess : () => {
            setCookie("usrId", usrId, 3);
            setCookie("usrEncPasswd", encPasswd, 3);
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
    return sha256(txt);
}

// main
// this script may be impoted as a module
// but the following code won't run on other scripts
// because querySelector will result in null
const submitBtn = document.querySelector("#submit_login_btn");
if (submitBtn){
    submitBtn.addEventListener("click", onSubmitLogin);
}
