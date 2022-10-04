import { setCookie } from "./libs/cookie.js";
import { FRONTENDURL } from "./config.js";

function eraseUsrInfo(){
    setCookie("usrId", "", -1);
    setCookie("usrEncPasswd", "", -1);
}

// main
const banner = document.querySelector("div#banner");
if (banner){
    // Create a banner
    
    banner.innerHTML = `
        <input type="button" value="logout" id="logout_btn"></input>
    `

    document.querySelector("div#banner #logout_btn")?.addEventListener(
        "click", () => {
            eraseUsrInfo();
            window.location.href = `${FRONTENDURL}/login.html`;
        }
    )
}
