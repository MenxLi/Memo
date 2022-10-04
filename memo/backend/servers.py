
import json
import tornado.web
import http.cookies
from typing import Callable, Optional
from .auth import checkUsr

class BaseHandler(tornado.web.RequestHandler):
    #  get_argument: Callable
    get_cookie: Callable[[str, Optional[str]], Optional[str]]
    set_header: Callable
    cookies: http.cookies.SimpleCookie
    ...

class AuthHandler(BaseHandler):
    def post(self):
        #  usr_id = self.get_argument("usrId", default="Unknown")
        #  usr_enc_passwd = self.get_argument("usrEncPasswd", default="0")

        body = self.request.body.decode("utf-8")
        body = json.loads(body)

        usr_id = body["usrId"]
        usr_enc_passwd = body["usrEncPasswd"]

        print(f"Checking usr: {usr_id}")

        self.write(checkUsr(usr_id, usr_enc_passwd))
