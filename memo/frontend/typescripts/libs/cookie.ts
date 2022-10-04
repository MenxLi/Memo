

function setCookie(key: string, value: any, expDays: number): void{
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/`
}


function getCookie(key: string): string {
    const cookie_decode = decodeURIComponent(document.cookie);
    const split_cookie = cookie_decode.split("; ");
    split_cookie.forEach((val) => {
        if (val.indexOf(key) === 0){
            return val.substring(`${key}=`.length);
        }
    })
    return "";
}

export {setCookie, getCookie};
