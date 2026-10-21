import os
import sys
import subprocess
import requests

def get_github_token():
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        return token
    # Query Git Credential Manager
    try:
        proc = subprocess.run(
            ["git", "credential", "fill"],
            input="protocol=https\nhost=github.com\n",
            capture_output=True,
            text=True,
            check=True
        )
        for line in proc.stdout.splitlines():
            if line.startswith("password="):
                return line.split("=", 1)[1].strip()
    except Exception as e:
        print(f"Could not read from git credential helper: {e}", file=sys.stderr)
    return None

def main():
    token = get_github_token()
    if not token:
        print("Error: GitHub token not found.", file=sys.stderr)
        sys.exit(1)

    repo_owner = "samuveljohnson1416"
    repo_name = "Kasu"
    tag_name = "v1.0.0"
    release_name = "Kasu v1.0.0 - Mobile Android Release"
    apk_path = os.path.abspath("Kasu-v1.0.apk")

    if not os.path.exists(apk_path):
        print(f"Error: APK file not found at {apk_path}", file=sys.stderr)
        sys.exit(1)

    apk_size = os.path.getsize(apk_path)
    print(f"Target APK: {apk_path} ({apk_size:,} bytes)")

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Kasu-Release-Bot"
    }

    body_content = """# Kasu v1.0.0 - Mobile Release 💰📱

**Kasu** is a clean, student-friendly personal finance and expense tracking Android application built with modern Jetpack Compose.

## 🚀 Key Features
- **Budget Dashboard**: Track monthly allowances, spending velocity, and remaining balance at a glance.
- **Fast Ledger Logging**: Record expenses and income in seconds with custom categories and notes.
- **Detailed Analytics & Reports**: Visual category breakdowns and monthly trend analysis.
- **Offline-First & Private**: Data stays securely stored on your device with local ledger storage.
- **Data Export**: Export your transaction ledger anytime to CSV or JSON backup.

---

## 📲 How to Install the APK on Your Mobile Phone

1. Download **`Kasu-v1.0.apk`** from the Assets section below directly onto your Android device (or transfer it from your PC via USB / WhatsApp / Google Drive).
2. Open the downloaded file from your Downloads folder or notification bar.
3. If prompted by Android, enable **"Allow from this source"** or **"Install unknown apps"** in your device Settings.
4. Tap **Install** and launch **Kasu**!

---

### 🛡️ Checksums & Verification
- **File Name:** `Kasu-v1.0.apk`
- **Application ID:** `app.kasu`
- **Min Android SDK:** Android 8.0 (API 26)
- **Target Android SDK:** Android 15 (API 35)
- **Signature Scheme:** APK Signature Scheme v2 (Signed Release)
- **SHA-256 Checksum:** `ad3ab5cc874a2d242710dea6563f3fb119ed7cc81bde5d4bd2ff7068a88e69e2`
"""

    api_base = f"https://api.github.com/repos/{repo_owner}/{repo_name}"

    # Check existing release by tag
    print(f"Checking if release {tag_name} exists...")
    r = requests.get(f"{api_base}/releases/tags/{tag_name}", headers=headers, timeout=15)
    release = None
    if r.status_code == 200:
        release = r.json()
        print(f"Release already exists: ID {release['id']}")
    elif r.status_code == 404:
        print(f"Creating new release {tag_name}...")
        payload = {
            "tag_name": tag_name,
            "target_commitish": "main",
            "name": release_name,
            "body": body_content,
            "draft": False,
            "prerelease": False
        }
        create_res = requests.post(f"{api_base}/releases", headers=headers, json=payload, timeout=20)
        if create_res.status_code in (200, 201):
            release = create_res.json()
            print(f"Successfully created release: ID {release['id']}")
        else:
            print(f"Failed to create release: {create_res.status_code} {create_res.text}", file=sys.stderr)
            sys.exit(1)
    else:
        print(f"Unexpected response when checking release: {r.status_code} {r.text}", file=sys.stderr)
        sys.exit(1)

    release_id = release["id"]
    html_url = release.get("html_url")

    # Check existing assets to delete duplicates
    assets = release.get("assets", [])
    for asset in assets:
        if asset["name"] == "Kasu-v1.0.apk":
            print(f"Deleting existing asset ID {asset['id']}...")
            requests.delete(f"{api_base}/releases/assets/{asset['id']}", headers=headers, timeout=15)

    # Upload APK asset
    upload_url = release["upload_url"].split("{")[0]
    upload_endpoint = f"{upload_url}?name=Kasu-v1.0.apk"
    print(f"Uploading {apk_path} to {upload_endpoint}...")

    upload_headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/vnd.android.package-archive",
        "User-Agent": "Kasu-Release-Bot"
    }

    with open(apk_path, "rb") as f:
        apk_data = f.read()

    upload_res = requests.post(upload_endpoint, headers=upload_headers, data=apk_data, timeout=60)
    if upload_res.status_code in (200, 201):
        asset_info = upload_res.json()
        print("\n[SUCCESS] APK successfully uploaded to GitHub Release!")
        print(f"Asset Name: {asset_info.get('name')}")
        print(f"Download URL: {asset_info.get('browser_download_url')}")
        print(f"Release URL: {html_url}")
    else:
        print(f"Failed to upload asset: {upload_res.status_code} {upload_res.text}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
