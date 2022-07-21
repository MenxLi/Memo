from __future__ import annotations
import sqlite3, logging, os
from typing import TypedDict, List, Optional
from abc import abstractmethod
from uuid import uuid4

from .timeutils import TimeUtils
from ..data import db_path

class UsrInfo(TypedDict):
    usr_id: str
    usr_name: str
    usr_key: str    # hashed
    usr_time_register: float

class Memo(TypedDict):
    memo_id: str
    time_added: float
    time_edit: float
    usr_id: str
    content: str

class Database(object):
    logger = logging.getLogger("memo")
    DB_PATH = db_path

    def __init__(self):
        if not os.path.exists(self.DB_PATH):
            self.logger.info("Created new memo database: {}".format(self.DB_PATH))
        self._db_con = sqlite3.connect(self.DB_PATH)
        self._createTable()

    @property
    def db_con(self) -> sqlite3.Connection:
        return self._db_con

    @abstractmethod
    def _createTable(self):
        """
        Maybe create a new table.
        """
        ...

class MemoDatabase(Database):
    def _createTable(self):
        self._db_con.execute("""
                             CREATE TABLE IF NOT EXISTS memo (
                                 memo_id TEXT NOT NULL PRIMARY KEY,
                                 time_added FLOAT NOT NULL,
                                 time_edit FLOAT,
                                 usr_id TEXT, 
                                 content TEXT
                             );
                             """)

    def __getitem__(self, memo_id) -> Optional[Memo]: 
        selection = self.db_con.execute(
            """
            SELECT
                memo_id,
                time_added,
                time_edit,
                usr_id,
                content
            FROM memo WHERE memo_id=?
            """, (memo_id, )
        ).fetchall()
        if not selection:
            self.logger.warning(f"Invalid memo_id: {memo_id}")
            return None
        line_raw = selection[0]
        return Memo(
            memo_id = line_raw[0],
            time_added = line_raw[1],
            time_edit = line_raw[2],
            usr_id = line_raw[3],
            content = line_raw[4]
        )

    def edit(self, usr_id: str, content: str, memo_id = None, **kwargs) -> Optional[Memo]:
        """
        Add or edit a memo, set memo_id to None for adding
        - **kwargs: optional argumemts, time_added/time_edit/usr_id/(memo_id)
        """
        now_stamp = TimeUtils.nowStamp()
        if memo_id is None:
            # create new
            memo = {
                "memo_id": uuid4().hex,
                "time_added": now_stamp,
                "time_edit": now_stamp,
                "usr_id": usr_id,
                "content": content
            }
            for k, v in kwargs.items():
                memo[k] = v
            # add to db
            self.db_con.execute("""
                                INSERT INTO memo (
                                    memo_id,
                                    time_added,
                                    time_edit,
                                    usr_id,
                                    content
                                    )
                                VALUES (?, ?, ?, ?, ?)
                                """, 
                                (
                                    memo["memo_id"],
                                    memo["time_added"],
                                    memo["time_edit"],
                                    memo["usr_id"],
                                    memo["content"],
                                ))
        else:
            # check if exists
            memo: Optional[Memo] = self[memo_id]
            if memo is None:
                return None
            if memo["usr_id"] != usr_id:
                self.logger.warning(f"Ownership error: {usr_id} trying to edit ({memo['usr_id']})")
                return None
            memo["time_edit"] = now_stamp
            memo["content"] = content
            for k, v in kwargs.items():
                if k=="memo_id":
                    self.logger.warning("Not allowed to edit memo_id")
                    return None
                memo[k] = v
            # edit db
            self.db_con.execute("""
                                UPDATE memo
                                SET 
                                    time_added=?,
                                    time_edit=?,
                                    usr_id=?,
                                    content=?
                                WHERE memo_id=?
                                """, 
                                (
                                    memo["time_added"],
                                    memo["time_edit"], 
                                    memo["usr_id"], 
                                    memo["content"],
                                    memo["memo_id"], 
                                ))
        self.db_con.commit()
        return memo


class UsrDatabase(Database):
    def _createTable(self):
        self.db_con.execute("""
                             CREATE TABLE IF NOT EXISTS usrs (
                                 usr_id TEXT PRIMARY KEY, 
                                 usr_name TEXT,
                                 access_key TEXT NOT NULL,
                                 time_register FLOAT NOT NULL,
                             );
                             """)

    def __getitem__(self, usr_id: str) -> Optional[UsrInfo]:
        selection = self.db_con.execute(
                """
                SELECT 
                    usr_id,
                    usr_name,
                    access_key,
                    time_register,
                FROM usrs WHERE usr_id=?
                """, (usr_id, )
            ).fetchall()
        if not selection:    # []
            return None
        line_raw = selection[0]
        return UsrInfo(
            usr_id = line_raw[0],
            usr_name = line_raw[1],
            usr_key = line_raw[2],
            usr_time_register = line_raw[3],
        )

    def allUsrIDs(self) -> List[str]:
        selection = self.db_con.execute(
                """
                SELECT 
                    usr_id
                FROM usrs
                """).fetchall()
        return [i[0] for i in selection ]

    def changeNameAndPassword(self, usr_id: str, name: str, access_key: str):
        self.logger.info(f"Change name and passwd: {usr_id} - {name}")
        usr = self[usr_id]
        assert usr is not None
        self.db_con.execute(
            """
            UPDATE usrs 
            SET usr_name=?,
                access_key=?
            WHERE usr_id=?
            """,
            (
                name,
                access_key,
                usr_id
            )
        )
        self.db_con.commit()

    def register(self, usr_id, usr_name, access_key) -> bool:
        if not self[usr_id] is None:
            self.logger.warning("User already registered, aborting registration.")
            return False
        self.db_con.execute(
            """
            INSERT INTO usrs (
                usr_id, 
                usr_name,
                access_key,
                time_register,
                )
            VALUES (?, ?, ?, ?)
            """,
            (
                usr_id,
                usr_name,
                access_key,
                TimeUtils.nowStamp(),
            ))
        self.db_con.commit()
        return True

    def deregister(self, usr_id: str):
        if self[usr_id] is None:
            self.logger.warning("User not in database, aborting deletion.")
            return False
        self.db_con.execute(
            """
            DELETE FROM usrs WHERE usr_id=?
            """, (usr_id, ))
        self.db_con.commit()
        return True

