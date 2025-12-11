#!/usr/bin/env python3
"""
Pause the existing Performance Max campaign.
"""

import os
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google.protobuf import field_mask_pb2

CUSTOMER_ID = "5241959874"
CAMPAIGN_ID = "23346089717"

def main():
    config_path = os.path.join(os.path.dirname(__file__), "google-ads.yaml")
    client = GoogleAdsClient.load_from_storage(config_path)

    campaign_service = client.get_service("CampaignService")
    campaign_operation = client.get_type("CampaignOperation")

    campaign = campaign_operation.update
    campaign.resource_name = campaign_service.campaign_path(CUSTOMER_ID, CAMPAIGN_ID)
    campaign.status = client.enums.CampaignStatusEnum.PAUSED

    campaign_operation.update_mask.CopyFrom(
        field_mask_pb2.FieldMask(paths=["status"])
    )

    try:
        response = campaign_service.mutate_campaigns(
            customer_id=CUSTOMER_ID,
            operations=[campaign_operation]
        )
        print(f"✅ Campaign paused: {response.results[0].resource_name}")
    except GoogleAdsException as ex:
        print(f"❌ Failed to pause campaign: {ex.failure.errors[0].message}")
        raise

if __name__ == "__main__":
    main()
