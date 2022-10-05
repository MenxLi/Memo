
export function utcStamp2LocaleStr(stamp: number, isSecond = false): string{
    if (isSecond) stamp *= 1000;
    const d = new Date(stamp);

    let year = d.getFullYear().toString();
    if (year.length !== 4){
        year = "0".repeat(4-year.length) + year;
    }
    let month = (d.getMonth() + 1).toString();
    if (month.length === 1){
        month = "0" + month;
    }
    let date = (d.getDate()).toString();
    if (date.length === 1){
        date = "0" + date;
    }

    let ret = `${year}-${month}-${date} `
    ret += d.toLocaleTimeString();
    return ret;
}


/*
 * set a time stamp to a datetime-local input field
* */
export function stamp2Input(stamp: number, inputElem: HTMLInputElement, isSecond = false): void {
    inputElem.value = utcStamp2LocaleStr(stamp, isSecond).replace(" ", "T");
}
