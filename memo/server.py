import asyncio, os, argparse, logging
import tornado.web
import tornado.autoreload
from tornado.routing import _RuleList
from tornado.httpserver import HTTPServer, HTTPServer
from .backend.handlers import AuthHandler, IndexHandler, MemoHandler

__this_dir = os.path.dirname(__file__)
frontend_root = os.path.join(__this_dir, "frontend")

logger = logging.getLogger("memo")

def autoreloadHook():
    logger.info("Restart server.")

def make_app(ssl_options=None):
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
        ssl_options=ssl_options
    )

async def main(port: int, ssl_options=None):
    app = make_app(ssl_options)
    logger.info(f"Starting server at port: {port}")
    if ssl_options:
        logger.info(f"Start with ssl options: {ssl_options}")
        server = HTTPServer(app, ssl_options=ssl_options)
    else:
        server = HTTPServer(app)

    server.listen(port)
    tornado.autoreload.add_reload_hook(autoreloadHook)
    tornado.autoreload.start()
    await asyncio.Event().wait()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Memo server")
    parser.add_argument("-p", "--port", type=int, default=8888)
    parser.add_argument("--ssl-keyfile", type=str, default="")
    parser.add_argument("--ssl-certfile", type=str, default="")
    args = parser.parse_args()

    ssl_options = None

    if bool(args.ssl_keyfile) != bool(args.ssl_certfile):
        logger.error("ssl-keyfile and ssl-certfile must be both specified or both unspecified")
        exit(1)
    
    if args.ssl_keyfile and args.ssl_certfile:
        ssl_options = {"certfile": args.ssl_certfile,
                       "keyfile": args.ssl_keyfile}

    asyncio.run(main(args.port, ssl_options))
