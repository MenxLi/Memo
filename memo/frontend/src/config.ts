
// export const DOMAINURL: string = 'http://localhost';
// export const PORT: string = '8888'

const PROTOCOL = window.location.protocol;
export const DOMAINURL = PROTOCOL + "//" + window.location.hostname;
export const PORT = window.location.port;
