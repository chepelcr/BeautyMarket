import re
import os

# Define all the replacements needed
replacements = [
    # ThemeSettingsController
    {
        "file": "server/src/controllers/ThemeSettingsController.ts",
        "old": "/api/users/{userId}/organizations/{orgId}/theme:",
        "new": "/api/users/{userId}/organization/{orgId}/settings/theme:"
    },
    # PaymentSettingsController
    {
        "file": "server/src/controllers/PaymentSettingsController.ts",
        "old": "/api/users/{userId}/organizations/{orgId}/payment:",
        "new": "/api/users/{userId}/organization/{orgId}/settings/payment:"
    },
    # ShippingSettingsController
    {
        "file": "server/src/controllers/ShippingSettingsController.ts",
        "old": "/api/users/{userId}/organizations/{orgId}/shipping:",
        "new": "/api/users/{userId}/organization/{orgId}/settings/shipping:"
    },
    # PageController
    {
        "file": "server/src/controllers/PageController.ts",
        "old": "/api/users/{userId}/organizations/{orgId}/pages",
        "new": "/api/users/{userId}/organization/{orgId}/pages"
    },
    # SectionController
    {
        "file": "server/src/controllers/SectionController.ts",
        "old": "/api/users/{userId}/organizations/{orgId}/pages",
        "new": "/api/users/{userId}/organization/{orgId}/pages"
    },
    # SectionContentController
    {
        "file": "server/src/controllers/SectionContentController.ts",
        "old": "/api/users/{userId}/organizations/{orgId}/pages",
        "new": "/api/users/{userId}/organization/{orgId}/pages"
    },
]

for replacement in replacements:
    file_path = replacement["file"]
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content.replace(replacement["old"], replacement["new"])
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {file_path}")
        else:
            print(f"No changes in {file_path}")
    else:
        print(f"File not found: {file_path}")

print("\nDone!")
