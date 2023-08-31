
# Memo

**A super simple diary app.**  

Use sqlite to save data, python-tornado backend and pure javascript (typescript) frontend.

## Deployment

Runtime prerequisites: Python, Typescript

#### Installation
```bash
# compile typescript
tsc
# install python packages
pip install -r requirements.txt
```

#### Register user
```bash
# example, more usage see: python -m memo.backend.auth -h
# change ... to your value
python -m memo.backend.auth -r '{ "usr_id": "...", "usr_name": "...", "passwd": "..."}'
```

#### Start server
```bash
# change <port> to your value
python -m memo.server -p <port>
```

visit `http://localhost:<port>` to use the app.

---

![screenshot-gif](http://limengxun.com/files/imgs/memo.gif)
