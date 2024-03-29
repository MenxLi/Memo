
import json
import tornado.web
import http.cookies

from .protocolT import BriefInfoT, MemoManipulateT, MemoManipulateResponseT
from .auth import checkUsr
from .database import MemoDatabase

class BaseHandler(tornado.web.RequestHandler):
    cookies: http.cookies.SimpleCookie

    def validateUsr(self) -> bool:
        usr_enc_passwd = self.get_cookie("usrEncPasswd", default="0")
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

        status = checkUsr(usr_id, usr_enc_passwd)
        self.write(status)

        # print
        print(f"checking usr info: {usr_id} ({status})")
        if status == "unauthorized":
            print(f"wrong encpasswd: {usr_enc_passwd}")

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
                "short_content": "\n".join(content_main[:cutoff_idx])
            }
            brief_info.append(_b_info)

        ret = {
            "brief_info": brief_info
        }

        self.set_header("Content-Type", "application/json")

        self.write(ret)

class MemoHandler(BaseHandler):
    """
    Deal with singe memo manipulation
    """

    def get(self):
        if not self.validateUsr():
            raise tornado.web.HTTPError(401)

        memo_id = self.get_argument("memo_id", default="0")
        db = MemoDatabase()
        memo = db[memo_id]
        
        if memo is None:
            raise tornado.web.HTTPError(400)    # bad request

        self.set_header("Content-Type", "application/json")
        self.write(dict(memo))

    def post(self):
        if not self.validateUsr():
            raise tornado.web.HTTPError(401)

        self.set_header("Content-Type", "application/json")

        db = MemoDatabase()
        body = self.request.body.decode("utf-8")
        instruction: MemoManipulateT = json.loads(body)

        if instruction["action"] == "edit":
            if "memo" not in instruction:
                raise tornado.web.HTTPError(400)
            memo = instruction["memo"]
            memo_new = db.edit(
                self.usr_id, 
                content = memo["content"],
                memo_id = memo["memo_id"],          # set to None for create new
                time_added = memo["time_added"]
            )
            ret: MemoManipulateResponseT = {
                "status": memo_new is not None
            }
            if memo["memo_id"] is None and memo_new:
                # Created new memo
                ret["memo_id"] = memo_new["memo_id"]
            self.write(dict(ret))
            print(f"Got memo edit request: {memo['memo_id']}")

        elif instruction["action"] == "delete":
            if "memo_id" not in instruction:
                raise tornado.web.HTTPError(400)
            db.deleteMemo(instruction["memo_id"])
            ret: MemoManipulateResponseT = {
                "status": True
            }
            self.write(dict(ret))
            print(f"Got memo delete request: {instruction['memo_id']}")

        else:
            raise tornado.web.HTTPError(400)


