"""Check local origin isolation and the fixed, authenticated cloud bridge."""
import importlib.util
import http.client
import json
from pathlib import Path
import threading
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('mia_local', Path(__file__).resolve().parents[1] / 'CHAY-TREN-MAY.py')
mia = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mia)

class LocalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = mia.ThreadingHTTPServer(('127.0.0.1', 0), mia.MIAHandler)
        cls.port = cls.server.server_port
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def request(self, path, method='GET', body=None, headers=None):
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=3)
        conn.request(method, path, body, headers or {})
        response = conn.getresponse()
        status, data = response.status, response.read()
        conn.close()
        return status, data

    def test_local_assets_and_virtual_config(self):
        status, data = self.request('/config.js')
        self.assertEqual(status, 200)
        config = json.loads(data.decode().split(' = ', 1)[1].rstrip(';'))
        self.assertEqual(config['apiUrl'], f'http://127.0.0.1:{self.port}')
        self.assertEqual(self.request('/index.html')[0], 200)
        self.assertEqual(self.request('/assets/vendor/three.module.min.js')[0], 200)

    def test_host_and_foreign_origin_rejected(self):
        self.assertEqual(self.request('/', headers={'Host': 'attacker.example'})[0], 403)
        self.assertEqual(self.request('/api/health', headers={'Origin': 'https://attacker.example'})[0], 403)
        self.assertEqual(self.request('/api/presence', 'POST', '{}')[0], 403)
        self.assertEqual(self.request('/assets/')[0], 403)

    def test_fixed_upstream_and_token_preserved(self):
        class Response:
            status = 200
            headers = {'Content-Type': 'application/json'}
            def read(self): return b'{"ok":true}'
            def __enter__(self): return self
            def __exit__(self, *args): pass
        with patch.object(mia, 'build_opener') as opener:
            opener.return_value.open.return_value = Response()
            status, _ = self.request('/api/presence', 'POST', '{}', {'Origin': f'http://127.0.0.1:{self.port}', 'Authorization': 'Bearer test-fixture'})
            self.assertEqual(status, 200)
            req = opener.return_value.open.call_args.args[0]
            self.assertEqual(req.full_url, mia.CLOUD_API + '/api/presence')
            self.assertEqual(req.get_header('Origin'), mia.CLOUD_ORIGIN)
            self.assertEqual(req.get_header('Authorization'), 'Bearer test-fixture')
            self.assertEqual(req.data, b'{}')

if __name__ == '__main__':
    unittest.main()
