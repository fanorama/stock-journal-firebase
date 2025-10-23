#!/bin/bash

# Pre-Deployment Check Script for Firestore Security Rules
# This script validates security rules before deployment

set -e  # Exit on error

echo "🔍 Pre-Deployment Security Rules Check"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if firestore.rules exists
echo "1. Checking if firestore.rules exists..."
if [ -f "firestore.rules" ]; then
    echo -e "${GREEN}✓${NC} firestore.rules found"
else
    echo -e "${RED}✗${NC} firestore.rules not found"
    exit 1
fi

# Check Firebase CLI is installed
echo ""
echo "2. Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    FIREBASE_VERSION=$(firebase --version)
    echo -e "${GREEN}✓${NC} Firebase CLI installed (version: $FIREBASE_VERSION)"
else
    echo -e "${RED}✗${NC} Firebase CLI not installed"
    echo "   Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
echo ""
echo "3. Checking Firebase authentication..."
if firebase projects:list &> /dev/null; then
    echo -e "${GREEN}✓${NC} Logged in to Firebase"
else
    echo -e "${RED}✗${NC} Not logged in to Firebase"
    echo "   Login with: firebase login"
    exit 1
fi

# Check current Firebase project
echo ""
echo "4. Checking Firebase project..."
CURRENT_PROJECT=$(firebase use 2>&1 | grep "Active Project" | awk '{print $3}' || echo "none")
if [ "$CURRENT_PROJECT" != "none" ] && [ -n "$CURRENT_PROJECT" ]; then
    echo -e "${GREEN}✓${NC} Using Firebase project: $CURRENT_PROJECT"

    # Confirm deployment
    echo ""
    echo -e "${YELLOW}⚠${NC}  You are about to deploy to: $CURRENT_PROJECT"
    read -p "   Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}✗${NC} Deployment cancelled"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} No Firebase project selected"
    echo "   Select project with: firebase use <project-id>"
    exit 1
fi

# Validate rules syntax (dry run)
echo ""
echo "5. Validating security rules syntax..."
if firebase deploy --only firestore:rules --dry-run &> /dev/null; then
    echo -e "${GREEN}✓${NC} Security rules syntax is valid"
else
    echo -e "${RED}✗${NC} Security rules have syntax errors"
    echo "   Run: firebase deploy --only firestore:rules --dry-run"
    exit 1
fi

# Check if tests exist
echo ""
echo "6. Checking if tests exist..."
if [ -f "__tests__/firestore.rules.test.ts" ]; then
    echo -e "${GREEN}✓${NC} Security rules tests found"

    # Ask if user wants to run tests
    read -p "   Run tests before deployment? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   Running tests..."
        echo "   ${YELLOW}Note: Make sure Firebase emulator is running${NC}"
        echo "   Start with: firebase emulators:start --only firestore"
        echo ""
        read -p "   Is emulator running? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if npm run test:security-rules; then
                echo -e "${GREEN}✓${NC} All tests passed"
            else
                echo -e "${RED}✗${NC} Tests failed"
                read -p "   Continue deployment anyway? (y/n) " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    exit 1
                fi
            fi
        else
            echo -e "${YELLOW}⚠${NC}  Skipping tests (emulator not running)"
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC}  No tests found (optional)"
fi

# Final summary
echo ""
echo "======================================"
echo -e "${GREEN}✓${NC} All pre-deployment checks passed!"
echo ""
echo "Ready to deploy security rules to: $CURRENT_PROJECT"
echo ""
echo "Deploy commands:"
echo "  npm run deploy:rules     - Deploy only security rules"
echo "  npm run deploy:firestore - Deploy rules + indexes"
echo "  npm run deploy           - Deploy everything"
echo ""
