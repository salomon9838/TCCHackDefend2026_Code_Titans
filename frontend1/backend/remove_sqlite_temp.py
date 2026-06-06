import os
files = [r'c:\Hackathon\frontend1\backend\db.sqlite3', r'c:\Hackathon\frontend1\backend\db.sqlite3-journal']
for f in files:
    try:
        if os.path.exists(f):
            os.remove(f)
            print('removed', f)
        else:
            print('missing', f)
    except Exception as e:
        print('failed', f, type(e).__name__, e)
