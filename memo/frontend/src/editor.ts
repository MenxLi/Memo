
import {ServerConn, MemoT} from './serverConn.js'
import {stamp2Input, input2Stamp} from './libs/timeUtils.js'
import {getCookie} from './libs/cookie.js';

const conn = new ServerConn();
const timeAddedInput: HTMLInputElement = document.querySelector("#timeAddedInput")!;
const editSaveBtn: HTMLInputElement = document.querySelector("#editSaveBtn")!;
const inputView: HTMLTextAreaElement = document.querySelector("#inputView")!;
let thisMemo: MemoT;

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
    // Should catch error here...
    const timeAddedStamp = input2Stamp(timeAddedInput, true);

    memo.content = inputView.value;
    memo.time_added = timeAddedStamp;

    conn.saveMemo(memo).then(
        (status: boolean) => {
            if (status) console.log("success");
            else {
                alert("Failed to save.");
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

    inputView.readOnly = true;
    inputView.style.backgroundColor = "#eee";
}
function switchModeEdit(){
    editSaveBtn.value = "Save";
    editSaveBtn.style.backgroundColor = "#39d";
    editSaveBtn.style.color = "white";

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

