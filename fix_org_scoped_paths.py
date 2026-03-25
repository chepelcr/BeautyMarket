import re
import os

# Fix org-scoped controllers that need full path prefix
replacements = [
    # DeploymentController
    {
        "file": "server/src/controllers/DeploymentController.ts",
        "patterns": [
            ("/api/deployments:", "/api/users/{userId}/organization/{orgId}/deployments:"),
            ("/api/deployments/status", "/api/users/{userId}/organization/{orgId}/deployments/status"),
            ("/api/deployments/history", "/api/users/{userId}/organization/{orgId}/deployments/history"),
        ]
    },
    # PreDeploymentController
    {
        "file": "server/src/controllers/PreDeploymentController.ts",
        "patterns": [
            ("/api/pre-deployments:", "/api/users/{userId}/organization/{orgId}/pre-deployments:"),
            ("/api/pre-deployments/active", "/api/users/{userId}/organization/{orgId}/pre-deployments/active"),
            ("/api/pre-deployments/{id}", "/api/users/{userId}/organization/{orgId}/pre-deployments/{id}"),
        ]
    },
    # S3UploadController
    {
        "file": "server/src/controllers/S3UploadController.ts",
        "patterns": [
            ("/api/upload/presigned:", "/api/users/{userId}/organization/{orgId}/upload/presigned:"),
        ]
    },
    # InvitationController
    {
        "file": "server/src/controllers/InvitationController.ts",
        "patterns": [
            ("/api/invitations/organization/{organizationId}:", "/api/users/{userId}/organization/{orgId}/invitations:"),
            ("/api/invitations/pending/{email}:", "/api/users/{userId}/organization/{orgId}/invitations/pending/{email}:"),
            ("/api/invitations/{id}:", "/api/users/{userId}/organization/{orgId}/invitations/{id}:"),
            ("/api/invitations:", "/api/users/{userId}/organization/{orgId}/invitations:"),
            ("/api/invitations/{id}/resend:", "/api/users/{userId}/organization/{orgId}/invitations/{id}/resend:"),
            ("/api/invitations/expire-old:", "/api/users/{userId}/organization/{orgId}/invitations/expire-old:"),
        ]
    },
    # RBACController
    {
        "file": "server/src/controllers/RBACController.ts",
        "patterns": [
            ("/api/rbac/roles:", "/api/users/{userId}/organization/{orgId}/rbac/roles:"),
            ("/api/rbac/roles/organization/{organizationId}:", "/api/users/{userId}/organization/{orgId}/rbac/roles/organization:"),
            ("/api/rbac/roles/{id}:", "/api/users/{userId}/organization/{orgId}/rbac/roles/{id}:"),
            ("/api/rbac/modules:", "/api/users/{userId}/organization/{orgId}/rbac/modules:"),
            ("/api/rbac/actions:", "/api/users/{userId}/organization/{orgId}/rbac/actions:"),
            ("/api/rbac/roles/{id}/permissions:", "/api/users/{userId}/organization/{orgId}/rbac/roles/{id}/permissions:"),
            ("/api/rbac/check-permission:", "/api/users/{userId}/organization/{orgId}/rbac/check-permission:"),
            ("/api/rbac/user/{userId}/organization/{organizationId}/role:", "/api/users/{userId}/organization/{orgId}/rbac/user-role:"),
        ]
    },
]

for replacement in replacements:
    file_path = replacement["file"]
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for old, new in replacement["patterns"]:
            new_content = new_content.replace(old, new)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {file_path}")
        else:
            print(f"No changes in {file_path}")
    else:
        print(f"File not found: {file_path}")

print("\nDone!")
