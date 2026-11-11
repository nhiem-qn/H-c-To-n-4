"""Build a complete portable ZIP from tracked Git source and official Python."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('python_zip', type=Path)
parser.add_argument('output_directory', type=Path)
args = parser.parse_args()
args.output_directory.mkdir(parents=True, exist_ok=True)
python_hash = hashlib.sha256(args.python_zip.read_bytes()).hexdigest()
EXPECTED_PYTHON_SHA256 = '3c01d7cfc666f746a6f064f60fb2156ab0ec464d3d738ab796371a46a9bb24a2'
if python_hash != EXPECTED_PYTHON_SHA256:
    raise SystemExit('Official Python ZIP checksum does not match this build.')
commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
prefix = 'Hoc-Toan-Cung-MIA/'
out = args.output_directory / 'MIA-Windows-Portable.zip'
with tempfile.TemporaryDirectory() as temp:
    source_path = Path(temp) / 'source.zip'
    subprocess.run(['git', 'archive', '--format=zip', 'HEAD', '-o', str(source_path)], check=True)
    with zipfile.ZipFile(source_path) as source, zipfile.ZipFile(args.python_zip) as runtime, zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as result:
        for archive, folder in [(source, prefix), (runtime, prefix + 'runtime/')]:
            for f in archive.infolist():
                if not f.is_dir():
                    result.writestr(folder + f.filename, archive.read(f))
        result.writestr(prefix + 'GOI-WINDOWS.json', json.dumps({'source': 'https://github.com/nhiem-qn/H-c-To-n-4', 'commit': commit, 'pythonSource': 'https://www.python.org/ftp/python/3.14.9/python-3.14.9-embed-amd64.zip', 'pythonZipSHA256': python_hash, 'platform': 'Windows 10/11 x64', 'start': 'CHAY-MIA.cmd', 'note': 'No passwords, API tokens or student database included.'}, indent=2))
with zipfile.ZipFile(out) as check:
    assert check.testzip() is None
    for f in ['index.html', 'CHAY-MIA.cmd', 'TAO-LOI-TAT.cmd', 'runtime/python.exe', 'runtime/LICENSE.txt', 'runtime/python314.zip', 'rewards.js', 'online-server/worker/index.js']:
        assert prefix + f in check.namelist(), f
    assert not any('/.git/' in f or '/.env' in f for f in check.namelist())
checksum = hashlib.sha256(out.read_bytes()).hexdigest()
(args.output_directory / 'SHA256.txt').write_text(checksum + '  ' + out.name + '\n')
print('Verified Windows ZIP:', out.stat().st_size, 'bytes; commit', commit)
