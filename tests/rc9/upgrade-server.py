from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
ACTIVE=Path('/workspace/checkride-test-tools/rc9-active-root.txt')
class Handler(SimpleHTTPRequestHandler):
 def translate_path(self,path):
  self.directory=ACTIVE.read_text().strip()
  if path.startswith('/checkride/'): path=path[len('/checkride'):]
  return super().translate_path(path)
 def end_headers(self):
  self.send_header('Cache-Control','no-cache')
  super().end_headers()
ThreadingHTTPServer(('127.0.0.1',8040),Handler).serve_forever()
