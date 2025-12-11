#!/usr/bin/env python3
"""
Check recent conversion data.
"""

import os
from google.ads.googleads.client import GoogleAdsClient

CUSTOMER_ID = "5241959874"

def main():
    config_path = os.path.join(os.path.dirname(__file__), "google-ads.yaml")
    client = GoogleAdsClient.load_from_storage(config_path)
    ga_service = client.get_service("GoogleAdsService")

    print("\n" + "=" * 60)
    print("CONVERSION TRACKING STATUS")
    print("=" * 60)

    # Check conversion actions and their status
    print("\n### CONVERSION ACTIONS ###\n")
    query = """
        SELECT
            conversion_action.id,
            conversion_action.name,
            conversion_action.status,
            conversion_action.type,
            conversion_action.category,
            conversion_action.tag_snippets
        FROM conversion_action
        WHERE conversion_action.status = 'ENABLED'
    """

    response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=query)
    for batch in response:
        for row in batch.results:
            ca = row.conversion_action
            print(f"  ✓ {ca.name}")
            print(f"    ID: {ca.id}")
            print(f"    Type: {ca.type.name}")
            print(f"    Category: {ca.category.name}")
            print()

    # Check for recent conversions (today)
    print("\n### RECENT CONVERSIONS (Today) ###\n")
    conv_query = """
        SELECT
            segments.conversion_action_name,
            segments.date,
            metrics.conversions,
            metrics.all_conversions
        FROM campaign
        WHERE segments.date DURING TODAY
            AND metrics.conversions > 0
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=conv_query)
        found = False
        for batch in response:
            for row in batch.results:
                found = True
                print(f"  Conversion: {row.segments.conversion_action_name}")
                print(f"    Date: {row.segments.date}")
                print(f"    Count: {row.metrics.conversions}")
        if not found:
            print("  No conversions recorded yet today.")
            print("\n  NOTE: Conversions can take up to 24 hours to appear in reports.")
            print("  Check again tomorrow if you just submitted a test quote.")
    except Exception as e:
        print(f"  Query error: {e}")

    # Check conversion action stats
    print("\n### CONVERSION ACTION STATS (Last 7 Days) ###\n")
    stats_query = """
        SELECT
            conversion_action.name,
            metrics.all_conversions,
            metrics.all_conversions_value
        FROM conversion_action
        WHERE segments.date DURING LAST_7_DAYS
        ORDER BY metrics.all_conversions DESC
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=stats_query)
        found = False
        for batch in response:
            for row in batch.results:
                if row.metrics.all_conversions > 0:
                    found = True
                    print(f"  {row.conversion_action.name}: {row.metrics.all_conversions:.1f} conversions")
        if not found:
            print("  No conversions in the last 7 days.")
    except Exception as e:
        print(f"  Query error: {e}")

    print("\n" + "=" * 60)
    print("NOTES:")
    print("=" * 60)
    print("- GA4 conversions can take 24-48 hours to sync with Google Ads")
    print("- Direct lead form conversions should appear faster")
    print("- Check Google Analytics to verify the event fired")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
