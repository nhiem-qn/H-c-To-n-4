"""Phục vụ Vườn Toán 4 trên localhost; không cần cài thêm thư viện."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import sys
import webbrowser

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), handler)
    except OSError as exc:
        print(f'Chưa mở được cổng {port}: {exc}. Thử chạy với cổng khác, ví dụ 8001.')
        raise SystemExit(1)
    url = f'http://localhost:{port}'
    print(f'Mở {url} trong Chrome hoặc Edge. Nhấn Ctrl+C để dừng.')
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nĐã dừng ứng dụng.')
    finally:
        server.server_close()
