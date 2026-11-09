from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
ACTIVE=Path('/workspace/checkride-test-tools/rc10-active-root.txt')
class Handler(SimpleHTTPRequestHandler):
  def translate_path(self, path):
    self.directory = ACTIVE.read_text().strip()
    if path.startswith('/checkride/'):
      path = path[len('/checkride'):]
    return super().translate_path(path)
  def end_headers(self):
    self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
    # Avoid stale SW updates when fixture mtimes invert across pointer flips
    if self.path.split('?',1)[0].endswith('sw.js'):
      self.send_header('Last-Modified', 'Thu, 01 Jan 1970 00:00:00 GMT')
    super().end_headers()
  def send_head(self):
    # Drop validators so SimpleHTTPRequestHandler cannot 304 sw.js
    if self.path.split('?',1)[0].endswith('sw.js'):
      if 'If-Modified-Since' in self.headers:
        del self.headers['If-Modified-Since']
      if 'If-None-Match' in self.headers:
        del self.headers['If-None-Match']
    return super().send_head()
ThreadingHTTPServer(('127.0.0.1', 8044), Handler).serve_forever()
