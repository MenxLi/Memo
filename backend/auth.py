import argparse, json, hashlib, sys
from typing import Literal, Optional
from .database import UsrDatabase

def generateHexHash(s: str) -> str:
    enc = s.encode("ascii")
    return hashlib.sha256(enc).hexdigest()

def addUser(usr_id, usr_name, passwd):
    db = UsrDatabase()
    return db.register(usr_id, usr_name, generateHexHash(passwd))

def delUser(usr_id):
    db = UsrDatabase()
    return db.deregister(usr_id)

def checkUsr(usr_id, access_key, usr_db: Optional[UsrDatabase] = None) -> Literal["unauthorized", "success", "nouser"]:
    if not usr_db:
        usr_db = UsrDatabase()
    usr = usr_db[usr_id]
    if usr is None:
        return "nouser"
    if usr["usr_key"] != access_key:
        return "unauthorized"
    return "success"

def batchRegister(d: str):
    """
    Read from a string to generate usrs
    - d: string with each line being:
        <usr_id>, <usr_name>, <passwd>
    """
    db = UsrDatabase()
    lines = d.split("\n")
    for line in lines:
        if not line:
            continue
        usr_id, usr_name, passwd = line.split(",")
        db.register(
            usr_id.strip(),
            usr_name.strip(), 
            generateHexHash(passwd.strip())
        )

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-r", "--register", default=None)
    parser.add_argument("-R", "--register_batch", action="store_true", 
                        help = "read from stdin, with each line being: <usr_id>, <usr_name>, <passwd> ")
    parser.add_argument("-d", "--delete", default=None)
    args = parser.parse_args()

    if args.register:
        kwargs = json.loads(args.register)
        addUser(**kwargs)

    if args.register_batch:
        batchRegister(sys.stdin.read())

    if args.delete:
        usr_id = args.delete
        delUser(usr_id)

if __name__ == "__main__":
    main()
