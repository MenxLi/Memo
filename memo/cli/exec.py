import sys, os, subprocess
import argparse
import getpass
import logging
from typing import Optional
from ..backend.database import UsrDatabase, MemoDatabase
from ..backend.auth import checkUsr, generateHexHash
from ..backend.timeutils import TimeUtils

logger = logging.getLogger("memo")
memo_db = MemoDatabase()
usr_db = UsrDatabase()

def setLogger(level):
    logger = logging.getLogger("memo")
    logger.setLevel(level)
    # create console handler and set level to debug
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    # create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    # add formatter to ch
    ch.setFormatter(formatter)
    # add ch to logger
    logger.addHandler(ch)
    return logger

def promptFileEdit(default = "") -> str:
    __this_dir = os.path.realpath(os.path.dirname(__file__))
    __this_dir = os.path.abspath(__this_dir)
    file = os.path.join(__this_dir, "t.txt")
    assert not os.path.exists(file)
    with open(file, "w") as fp:
        fp.write(default)
    subprocess.call(["vim", file])
    with open(file, "r") as fp:
        out = fp.read()
    os.remove(file)
    return out

def promptLogin() -> str:
    """
    Return valid usr_id
    Try 3 times
    """
    RETURN = ""
    for _ in range(3):
        usr_id = input("usr_id: ")
        usr_passwd = getpass.getpass(prompt = "password: ")

        key = generateHexHash(usr_passwd)
        if checkUsr(usr_id, key, usr_db = usr_db) == "success":
            RETURN = usr_id
            break
    return RETURN

def promptTime(default: Optional[float] = None) -> float:
    if default is None:
        now_time_str = TimeUtils.localNowStr()
    else:
        now_time_str = TimeUtils.toStr(TimeUtils.stamp2Local(default))

    while True: 
        input_str = input("Please enter time:\n (default: {}) ".format(now_time_str)) 
        sys.stdout.write("\r")  # delete this line
        if input_str == "":
            input_str = now_time_str
        try:
            stamp = TimeUtils.strLocalTimeToDatetime(input_str).timestamp()
            break
        except ValueError:
            logger.error("Invalid time: {}".format(input_str))
    print("Using time: ", input_str)
    return stamp

def promptMemoId(usr_id) -> str:
    """
    return memo_id
    """
    info = memo_db.briefInfo(usr_id)
    info.sort(key = lambda x: x[1])

    def getTitle(content: str):
        TOLERANCE = 40
        content.strip("\n")
        line1 =  content.split("\n")[0]
        if len(line1) > TOLERANCE:
            line1 = line1[:TOLERANCE]
        return line1.strip(" #")

    for i in range(len(info)):
        single = info[i]
        dt = TimeUtils.stamp2Local(single[1])
        print(f"{i+1}\t{ TimeUtils.toStr(dt) }\t{getTitle(single[2])}")

    while True:
        idx = input("Choose an index: ")
        idx = int(idx)
        if 0<idx<=len(info):
            return info[idx-1][0]

def promptAction(*actions: str) -> str:
    while True:
        print("-------Choose yor action--------")
        for i, a in enumerate(actions):
            print(f"{i+1}. {a}")
        print("input: ", end="")
        print("--------------------------------")
        a = input()
        if int(a) in range(1, len(actions) + 1):
            ans = actions[int(a)]
            return ans

if __name__ == '__main__':
    parser = argparse.ArgumentParser("Memo")
    parser.add_argument("-L", "--log_level", action="store", default="INFO")

    subparsers = parser.add_subparsers(dest = "command")

    cmd_show = subparsers.add_parser("show")
    cmd_add = subparsers.add_parser("add")
    cmd_edit = subparsers.add_parser("edit")

    args = parser.parse_args()

    setLogger(args.log_level)

    # if no input
    if args.command is None:
        parser.print_help()
        exit()

    # require login
    #  usr_id = promptLogin()
    usr_id = "monsoon"
    if not usr_id:
        exit()

    if args.command == "add":
        content = promptFileEdit()
        if content == "":
            print("abort.")
            exit()
        print("=======(START)========")
        print(content)
        print("========(END)=========")
        time_stamp = promptTime()
        memo_db.edit(usr_id, content, time_added = time_stamp)

    if args.command == "show":
        memo_id = promptMemoId(usr_id)
        memo = memo_db[memo_id]
        assert not memo is None
        print("=======(START)========")
        print(memo["content"])
        print("========(END)=========")

    if args.command == "edit":
        memo_id = promptMemoId(usr_id)
        memo = memo_db[memo_id]
        assert not memo is None
        content = promptFileEdit(memo["content"])
        if content == "":
            print("abort.")
            exit()
        print("=======(START)========")
        print(content)
        print("========(END)=========")
        time_stamp = promptTime(memo["time_added"])
        memo_db.edit(usr_id, content, memo_id=memo["memo_id"], time_added = time_stamp)

