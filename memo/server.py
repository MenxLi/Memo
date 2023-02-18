import asyncio, os, argparse, logging
import tornado.web
import tornado.autoreload
from tornado.routing import _RuleList
from .backend.handlers import AuthHandler, IndexHandler, MemoHandler

__this_dir = os.path.dirname(__file__)
frontend_root = os.path.join(__this_dir, "frontend")

logger = logging.getLogger("memo")

def autoreloadHook():
    logger.info("Restart server.")

def make_app():

    rules: _RuleList = [
        (r'/(favicon.ico)', tornado.web.StaticFileHandler, {"path": frontend_root}),
        (r"^/backend/auth", AuthHandler),
        (r"^/backend/index", IndexHandler),
        (r"^/backend/memo", MemoHandler),
        (r"^/(.*?)$", tornado.web.StaticFileHandler, 
            {
                "path": os.path.join(__this_dir, "frontend"),
                "default_filename":"index.html"
            }),
    ]

    return tornado.web.Application(
        rules,
    )

async def main(port: int):
    app = make_app()
    logger.info(f"Starting server at port: {port}")
    app.listen(port)
    tornado.autoreload.add_reload_hook(autoreloadHook)
    tornado.autoreload.start()
    await asyncio.Event().wait()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Memo server")
    parser.add_argument("-p", "--port", type=int, default=8888)
    args = parser.parse_args()

    asyncio.run(main(args.port))
