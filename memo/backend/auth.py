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

def changeUsrNamePasswd(usr_id, new_usr_name: Optional[str] = None, new_passwd: Optional[str] = None):
    db = UsrDatabase()
    usr = db[usr_id]
    if usr is None:
        print("User not exists")
        return False
    if new_usr_name is None:
        new_usr_name = usr["usr_name"]
    if new_passwd is None:
        new_key = usr["usr_key"]
    else:
        new_key = generateHexHash(new_passwd.strip())
    return db.changeNameAndPassword(usr_id=usr_id, name = new_usr_name, access_key=new_key)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-r", "--register", default=None,
                        help = "format: '{ \"usr_id\": ..., \"usr_name\": ..., \"passwd\": ...}'")
    parser.add_argument("-R", "--register_batch", action="store_true", 
                        help = "read from stdin, with each line being: <usr_id>, <usr_name>, <passwd> ")
    parser.add_argument("-d", "--delete", help="delete user by user ID", default=None)

    parser.add_argument("-l", "--list", help="list all users", action="store_true")

    # parser.add_argument("--change_user_id", action='store_true', help = "change user ID")
    parser.add_argument("--change_user_name", action='store_true', help = "change user name")
    parser.add_argument("--change_user_password", action='store_true', help = "change user password")

    args = parser.parse_args()

    if args.register:
        kwargs = json.loads(args.register)
        addUser(**kwargs)
        exit()

    if args.register_batch:
        batchRegister(sys.stdin.read())
        exit()

    if args.delete:
        usr_id = args.delete
        if input("delete user ID: {}? (y/[n])".format(usr_id)) == "y":
            delUser(usr_id)
        exit()
    
    if args.list:
        db = UsrDatabase()
        print("ID/Name")
        for usr_id in db.allUsrIDs():
            usr = db[usr_id]
            print(usr["usr_id"], "\t", usr["usr_name"],)
        exit()
    
    if args.change_user_name:
        usr_id = input("Input user ID: ")
        usr_name = input("Input new user name: ")
        if changeUsrNamePasswd(usr_id = usr_id, new_usr_name=usr_name):
            print("Success.")
        exit()

    if args.change_user_password:
        usr_id = input("Input user ID: ")
        usr_pwd = input("Input new user password: ")
        if changeUsrNamePasswd(usr_id = usr_id, new_passwd=usr_pwd):
            print("Success.")
        exit()

if __name__ == "__main__":
    main()
