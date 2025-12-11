#!/usr/bin/env python3
"""
Create a new Search campaign for Pro Plastics Inc.
- US-only targeting
- Manual CPC bidding
- Focused on lead generation
"""

import os
import uuid
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

CUSTOMER_ID = "5241959874"

def main():
    config_path = os.path.join(os.path.dirname(__file__), "google-ads.yaml")
    client = GoogleAdsClient.load_from_storage(config_path)

    # Step 1: Create Campaign Budget
    print("Creating campaign budget...")
    budget_resource = create_campaign_budget(client)

    # Step 2: Create Search Campaign
    print("Creating search campaign...")
    campaign_resource = create_campaign(client, budget_resource)

    # Step 3: Set US-only targeting
    print("Setting US-only geo targeting...")
    set_geo_targeting(client, campaign_resource)

    # Step 4: Create Ad Groups
    print("Creating ad groups...")
    ad_group_resources = create_ad_groups(client, campaign_resource)

    # Step 5: Add Keywords
    print("Adding keywords...")
    add_keywords(client, ad_group_resources)

    # Step 6: Create Ads
    print("Creating responsive search ads...")
    create_ads(client, ad_group_resources)

    print("\n" + "=" * 60)
    print("✅ SEARCH CAMPAIGN CREATED SUCCESSFULLY!")
    print("=" * 60)
    print(f"\nCampaign: {campaign_resource}")
    print("\nAd Groups created:")
    for name, resource in ad_group_resources.items():
        print(f"  - {name}")
    print("\nNext steps:")
    print("  1. Review campaign in Google Ads UI")
    print("  2. Verify conversion tracking is working")
    print("  3. Monitor for 1-2 weeks before optimizing")
    print("=" * 60)


def create_campaign_budget(client):
    """Create a $50/day budget."""
    budget_service = client.get_service("CampaignBudgetService")
    budget_operation = client.get_type("CampaignBudgetOperation")

    budget = budget_operation.create
    budget.name = f"PPI Search Budget {uuid.uuid4().hex[:8]}"
    budget.amount_micros = 50_000_000  # $50/day
    budget.delivery_method = client.enums.BudgetDeliveryMethodEnum.STANDARD

    response = budget_service.mutate_campaign_budgets(
        customer_id=CUSTOMER_ID,
        operations=[budget_operation]
    )
    return response.results[0].resource_name


def create_campaign(client, budget_resource):
    """Create a Search campaign with Manual CPC."""
    campaign_service = client.get_service("CampaignService")
    campaign_operation = client.get_type("CampaignOperation")

    campaign = campaign_operation.create
    campaign.name = "PPI - Plastic Machining (Search)"
    campaign.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH
    campaign.status = client.enums.CampaignStatusEnum.PAUSED  # Start paused for review
    campaign.campaign_budget = budget_resource

    # Manual CPC bidding for control
    campaign.manual_cpc.enhanced_cpc_enabled = False

    # Network settings - Search only, no partners
    campaign.network_settings.target_google_search = True
    campaign.network_settings.target_search_network = False
    campaign.network_settings.target_content_network = False

    # Required field - not political advertising (2 = NO)
    campaign.contains_eu_political_advertising = 2

    response = campaign_service.mutate_campaigns(
        customer_id=CUSTOMER_ID,
        operations=[campaign_operation]
    )
    return response.results[0].resource_name


def set_geo_targeting(client, campaign_resource):
    """Target United States only."""
    geo_service = client.get_service("CampaignCriterionService")
    geo_operation = client.get_type("CampaignCriterionOperation")

    criterion = geo_operation.create
    criterion.campaign = campaign_resource
    # 2840 = United States
    criterion.location.geo_target_constant = client.get_service(
        "GeoTargetConstantService"
    ).geo_target_constant_path("2840")

    geo_service.mutate_campaign_criteria(
        customer_id=CUSTOMER_ID,
        operations=[geo_operation]
    )


def create_ad_groups(client, campaign_resource):
    """Create targeted ad groups."""
    ad_group_service = client.get_service("AdGroupService")

    ad_groups = [
        {"name": "CNC Plastic Machining", "cpc": 8_000_000},  # $8 max CPC
        {"name": "High Performance Plastics", "cpc": 10_000_000},  # $10 max CPC
        {"name": "Plastic Fabrication", "cpc": 6_000_000},  # $6 max CPC
    ]

    operations = []
    for ag in ad_groups:
        operation = client.get_type("AdGroupOperation")
        ad_group = operation.create
        ad_group.name = f"PPI - {ag['name']}"
        ad_group.campaign = campaign_resource
        ad_group.status = client.enums.AdGroupStatusEnum.ENABLED
        ad_group.type_ = client.enums.AdGroupTypeEnum.SEARCH_STANDARD
        ad_group.cpc_bid_micros = ag["cpc"]
        operations.append(operation)

    response = ad_group_service.mutate_ad_groups(
        customer_id=CUSTOMER_ID,
        operations=operations
    )

    # Return mapping of name to resource
    return {
        "CNC Plastic Machining": response.results[0].resource_name,
        "High Performance Plastics": response.results[1].resource_name,
        "Plastic Fabrication": response.results[2].resource_name,
    }


def add_keywords(client, ad_group_resources):
    """Add targeted keywords to each ad group."""
    keyword_service = client.get_service("AdGroupCriterionService")

    keywords_by_group = {
        "CNC Plastic Machining": [
            ("custom plastic machining", "PHRASE"),
            ("CNC plastic parts", "PHRASE"),
            ("plastic machining services", "PHRASE"),
            ("precision plastic machining", "PHRASE"),
            ("plastic CNC machining quote", "PHRASE"),
            ("machined plastic components", "PHRASE"),
            ("plastic parts manufacturer", "PHRASE"),
        ],
        "High Performance Plastics": [
            ("PEEK machining", "PHRASE"),
            ("Ultem machining", "PHRASE"),
            ("Delrin machining", "PHRASE"),
            ("Torlon machining", "PHRASE"),
            ("PEEK parts manufacturer", "PHRASE"),
            ("high temperature plastic machining", "PHRASE"),
            ("engineering plastics machining", "PHRASE"),
        ],
        "Plastic Fabrication": [
            ("custom plastic fabrication", "PHRASE"),
            ("plastic fabrication services", "PHRASE"),
            ("UHMW fabrication", "PHRASE"),
            ("HDPE fabrication", "PHRASE"),
            ("plastic sheet fabrication", "PHRASE"),
            ("industrial plastic fabrication", "PHRASE"),
        ],
    }

    operations = []
    for group_name, keywords in keywords_by_group.items():
        ad_group_resource = ad_group_resources[group_name]
        for keyword_text, match_type in keywords:
            operation = client.get_type("AdGroupCriterionOperation")
            criterion = operation.create
            criterion.ad_group = ad_group_resource
            criterion.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
            criterion.keyword.text = keyword_text
            criterion.keyword.match_type = getattr(
                client.enums.KeywordMatchTypeEnum, match_type
            )
            operations.append(operation)

    keyword_service.mutate_ad_group_criteria(
        customer_id=CUSTOMER_ID,
        operations=operations
    )


def create_ads(client, ad_group_resources):
    """Create responsive search ads for each ad group."""
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

    ad_service.mutate_ad_group_ads(
        customer_id=CUSTOMER_ID,
        operations=operations
    )


if __name__ == "__main__":
    try:
        main()
    except GoogleAdsException as ex:
        print(f"\n❌ Google Ads API Error:")
        for error in ex.failure.errors:
            print(f"  - {error.message}")
        raise
