
import {setCookie} from "./libs/cookie.js";
import {sha256} from "./libs/sha256lib.js"
import {BACKENDURL, AuthInfoT, FRONTENDURL} from './config.js'


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
document.querySelector("#submit_btn")?.addEventListener("click", onSubmitLogin);
