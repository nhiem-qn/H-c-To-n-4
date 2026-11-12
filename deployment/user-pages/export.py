"""Export public MIA frontend for the short GitHub user-site address."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import shutil
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
parser.add_argument('destination', type=Path)
parser.add_argument('--app-url', default='https://nhiem-qn.github.io/')
args = parser.parse_args()
source = args.source.resolve()
destination = args.destination.resolve()
if source == destination or source in destination.parents:
    raise SystemExit('Choose a separate export folder.')
if not args.app_url.startswith('https://') or not args.app_url.endswith('/'):
    raise SystemExit('The public app URL must use HTTPS and end with /.')
destination.mkdir(parents=True, exist_ok=True)
for item in source.iterdir():
    if item.name in {'assets', 'docs'} and item.is_dir():
        if item.is_symlink() or any(p.is_symlink() for p in item.rglob('*')):
            raise SystemExit('Do not publish symbolic links.')
        shutil.copytree(item, destination / item.name, dirs_exist_ok=True)
    elif item.is_file() and item.suffix.lower() in {'.html', '.js', '.css', '.json', '.md', '.svg', '.png', '.ico', '.webmanifest'}:
        if item.is_symlink():
            raise SystemExit('Do not publish symbolic links.')
        shutil.copy2(item, destination / item.name)
config = destination / 'config.js'
text, count = re.subn(r'("appUrl"\s*:\s*")[^"]*(")', lambda m: m[1] + args.app_url + m[2], config.read_text(encoding='utf-8'))
if count != 1:
    raise SystemExit('The frontend public URL was not found exactly once.')
config.write_text(text, encoding='utf-8')
(destination / '.nojekyll').touch()
commit = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
(destination / 'deployment-info.json').write_text(json.dumps({
    'application': 'Học Toán cùng MIA',
    'sourceRepository': 'nhiem-qn/H-c-To-n-4',
    'sourceCommit': commit,
    'appUrl': args.app_url,
    'publishedAt': datetime.now(timezone.utc).isoformat(),
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Exported MIA frontend:', commit, '→', args.app_url)
