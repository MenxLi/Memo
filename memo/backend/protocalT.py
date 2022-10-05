
from .database import Memo
from typing import TypedDict, List, Literal

class BriefInfoT(TypedDict):
    uid: str
    title: str
    time_added: int
    short_content: str

class _MemoManipulateT(TypedDict):
    action: Literal["edit", "delete"]

class MemoManipulateT(_MemoManipulateT, total = False):
    memo: Memo
    memo_id: str

class MemoManipulateResponseT(TypedDict):
    status: bool
