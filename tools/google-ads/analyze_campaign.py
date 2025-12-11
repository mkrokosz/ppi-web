#!/usr/bin/env python3
"""
Comprehensive campaign analysis for Google Ads account.
"""

import os
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from datetime import datetime, timedelta

CUSTOMER_ID = "5241959874"

def main():
    config_path = os.path.join(os.path.dirname(__file__), "google-ads.yaml")
    client = GoogleAdsClient.load_from_storage(config_path)
    ga_service = client.get_service("GoogleAdsService")

    print("\n" + "=" * 80)
    print("COMPREHENSIVE CAMPAIGN ANALYSIS")
    print(f"Account: {CUSTOMER_ID}")
    print("=" * 80)

    # 1. Campaign details with performance metrics
    print("\n### CAMPAIGN PERFORMANCE (Last 30 Days) ###\n")
    campaign_query = """
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign.bidding_strategy_type,
            campaign.start_date,
            campaign_budget.amount_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value,
            metrics.cost_per_conversion
        FROM campaign
        WHERE segments.date DURING LAST_30_DAYS
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=campaign_query)
        for batch in response:
            for row in batch.results:
                c = row.campaign
                m = row.metrics
                b = row.campaign_budget

                print(f"Campaign: {c.name} (ID: {c.id})")
                print(f"  Status: {c.status.name}")
                print(f"  Type: {c.advertising_channel_type.name}")
                print(f"  Bidding Strategy: {c.bidding_strategy_type.name}")
                print(f"  Start Date: {c.start_date}")
                print(f"  Daily Budget: ${b.amount_micros / 1_000_000:.2f}")
                print(f"\n  Performance Metrics (Last 30 Days):")
                print(f"    Impressions: {m.impressions:,}")
                print(f"    Clicks: {m.clicks:,}")
                print(f"    CTR: {m.ctr * 100:.2f}%")
                print(f"    Avg CPC: ${m.average_cpc / 1_000_000:.2f}")
                print(f"    Total Cost: ${m.cost_micros / 1_000_000:.2f}")
                print(f"    Conversions: {m.conversions:.1f}")
                if m.conversions > 0:
                    print(f"    Cost per Conversion: ${m.cost_per_conversion / 1_000_000:.2f}")
                    print(f"    Conversion Value: ${m.conversions_value:.2f}")
                print()
    except GoogleAdsException as ex:
        print(f"Campaign query failed: {ex.failure.errors[0].message}")

    # 2. Asset Group Performance (for Performance Max)
    print("\n### ASSET GROUPS ###\n")
    asset_group_query = """
        SELECT
            asset_group.id,
            asset_group.name,
            asset_group.status,
            asset_group.final_urls,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions
        FROM asset_group
        WHERE segments.date DURING LAST_30_DAYS
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=asset_group_query)
        for batch in response:
            for row in batch.results:
                ag = row.asset_group
                m = row.metrics
                print(f"Asset Group: {ag.name} (ID: {ag.id})")
                print(f"  Status: {ag.status.name}")
                print(f"  Final URLs: {list(ag.final_urls)}")
                print(f"  Impressions: {m.impressions:,}")
                print(f"  Clicks: {m.clicks:,}")
                print(f"  Conversions: {m.conversions:.1f}")
                print()
    except GoogleAdsException as ex:
        print(f"Asset group query failed: {ex.failure.errors[0].message}")

    # 3. Search terms (what people actually searched)
    print("\n### SEARCH TERMS (Top 20) ###\n")
    search_terms_query = """
        SELECT
            search_term_view.search_term,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.cost_micros,
            metrics.conversions
        FROM search_term_view
        WHERE segments.date DURING LAST_30_DAYS
        ORDER BY metrics.impressions DESC
        LIMIT 20
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=search_terms_query)
        found_terms = False
        for batch in response:
            for row in batch.results:
                found_terms = True
                st = row.search_term_view
                m = row.metrics
                conv_str = f", Conv: {m.conversions:.1f}" if m.conversions > 0 else ""
                print(f"  \"{st.search_term}\"")
                print(f"    Impr: {m.impressions:,} | Clicks: {m.clicks} | CTR: {m.ctr*100:.2f}% | Cost: ${m.cost_micros/1_000_000:.2f}{conv_str}")
        if not found_terms:
            print("  No search term data available (common for Performance Max campaigns)")
    except GoogleAdsException as ex:
        print(f"  Search terms query failed: {ex.failure.errors[0].message}")

    # 4. Audience signals
    print("\n### AUDIENCE SIGNALS ###\n")
    audience_query = """
        SELECT
            asset_group_signal.audience_signal.audiences,
            asset_group_signal.asset_group
        FROM asset_group_signal
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=audience_query)
        found_audiences = False
        for batch in response:
            for row in batch.results:
                found_audiences = True
                signal = row.asset_group_signal
                print(f"  Audience Signal: {signal.audience_signal}")
        if not found_audiences:
            print("  No audience signals configured")
    except GoogleAdsException as ex:
        print(f"  Audience query failed: {ex.failure.errors[0].message}")

    # 5. Geographic Performance
    print("\n### GEOGRAPHIC PERFORMANCE (Top 10) ###\n")
    geo_query = """
        SELECT
            geographic_view.country_criterion_id,
            geographic_view.location_type,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions
        FROM geographic_view
        WHERE segments.date DURING LAST_30_DAYS
        ORDER BY metrics.impressions DESC
        LIMIT 10
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=geo_query)
        found_geo = False
        for batch in response:
            for row in batch.results:
                found_geo = True
                geo = row.geographic_view
                m = row.metrics
                print(f"  Location ID: {geo.country_criterion_id} ({geo.location_type.name})")
                print(f"    Impr: {m.impressions:,} | Clicks: {m.clicks} | Cost: ${m.cost_micros/1_000_000:.2f} | Conv: {m.conversions:.1f}")
        if not found_geo:
            print("  No geographic data available")
    except GoogleAdsException as ex:
        print(f"  Geographic query failed: {ex.failure.errors[0].message}")

    # 6. Conversion actions
    print("\n### CONVERSION ACTIONS ###\n")
    conversion_query = """
        SELECT
            conversion_action.id,
            conversion_action.name,
            conversion_action.status,
            conversion_action.type,
            conversion_action.category
        FROM conversion_action
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=conversion_query)
        found_conv = False
        for batch in response:
            for row in batch.results:
                found_conv = True
                ca = row.conversion_action
                print(f"  {ca.name} (ID: {ca.id})")
                print(f"    Type: {ca.type.name} | Category: {ca.category.name} | Status: {ca.status.name}")
        if not found_conv:
            print("  No conversion actions configured")
    except GoogleAdsException as ex:
        print(f"  Conversion query failed: {ex.failure.errors[0].message}")

    # 7. Ad assets
    print("\n### AD ASSETS ###\n")
    asset_query = """
        SELECT
            asset.id,
            asset.name,
            asset.type,
            asset.text_asset.text,
            asset.image_asset.file_size,
            asset.final_urls
        FROM asset
        WHERE asset.type IN ('TEXT', 'IMAGE', 'HEADLINE', 'DESCRIPTION', 'CALL_TO_ACTION')
    """

    try:
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=asset_query)
        found_assets = False
        for batch in response:
            for row in batch.results:
                found_assets = True
                a = row.asset
                text = ""
                if a.text_asset and a.text_asset.text:
                    text = f" - \"{a.text_asset.text}\""
                print(f"  {a.type.name}: {a.name or 'Unnamed'}{text}")
        if not found_assets:
            print("  No text/image assets found")
    except GoogleAdsException as ex:
        print(f"  Asset query failed: {ex.failure.errors[0].message}")

    print("\n" + "=" * 80)
    print("END OF ANALYSIS")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
