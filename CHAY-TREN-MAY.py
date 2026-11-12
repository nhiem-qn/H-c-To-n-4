"""MIA loopback launcher. Standard library only; cloud accounts stay on Cloudflare."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError, URLError
import json
import re
import sys
import webbrowser

ROOT = Path(__file__).resolve().parent
CLOUD_API = 'https://mia-online.mia-nhiem-qn-13c091.workers.dev'
CLOUD_ORIGIN = 'https://nhiem-qn.github.io'

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

class MIAHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def local_request(self):
        port = self.server.server_port
        allowed = {f'127.0.0.1:{port}', f'localhost:{port}'}
        if self.headers.get('Host') not in allowed:
            self.send_error(403, 'Open MIA using its localhost address.')
            return False
        origin = self.headers.get('Origin')
        if origin and origin not in {'http://' + host for host in allowed}:
            self.send_error(403, 'Only the local application may use this server.')
            return False
        return True

    def send_bytes(self, status, data, mime):
        self.send_response(status)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(data)

    def proxy_api(self):
        # Fixed upstream, same-origin local requests only. The cloud still checks
        # every student/admin token; no credentials are embedded in this package.
        if self.command not in ('GET', 'HEAD') and not self.headers.get('Origin'):
            self.send_error(403, 'Open the local application first.')
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
        except ValueError:
            self.send_error(400)
            return
        if not 0 <= length <= 2_000_000:
            self.send_error(413)
            return
        headers = {'Origin': CLOUD_ORIGIN, 'Content-Type': 'application/json', 'User-Agent': 'MIA-Local/1.0'}
        if self.headers.get('Authorization'):
            headers['Authorization'] = self.headers['Authorization']
        body = self.rfile.read(length) if length else None
        req = Request(CLOUD_API + self.path, data=body, headers=headers, method=self.command)
        try:
            with build_opener(NoRedirect()).open(req, timeout=20) as response:
                self.send_bytes(response.status, response.read(), response.headers.get('Content-Type', 'application/json'))
        except HTTPError as error:
            self.send_bytes(error.code, error.read(), error.headers.get('Content-Type', 'application/json'))
        except (URLError, TimeoutError, OSError):
            self.send_bytes(503, json.dumps({'error': 'Chưa kết nối được máy chủ online. Em vẫn có thể học và tự luyện trên máy.'}, ensure_ascii=False).encode(), 'application/json; charset=utf-8')

    def send_head(self):
        # Audio needs byte ranges so Chrome can resume at the next sentence.
        self._audio_remaining = None
        path = Path(self.translate_path(self.path))
        if path.suffix.lower() != '.mp3' or not path.is_file():
            return super().send_head()
        if not path.resolve().is_relative_to(ROOT):
            self.send_error(403)
            return None
        size = path.stat().st_size
        start, end, status = 0, size - 1, 200
        requested = self.headers.get('Range') if not self.headers.get('If-Range') else None
        if requested:
            match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested.strip())
            try:
                if not match or not any(match.groups()):
                    raise ValueError()
                left, right = match.groups()
                if left:
                    start = int(left)
                    end = min(int(right), size - 1) if right else size - 1
                else:
                    tail = int(right)
                    if tail <= 0:
                        raise ValueError()
                    start = max(0, size - tail)
                if start >= size or start > end:
                    raise ValueError()
            except ValueError:
                self.send_response(416)
                self.send_header('Content-Range', f'bytes */{size}')
                self.send_header('Content-Length', '0')
                self.end_headers()
                return None
            status = 206
        try:
            audio = path.open('rb')
        except OSError:
            self.send_error(404)
            return None
        audio.seek(start)
        self._audio_remaining = max(0, end - start + 1)
        self.send_response(status)
        self.send_header('Content-Type', 'audio/mpeg')
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Length', str(self._audio_remaining))
        self.send_header('X-Content-Type-Options', 'nosniff')
        if status == 206:
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.end_headers()
        return audio

    def copyfile(self, source, outputfile):
        remaining = getattr(self, '_audio_remaining', None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        while remaining:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)

    def do_GET(self):
        if not self.local_request():
            return
        if self.path.startswith('/api/'):
            return self.proxy_api()
        if self.path.split('?')[0] == '/config.js':
            url = f'http://127.0.0.1:{self.server.server_port}'
            config = {'apiUrl': url, 'appUrl': url + '/', 'mode': 'standalone', 'adminUsername': 'admin'}
            return self.send_bytes(200, ('window.MIA_SERVER_CONFIG = ' + json.dumps(config) + ';').encode(), 'text/javascript; charset=utf-8')
        return super().do_GET()

    def do_HEAD(self):
        if self.local_request():
            return super().do_HEAD()

    def do_POST(self):
        if not self.local_request():
            return
        if self.path.startswith('/api/'):
            return self.proxy_api()
        self.send_error(404)

    do_PUT = do_POST
    do_DELETE = do_POST

    def list_directory(self, path):
        self.send_error(403, 'Open index.html to start MIA.')
        return None

    def log_message(self, fmt, *args):
        pass  # Do not log account requests, tokens, or student details.

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), MIAHandler)
    except OSError:
        print(f'Cong {port} dang ban. Dong cua so MIA cu roi mo lai, hoac chay voi cong 8001.')
        raise SystemExit(1)
    url = f'http://127.0.0.1:{port}/'
    print(f'MIA dang chay tai: {url}')
    print('Giu cua so nay mo khi hoc. Nhan Ctrl+C hoac dong cua so de dung.')
    print('Hoc va tu luyen dung tren may. Dang nhap / thi online can Internet.')
    if '--no-browser' not in sys.argv:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
