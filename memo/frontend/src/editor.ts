
import {ServerConn} from './serverConn.js'
import {stamp2Input, input2Stamp} from './libs/timeUtils.js'
import {getCookie} from './libs/cookie.js';
import { getMemoURL, MemoT, MemoManipulateResponseT} from './protocal.js';
import {checkUsrInfo} from './login.js';

checkUsrInfo();
const conn = new ServerConn();
const timeAddedInput: HTMLInputElement = document.querySelector("#timeAddedInput")!;
const editSaveBtn: HTMLInputElement = document.querySelector("#editSaveBtn")!;
const deleteBtn: HTMLInputElement = document.querySelector("#deleteBtn")!;
const homeBtn: HTMLInputElement = document.querySelector("#homeBtn")!;
const inputView: HTMLTextAreaElement = document.querySelector("#inputView")!;
let thisMemo: MemoT;

/*Must call this function to initialize the window*/
function loadMemo(memo: MemoT){
    // save a global reference
    thisMemo = memo;

    stamp2Input(memo.time_added, timeAddedInput, true);
    inputView.value = memo.content;
    autoGrow(inputView);
    switchModeView();
}

function loadNewMemo(){
    const nowSecStamp = new Date().getTime()/1000;
    const memo: MemoT = {
        usr_id: getCookie("usrId"),
        memo_id: null,
        time_added: nowSecStamp,
        time_edit: nowSecStamp,
        content: "",
        attachment: []
    }
    loadMemo(memo);
}

function saveMemo(memo: MemoT){
    let timeAddedStamp: number;
    try{
        timeAddedStamp = input2Stamp(timeAddedInput, true);
    }
    catch (err){
        alert(err);
        return;
    }

    memo.content = inputView.value;
    memo.time_added = timeAddedStamp;

    conn.saveMemo(memo).then(
        (ret) => {
            if (ret.status) {
                console.log("success");
                if (ret.memo_id){
                    // when creating new memo, retuen will include memo_id
                    // redirect to this new url
                    window.location.href = getMemoURL(ret.memo_id);
                }
            }
            else {
                alert("Failed to save.");
            }
        },
        (failed) => {
            alert(`Failed to save. Error: ${failed}`);
        }
    )
   
}

function deleteMemo(memo: MemoT){
    const memoId = memo.memo_id;
    if (memoId === null){
        alert("Can't delete local memo.");
        return;
    }
    
    if (!window.confirm(` 
                        Delete this memo? 
                        NO WAY TO GET IT BACK `)){
        return;
    }

    conn.deleteMemo(memoId).then(
        (ret: MemoManipulateResponseT) => {
            if (ret.status) {
                window.location.href = `${conn.FRONTENDURL}/index.html`;
            }
        },
        (failed) => {
            alert(`Failed to save. Error: ${failed}`);
        }
    )
}

/* swith inputView mode between view and edit */
function onClickEditSaveBtn(){
    if (inputView.readOnly){
        // View mode
        switchModeEdit();
    }
    else{
        // On edit mode
        saveMemo(thisMemo);
        switchModeView();
    }
}
function switchModeView(){
    editSaveBtn.value = "Edit";
    editSaveBtn.style.backgroundColor = "";
    editSaveBtn.style.color = "";

    timeAddedInput.readOnly = true;
    timeAddedInput.style.color = "#999"

    inputView.readOnly = true;
    inputView.style.backgroundColor = "#eee";
}
function switchModeEdit(){
    editSaveBtn.value = "Save";
    editSaveBtn.style.backgroundColor = "#39d";
    editSaveBtn.style.color = "white";

    timeAddedInput.readOnly = false;
    timeAddedInput.style.color = ""

    inputView.readOnly = false;
    inputView.style.backgroundColor = "";
}

/* grow textarea */
function autoGrow(elem: HTMLTextAreaElement){
    elem.style.height = "auto";
    elem.style.height = (elem.scrollHeight) + "px";
}

// main
const memoId = new URL(window.location.href).searchParams.get("memo_id");
if (memoId === "new"){
    loadNewMemo();
    switchModeEdit();
    inputView.focus();
}
else if (memoId === null){
    throw new Error("Can't get memo_id from url");
}

else{
    conn.fetchMemo(memoId).then(
        loadMemo, 
        (failed) => console.log(failed)
    );
}

// set textarea auto resize
inputView.addEventListener("input", () => {
    autoGrow(inputView);
});

inputView.addEventListener("dblclick", switchModeEdit);

editSaveBtn.addEventListener("click", onClickEditSaveBtn);

deleteBtn.addEventListener("click", ()=>{deleteMemo(thisMemo)});

homeBtn.addEventListener("click", ()=>{window.location.href = `${conn.FRONTENDURL}/index.html`})
