
import {ServerConn, MemoT} from './serverConn.js'
import {stamp2Input} from './libs/timeUtils.js'


const timeAddedInput: HTMLInputElement = document.querySelector("#timeAddedInput")!;
const editSaveBtn: HTMLInputElement = document.querySelector("#editSaveBtn")!;
const inputView: HTMLTextAreaElement = document.querySelector("#inputView")!;

function loadMemo(memo: MemoT){

    stamp2Input(memo.time_added, timeAddedInput, true);
    inputView.value = memo.content;
    autoGrow(inputView);
    switchModeView();
}

/* swith inputView mode between view and edit */
function onClickEditSaveBtn(){
    if (inputView.readOnly){
        // Edit mode
        switchModeEdit();
    }
    else{
        // View mode
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

const conn = new ServerConn();
const memoId = new URL(window.location.href).searchParams.get("memo_id");
if (memoId === "new"){
    // create a new memo
    console.log("Todo")
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

