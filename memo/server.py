import asyncio, os
import tornado.web
from tornado.routing import _RuleList
from .backend.servers import AuthHandler

__this_dir = os.path.dirname(__file__)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")

def make_app():

    rules: _RuleList = [
        (r"^/frontend/(.*?)$", tornado.web.StaticFileHandler, {"path": os.path.join(__this_dir, "frontend")}),
        (r"^/auth", AuthHandler),
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
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())
