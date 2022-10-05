
import json
import tornado.web
import http.cookies
from typing import Callable, Optional

from .protocalT import BriefInfoT
from .auth import checkUsr
from .database import MemoDatabase

class BaseHandler(tornado.web.RequestHandler):
    cookies: http.cookies.SimpleCookie

    def validateUsr(self) -> bool:
        usr_enc_passwd = self.get_cookie("usrEncPasswd", default="0")
        print(f"Checking: {self.usr_id} - {usr_enc_passwd}")
        return checkUsr(self.usr_id, usr_enc_passwd) == "success"

    @property
    def usr_id(self) -> str:
        ret = self.get_cookie("usrId", default="Unknown")
        assert ret      # Type check
        return ret

class AuthHandler(BaseHandler):
    def post(self):

        body = self.request.body.decode("utf-8")
        body = json.loads(body)

        usr_id = body["usrId"]
        usr_enc_passwd = body["usrEncPasswd"]

        print(f"Checking usr: {usr_id}")

        self.write(checkUsr(usr_id, usr_enc_passwd))


class IndexHandler(BaseHandler):
    def get(self):
        if not self.validateUsr():
            raise tornado.web.HTTPError(401)

        db = MemoDatabase()
        info = db.briefInfo(self.usr_id)

        brief_info = []
        for inf in info:
            content = inf[2]
            content_split = content.strip().split("\n")
            if len(content_split) > 1:
                content_main = content_split[1:]
            else:
                content_main = ""
            cutoff_idx = min(len(content_main), 50)
            _b_info: BriefInfoT = {
                "uid": inf[0],
                "time_added": inf[1],
                "title": content_split[0],
                "short_content": content_main[:cutoff_idx]
            }
            brief_info.append(_b_info)

        ret = {
            "brief_info": brief_info
        }

        self.set_header("Content-Type", "application/json")

        self.write(ret)
