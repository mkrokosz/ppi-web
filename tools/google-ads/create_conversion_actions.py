#!/usr/bin/env python3
"""
Create conversion actions for contact tracking events.

These conversions track when users interact with contact information:
- email_click: Tapping email to open mail client
- email_copy: Clicking copy button for email
- phone_click: Tapping phone to open dialer
- phone_copy: Clicking copy button for phone
- directions_click: Tapping address or "Get Directions"
- address_copy: Clicking copy button for address
"""

import os
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

CUSTOMER_ID = "5241959874"

# Conversion actions to create
CONVERSION_ACTIONS = [
    {
        "name": "Email Click",
        "category": "CONTACT",
        "type": "WEBPAGE",
        "tag_event": "email_click",
    },
    {
        "name": "Email Copy",
        "category": "CONTACT",
        "type": "WEBPAGE",
        "tag_event": "email_copy",
    },
    {
        "name": "Phone Click",
        "category": "CONTACT",
        "type": "WEBPAGE",
        "tag_event": "phone_click",
    },
    {
        "name": "Phone Copy",
        "category": "CONTACT",
        "type": "WEBPAGE",
        "tag_event": "phone_copy",
    },
    {
        "name": "Directions Click",
        "category": "CONTACT",
        "type": "WEBPAGE",
        "tag_event": "directions_click",
    },
    {
        "name": "Address Copy",
        "category": "CONTACT",
        "type": "WEBPAGE",
        "tag_event": "address_copy",
    },
]


def main():
    config_path = os.path.join(os.path.dirname(__file__), "google-ads.yaml")
    client = GoogleAdsClient.load_from_storage(config_path)

    conversion_action_service = client.get_service("ConversionActionService")

    print("\n" + "=" * 60)
    print("CREATING CONVERSION ACTIONS")
    print("=" * 60 + "\n")

    operations = []

    for conv in CONVERSION_ACTIONS:
        conversion_action_operation = client.get_type("ConversionActionOperation")
        conversion_action = conversion_action_operation.create

        conversion_action.name = conv["name"]
        conversion_action.type_ = client.enums.ConversionActionTypeEnum.WEBPAGE
        conversion_action.category = client.enums.ConversionActionCategoryEnum[conv["category"]]
        conversion_action.status = client.enums.ConversionActionStatusEnum.ENABLED

        # Set counting type - count every conversion
        conversion_action.counting_type = client.enums.ConversionActionCountingTypeEnum.MANY_PER_CLICK

        # Set attribution model
        conversion_action.attribution_model_settings.attribution_model = (
            client.enums.AttributionModelEnum.GOOGLE_ADS_LAST_CLICK
        )

        # Set conversion window (30 days)
        conversion_action.click_through_lookback_window_days = 30
        conversion_action.view_through_lookback_window_days = 1

        operations.append(conversion_action_operation)
        print(f"  Prepared: {conv['name']} ({conv['tag_event']})")

    print("\nCreating conversion actions...")

    try:
        response = conversion_action_service.mutate_conversion_actions(
            customer_id=CUSTOMER_ID,
            operations=operations,
        )

        print("\n✓ Successfully created conversion actions:\n")
        for result in response.results:
            print(f"  - {result.resource_name}")

        print("\n" + "=" * 60)
        print("NEXT STEPS")
        print("=" * 60)
        print("""
These conversion actions are now created in Google Ads.

To track them, you need to either:

1. OPTION A - Use Google Tag Manager (Recommended):
   - Create triggers for each Firebase event
   - Fire Google Ads Conversion Tracking tags

2. OPTION B - Import from GA4:
   - Mark these events as conversions in GA4
   - Link GA4 to Google Ads
   - Import the conversions

Run check_conversions.py to verify they were created.
""")

    except GoogleAdsException as ex:
        print(f"\n✗ Failed to create conversion actions:")
        for error in ex.failure.errors:
            print(f"  Error: {error.message}")
            if error.location:
                for field in error.location.field_path_elements:
                    print(f"    Field: {field.field_name}")

        # Check if they already exist
        print("\nChecking if conversions already exist...")
        ga_service = client.get_service("GoogleAdsService")
        query = """
            SELECT conversion_action.name, conversion_action.id
            FROM conversion_action
            WHERE conversion_action.status = 'ENABLED'
        """
        response = ga_service.search_stream(customer_id=CUSTOMER_ID, query=query)
        existing = []
        for batch in response:
            for row in batch.results:
                existing.append(row.conversion_action.name)

        print("\nExisting conversion actions:")
        for name in existing:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
