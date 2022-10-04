

function setCookie(key: string, value: any, expDays: number): void{
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/; sameSite=Lax`
}


function getCookie(key: string): string {
    const cookie_decode = decodeURIComponent(document.cookie);
    const split_cookie = cookie_decode.split("; ");
    let ret = "";
    split_cookie.forEach((val) => {
        if (val.indexOf(key) === 0){
            ret = val.substring(`${key}=`.length);
        }
    })
    return ret;
}

export {setCookie, getCookie};
