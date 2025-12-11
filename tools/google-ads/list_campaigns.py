#!/usr/bin/env python3
"""
List all campaigns in the target Google Ads account.
"""

import os
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

# Target account to query
CUSTOMER_ID = "5241959874"  # No dashes

def main():
    # Load config from yaml file in same directory
    config_path = os.path.join(os.path.dirname(__file__), "google-ads.yaml")
    client = GoogleAdsClient.load_from_storage(config_path)

    ga_service = client.get_service("GoogleAdsService")

    query = """
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign_budget.amount_micros
        FROM campaign
        ORDER BY campaign.name
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=query)

        print("\n" + "=" * 80)
        print(f"CAMPAIGNS FOR ACCOUNT {CUSTOMER_ID}")
        print("=" * 80 + "\n")

        campaigns = []
        for batch in response:
            for row in batch.results:
                campaign = row.campaign
                budget = row.campaign_budget
                budget_amount = budget.amount_micros / 1_000_000 if budget.amount_micros else 0

                campaigns.append({
                    "id": campaign.id,
                    "name": campaign.name,
                    "status": campaign.status.name,
                    "type": campaign.advertising_channel_type.name,
                    "budget": budget_amount,
                })

        if not campaigns:
            print("No campaigns found.")
        else:
            for c in campaigns:
                print(f"ID: {c['id']}")
                print(f"  Name: {c['name']}")
                print(f"  Status: {c['status']}")
                print(f"  Type: {c['type']}")
                print(f"  Daily Budget: ${c['budget']:.2f}")
                print()

        print(f"Total campaigns: {len(campaigns)}")

    except GoogleAdsException as ex:
        print(f"Request failed with status {ex.error.code().name}")
        for error in ex.failure.errors:
            print(f"  Error: {error.message}")
        raise

if __name__ == "__main__":
    main()
