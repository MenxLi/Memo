import asyncio, os
import tornado.web
import tornado.autoreload
from tornado.routing import _RuleList
from .backend.handlers import AuthHandler, IndexHandler, MemoHandler

__this_dir = os.path.dirname(__file__)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")

def autoreloadHook():
    print("Restart server.")

def make_app():

    rules: _RuleList = [
        (r"^/backend/auth", AuthHandler),
        (r"^/backend/index", IndexHandler),
        (r"^/backend/memo", MemoHandler),
        (r"^/(.*?)$", tornado.web.StaticFileHandler, {"path": os.path.join(__this_dir, "frontend")}),
    ]

    return tornado.web.Application(
        rules,
        settings={
            "autoreload": True
        }
    )

async def main():
    app = make_app()
    app.listen(16708)
    tornado.autoreload.add_reload_hook(autoreloadHook)
    tornado.autoreload.start()
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())
