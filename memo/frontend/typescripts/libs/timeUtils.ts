
export function utcStamp2LocaleStr(stamp: number, isSecond = false): string{
    if (isSecond) stamp *= 1000;
    const d = new Date(stamp);

    let ret = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()} `
    ret += d.toLocaleTimeString();
    return ret;
}
