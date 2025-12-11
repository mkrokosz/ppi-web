#!/usr/bin/env python3
"""
One-time script to get a refresh token for Google Ads API.
Run this once, then copy the refresh token to google-ads.yaml

Required environment variables:
  GOOGLE_ADS_CLIENT_ID - Your Google OAuth client ID
  GOOGLE_ADS_CLIENT_SECRET - Your Google OAuth client secret
"""

import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/adwords"]

CLIENT_ID = os.environ.get("GOOGLE_ADS_CLIENT_ID")
CLIENT_SECRET = os.environ.get("GOOGLE_ADS_CLIENT_SECRET")

if not CLIENT_ID or not CLIENT_SECRET:
    raise ValueError(
        "Missing required environment variables: "
        "GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET"
    )

CLIENT_CONFIG = {
    "installed": {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost"],
    }
}

def main():
    flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, scopes=SCOPES)

    # This will open a browser for you to authorize
    credentials = flow.run_local_server(port=8085)

    print("\n" + "=" * 60)
    print("SUCCESS! Copy this refresh token to your google-ads.yaml:")
    print("=" * 60)
    print(f"\nrefresh_token: {credentials.refresh_token}\n")
    print("=" * 60)

if __name__ == "__main__":
    main()
