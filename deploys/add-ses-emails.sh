#!/bin/bash

# Add and Verify Emails in AWS SES (Development Environment)
# This script automates adding email addresses to SES and managing verification

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_PROFILE=${AWS_PROFILE:-"J-CAMPOS"}

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           AWS SES Email Verification Manager              ║"
echo "║                 Development Environment                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI is not installed${NC}"
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
fi

# Verify AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity --profile $AWS_PROFILE --region $AWS_REGION > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ AWS credentials invalid or not configured${NC}"
    echo "Run: aws configure --profile $AWS_PROFILE"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials valid${NC}"
echo ""

# Function to check email verification status
check_email_status() {
    local email=$1

    # Get list of verified email identities
    local status=$(aws ses get-identity-verification-attributes \
        --identities "$email" \
        --region $AWS_REGION \
        --profile $AWS_PROFILE \
        --query "VerificationAttributes.\"$email\".VerificationStatus" \
        --output text 2>/dev/null)

    echo "$status"
}

# Function to add email to SES
add_email() {
    local email=$1

    echo -e "${YELLOW}  Adding email to SES...${NC}"
    aws ses verify-email-identity \
        --email-address "$email" \
        --region $AWS_REGION \
        --profile $AWS_PROFILE > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ Email added successfully${NC}"
        echo -e "${BLUE}  → Verification email sent to: $email${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Failed to add email${NC}"
        return 1
    fi
}

# Function to resend verification email
resend_verification() {
    local email=$1

    echo -e "${YELLOW}  Resending verification email...${NC}"

    # Delete and re-add to trigger new verification email
    aws ses delete-identity \
        --identity "$email" \
        --region $AWS_REGION \
        --profile $AWS_PROFILE > /dev/null 2>&1

    sleep 1

    aws ses verify-email-identity \
        --email-address "$email" \
        --region $AWS_REGION \
        --profile $AWS_PROFILE > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ Verification email resent${NC}"
        echo -e "${BLUE}  → Check inbox: $email${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Failed to resend verification${NC}"
        return 1
    fi
}

# Function to process a single email
process_email() {
    local email=$1

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Processing: ${email}${NC}"
    echo ""

    # Check current status
    local status=$(check_email_status "$email")

    if [ "$status" = "Success" ]; then
        echo -e "${GREEN}  ✓ Status: VERIFIED${NC}"
        echo -e "${GREEN}  → Email is already verified and ready to use${NC}"
        return 0

    elif [ "$status" = "Pending" ]; then
        echo -e "${YELLOW}  ⏳ Status: PENDING VERIFICATION${NC}"
        echo -e "${YELLOW}  → Verification email was sent but not confirmed${NC}"
        echo ""
        resend_verification "$email"
        return 0

    elif [ "$status" = "TemporaryFailure" ]; then
        echo -e "${RED}  ✗ Status: TEMPORARY FAILURE${NC}"
        echo -e "${YELLOW}  → Previous verification attempt failed${NC}"
        echo ""
        resend_verification "$email"
        return 0

    elif [ "$status" = "Failed" ]; then
        echo -e "${RED}  ✗ Status: FAILED${NC}"
        echo -e "${YELLOW}  → Verification failed, trying again${NC}"
        echo ""
        resend_verification "$email"
        return 0

    else
        # Email not in SES
        echo -e "${BLUE}  ℹ Status: NOT ADDED${NC}"
        echo -e "${BLUE}  → Email not found in SES${NC}"
        echo ""
        add_email "$email"
        return 0
    fi
}

# Function to delete email from SES
delete_email() {
    local email=$1

    echo -e "${YELLOW}  Deleting email from SES...${NC}"
    aws ses delete-identity \
        --identity "$email" \
        --region $AWS_REGION \
        --profile $AWS_PROFILE > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ Email deleted successfully${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Failed to delete email${NC}"
        return 1
    fi
}

# Function to get all verified emails from SES
get_all_ses_emails() {
    aws ses list-identities \
        --identity-type EmailAddress \
        --region $AWS_REGION \
        --profile $AWS_PROFILE \
        --query 'Identities' \
        --output text 2>/dev/null
}

# Main script logic
echo -e "${YELLOW}═══ Email Processing Mode ═══${NC}"
echo ""
echo "Choose an option:"
echo "  1) Enter emails manually (comma-separated)"
echo "  2) Load emails from file (with cleanup)"
echo "  3) Use default test emails"
echo ""
read -p "$(echo -e ${BLUE}Select option [1-3]: ${NC})" option

EMAILS=()
CLEANUP_MODE=false
FILE_PATH=""

case $option in
    1)
        echo ""
        echo -e "${BLUE}Enter email addresses (comma-separated):${NC}"
        read -p "> " email_input

        # Split by comma and trim whitespace
        IFS=',' read -ra EMAILS <<< "$email_input"
        for i in "${!EMAILS[@]}"; do
            EMAILS[$i]=$(echo "${EMAILS[$i]}" | xargs)
        done
        ;;

    2)
        echo ""
        echo -e "${BLUE}Enter path to file (one email per line):${NC}"
        read -p "> " file_path
        FILE_PATH="$file_path"

        if [ ! -f "$file_path" ]; then
            echo -e "${RED}✗ File not found: $file_path${NC}"
            exit 1
        fi

        # Read emails from file
        while IFS= read -r line || [ -n "$line" ]; do
            # Skip empty lines and comments
            [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
            email=$(echo "$line" | xargs)
            EMAILS+=("$email")
        done < "$file_path"

        # Enable cleanup mode for file-based processing
        CLEANUP_MODE=true
        ;;

    3)
        # Default test emails
        EMAILS=(
            "test@example.com"
            "dev@jcampos.dev"
            "admin@jmarkets.jcampos.dev"
        )
        echo ""
        echo -e "${BLUE}Using default test emails:${NC}"
        for email in "${EMAILS[@]}"; do
            echo "  • $email"
        done
        ;;

    *)
        echo -e "${RED}✗ Invalid option${NC}"
        exit 1
        ;;
