#!/usr/bin/env python3
"""
Add responsive search ads to existing ad groups.
"""

import os
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

CUSTOMER_ID = "5241959874"

def main():
    config_path = os.path.join(os.path.dirname(__file__), "google-ads.yaml")
    client = GoogleAdsClient.load_from_storage(config_path)

    # First, get the ad groups we created
    ga_service = client.get_service("GoogleAdsService")
    query = """
        SELECT
            ad_group.id,
            ad_group.name,
            ad_group.resource_name
        FROM ad_group
        WHERE ad_group.name LIKE 'PPI -%'
    """

    ad_group_resources = {}
    response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=query)
    for batch in response:
        for row in batch.results:
            name = row.ad_group.name.replace("PPI - ", "")
            ad_group_resources[name] = row.ad_group.resource_name
            print(f"Found ad group: {row.ad_group.name}")

    if not ad_group_resources:
        print("No ad groups found!")
        return

    # Create ads
    ad_service = client.get_service("AdGroupAdService")

    # Headlines (max 30 chars each)
    headlines = [
        "Custom Plastic Machining",
        "CNC Plastic Parts",
        "55+ Years Experience",
        "Precision to 0.001 in",
        "Get a Quote in 24hrs",
        "PEEK, Delrin, UHMW",
        "Made in USA",
        "ISO Quality Standards",
        "1000+ Materials",
        "Fast Turnaround",
        "Free Quote Today",
        "Expert Engineers",
    ]

    # Descriptions (max 90 chars each)
    descriptions = [
        "Precision CNC machining for PEEK, Delrin, Ultem & 1000+ plastics. Get your quote today!",
        "Custom plastic parts for aerospace, medical & semiconductor. Tight tolerances available.",
        "55+ years manufacturing excellence. ISO quality. Fast quotes. Made in USA.",
        "From prototype to production. Expert material selection. Request your free quote now.",
    ]

    operations = []
    for group_name, ad_group_resource in ad_group_resources.items():
        operation = client.get_type("AdGroupAdOperation")
        ad_group_ad = operation.create
        ad_group_ad.ad_group = ad_group_resource
        ad_group_ad.status = client.enums.AdGroupAdStatusEnum.ENABLED

        ad = ad_group_ad.ad
        ad.final_urls.append("https://www.proplastics.us/quote")

        # Add headlines
        for headline in headlines:
            headline_asset = client.get_type("AdTextAsset")
            headline_asset.text = headline
            ad.responsive_search_ad.headlines.append(headline_asset)

        # Add descriptions
        for description in descriptions:
            desc_asset = client.get_type("AdTextAsset")
            desc_asset.text = description
            ad.responsive_search_ad.descriptions.append(desc_asset)

        # Set path fields
        ad.responsive_search_ad.path1 = "quote"
        ad.responsive_search_ad.path2 = "plastics"

        operations.append(operation)

    response = ad_service.mutate_ad_group_ads(
        customer_id=CUSTOMER_ID,
        operations=operations
    )

    print(f"\n✅ Created {len(response.results)} ads successfully!")
    for result in response.results:
        print(f"  - {result.resource_name}")


if __name__ == "__main__":
    try:
        main()
    except GoogleAdsException as ex:
        print(f"\n❌ Google Ads API Error:")
        for error in ex.failure.errors:
            print(f"  - {error.message}")
            if error.details:
                print(f"    Details: {error.details}")
        raise
