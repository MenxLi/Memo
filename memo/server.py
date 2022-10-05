import asyncio, os
import tornado.web
import tornado.autoreload
from tornado.routing import _RuleList
from .backend.servers import AuthHandler, IndexHandler, MemoHandler

__this_dir = os.path.dirname(__file__)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")

def autoreloadHook():
    print("Restart server.")

def make_app():

    rules: _RuleList = [
        (r"^/frontend/(.*?)$", tornado.web.StaticFileHandler, {"path": os.path.join(__this_dir, "frontend")}),
        (r"^/auth", AuthHandler),
        (r"^/index", IndexHandler),
        (r"^/memo", MemoHandler),
    ]

    return tornado.web.Application(
        rules,
        settings={
            "autoreload": True
        }
    )

async def main():
    app = make_app()
    app.listen(8888)
    tornado.autoreload.add_reload_hook(autoreloadHook)
    tornado.autoreload.start()
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())