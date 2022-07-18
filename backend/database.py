import sqlite3, logging, os
from ..data import db_path

class MemoDatabase():
    logger = logging.getLogger("memo")
    DB_PATH = db_path

    def __init__(self):
        if not os.path.exists(self.DB_PATH):
            self.logger.info("Created new memo database: {}".format(self.DB_PATH))
        self._db_con = sqlite3.connect(self.DB_PATH)
        self.__createTable()

    def __createTable(self):
        self._db_con.execute("""
                             CREATE TABLE IF NOT EXISTS memo (
                                 usr_id TEXT, 
                                 memo_id TEXT NOT NULL,
                                 time_added TEXT NOT NULL,
                                 time_edit TEXT,
                                 content TEXT
                             );
                             """)