esac

# Validate emails array
if [ ${#EMAILS[@]} -eq 0 ]; then
    echo -e "${RED}✗ No emails to process${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Processing ${#EMAILS[@]} email(s)${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Cleanup emails not in the file (only in file mode)
DELETED_COUNT=0
if [ "$CLEANUP_MODE" = true ]; then
    echo -e "${YELLOW}Checking for emails to remove from SES...${NC}"
    echo ""

    # Get all current SES emails
    SES_EMAILS=$(get_all_ses_emails)

    if [ -n "$SES_EMAILS" ]; then
        # Check each SES email
        for ses_email in $SES_EMAILS; do
            # Check if this email is in the file list
            email_found=false
            for file_email in "${EMAILS[@]}"; do
                if [ "$ses_email" = "$file_email" ]; then
                    email_found=true
                    break
                fi
            done

            # If SES email is not in file, delete it
            if [ "$email_found" = false ]; then
                echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo -e "${RED}Removing: ${ses_email}${NC}"
                echo -e "${BLUE}  → Not in file, cleaning up${NC}"
                echo ""
                delete_email "$ses_email"
                if [ $? -eq 0 ]; then
                    DELETED_COUNT=$((DELETED_COUNT + 1))
                fi
                echo ""
            fi
        done

        if [ $DELETED_COUNT -eq 0 ]; then
            echo -e "${GREEN}✓ No emails to remove${NC}"
            echo ""
        fi
    else
        echo -e "${BLUE}ℹ No emails currently in SES${NC}"
        echo ""
    fi
fi

# Process each email
VERIFIED_COUNT=0
PENDING_COUNT=0
ADDED_COUNT=0
FAILED_COUNT=0

for email in "${EMAILS[@]}"; do
    # Validate email format
    if [[ ! "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        echo -e "${RED}✗ Invalid email format: $email${NC}"
        echo ""
        FAILED_COUNT=$((FAILED_COUNT + 1))
        continue
    fi

    # Process the email
    process_email "$email"
    result=$?

    if [ $result -eq 0 ]; then
        status=$(check_email_status "$email")
        if [ "$status" = "Success" ]; then
            VERIFIED_COUNT=$((VERIFIED_COUNT + 1))
        else
            PENDING_COUNT=$((PENDING_COUNT + 1))
        fi
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi

    echo ""
done

# Final Summary
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}              PROCESSING COMPLETE                      ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✓ Verified:        ${VERIFIED_COUNT}${NC}"
echo -e "${YELLOW}⏳ Pending:         ${PENDING_COUNT}${NC}"
if [ $DELETED_COUNT -gt 0 ]; then
    echo -e "${RED}🗑  Deleted:         ${DELETED_COUNT}${NC}"
fi
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${RED}✗ Failed:          ${FAILED_COUNT}${NC}"
fi
echo ""

if [ $PENDING_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Next Steps:${NC}"
    echo "1. Check inbox for verification emails"
    echo "2. Click the verification link in each email"
    echo "3. Re-run this script to check status"
    echo ""
fi

echo -e "${BLUE}ℹ  Useful Commands:${NC}"
echo ""
echo "List all verified emails:"
echo "  aws ses list-verified-email-addresses --profile $AWS_PROFILE --region $AWS_REGION"
echo ""
echo "Check SES sending statistics:"
echo "  aws ses get-send-statistics --profile $AWS_PROFILE --region $AWS_REGION"
echo ""
echo "Get account sending limits:"
echo "  aws ses get-send-quota --profile $AWS_PROFILE --region $AWS_REGION"
echo ""

echo -e "${GREEN}✨ Done!${NC}"
echo ""
