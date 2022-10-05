
import {ServerConn, MemoT} from './serverConn.js'
import {stamp2Input} from './libs/timeUtils.js'


const timeAddedInput: HTMLInputElement = document.querySelector("#timeAddedInput")!;
const editSaveBtn: HTMLInputElement = document.querySelector("#editSaveBtn")!;
const inputView: HTMLTextAreaElement = document.querySelector("#inputView")!;

function loadMemo(memo: MemoT){

    stamp2Input(memo.time_added, timeAddedInput, true);
    inputView.value = memo.content;
    autoGrow(inputView);
    swithMode();

}

/* swith inputView mode between view and edit */
function swithMode(){
    if (!inputView.readOnly){
        // Read only mode
        editSaveBtn.value = "Edit";
        inputView.readOnly = true;
    }
    else{
        // View mode
        editSaveBtn.value = "Save";
        inputView.readOnly = false;
    }
}

/*
 * grow textarea
* */
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

editSaveBtn.addEventListener("click", swithMode);

