import os, logging, sys

if "MEMO_HOME" in os.environ:
    MEMO_HOME = os.environ["MEMO_HOME"]
else:
    MEMO_HOME = os.path.join(os.path.expanduser("~"), ".memo")
if not os.path.exists(MEMO_HOME):
    print("Created MEMO_HOME at: ", MEMO_HOME)
    os.mkdir(MEMO_HOME)
DB_PATH = os.path.join(MEMO_HOME, "memo.db")

def setLogger():
    log_file = os.path.join(MEMO_HOME, "logging.log")
    print("Setting up logger (file: {})".format(log_file))

    logger = logging.getLogger("memo")
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter('%(asctime)s - %(name)s::%(levelname)s - %(message)s')

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    file_handler = logging.FileHandler(filename = log_file)
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

setLogger()