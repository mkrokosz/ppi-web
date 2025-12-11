#!/usr/bin/env python3
"""
Show detailed structure of the PPI Search campaign.
"""

import os
from google.ads.googleads.client import GoogleAdsClient

CUSTOMER_ID = "5241959874"
CAMPAIGN_NAME = "PPI - Plastic Machining (Search)"

def main():
    config_path = os.path.join(os.path.dirname(__file__), "google-ads.yaml")
    client = GoogleAdsClient.load_from_storage(config_path)
    ga_service = client.get_service("GoogleAdsService")

    print("\n" + "=" * 70)
    print("PPI SEARCH CAMPAIGN DETAILS")
    print("=" * 70)

    # Campaign info
    campaign_query = f"""
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign_budget.amount_micros,
            campaign.network_settings.target_google_search,
            campaign.network_settings.target_search_network,
            campaign.network_settings.target_content_network
        FROM campaign
        WHERE campaign.name = '{CAMPAIGN_NAME}'
    """

    response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=campaign_query)
    for batch in response:
        for row in batch.results:
            c = row.campaign
            print(f"\n📊 CAMPAIGN: {c.name}")
            print(f"   ID: {c.id}")
            print(f"   Status: {c.status.name}")
            print(f"   Budget: ${row.campaign_budget.amount_micros / 1_000_000:.2f}/day")
            print(f"   Google Search: {c.network_settings.target_google_search}")
            print(f"   Search Partners: {c.network_settings.target_search_network}")
            print(f"   Display Network: {c.network_settings.target_content_network}")

    # Geo targeting
    print(f"\n🌎 GEO TARGETING:")
    geo_query = f"""
        SELECT
            campaign_criterion.location.geo_target_constant,
            campaign_criterion.negative
        FROM campaign_criterion
        WHERE campaign.name = '{CAMPAIGN_NAME}'
            AND campaign_criterion.type = 'LOCATION'
    """

    response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=geo_query)
    for batch in response:
        for row in batch.results:
            loc = row.campaign_criterion.location.geo_target_constant
            neg = "EXCLUDE" if row.campaign_criterion.negative else "INCLUDE"
            # 2840 = United States
            if "2840" in loc:
                print(f"   {neg}: United States")
            else:
                print(f"   {neg}: {loc}")

    # Ad groups and keywords
    print(f"\n📁 AD GROUPS & KEYWORDS:")
    adgroup_query = f"""
        SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            ad_group.cpc_bid_micros
        FROM ad_group
        WHERE campaign.name = '{CAMPAIGN_NAME}'
    """

    response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=adgroup_query)
    ad_groups = []
    for batch in response:
        for row in batch.results:
            ad_groups.append(row.ad_group)

    for ag in ad_groups:
        print(f"\n   📂 {ag.name}")
        print(f"      Status: {ag.status.name}")
        print(f"      Max CPC: ${ag.cpc_bid_micros / 1_000_000:.2f}")

        # Get keywords for this ad group
        kw_query = f"""
            SELECT
                ad_group_criterion.keyword.text,
                ad_group_criterion.keyword.match_type,
                ad_group_criterion.status
            FROM ad_group_criterion
            WHERE ad_group.id = {ag.id}
                AND ad_group_criterion.type = 'KEYWORD'
        """

        kw_response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=kw_query)
        print(f"      Keywords:")
        for kw_batch in kw_response:
            for kw_row in kw_batch.results:
                kw = kw_row.ad_group_criterion.keyword
                print(f"         - [{kw.match_type.name}] \"{kw.text}\"")

    # Ads
    print(f"\n📝 ADS:")
    ad_query = f"""
        SELECT
            ad_group_ad.ad.id,
            ad_group_ad.ad.responsive_search_ad.headlines,
            ad_group_ad.ad.responsive_search_ad.descriptions,
            ad_group_ad.ad.final_urls,
            ad_group_ad.status,
            ad_group.name
        FROM ad_group_ad
        WHERE campaign.name = '{CAMPAIGN_NAME}'
    """

    response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=ad_query)
    for batch in response:
        for row in batch.results:
            ad = row.ad_group_ad.ad
            print(f"\n   Ad in '{row.ad_group.name}'")
            print(f"      Status: {row.ad_group_ad.status.name}")
            print(f"      Final URL: {list(ad.final_urls)}")
            print(f"      Headlines ({len(ad.responsive_search_ad.headlines)}):")
            for h in ad.responsive_search_ad.headlines[:5]:
                print(f"         • {h.text}")
            if len(ad.responsive_search_ad.headlines) > 5:
                print(f"         ... and {len(ad.responsive_search_ad.headlines) - 5} more")
            print(f"      Descriptions ({len(ad.responsive_search_ad.descriptions)}):")
            for d in ad.responsive_search_ad.descriptions:
                print(f"         • {d.text[:60]}...")

    print("\n" + "=" * 70)
    print("NEXT STEPS:")
    print("=" * 70)
    print("1. Review campaign in Google Ads UI")
    print("2. Enable the campaign when ready: python3 enable_campaign.py")
    print("3. Monitor performance for 1-2 weeks")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
