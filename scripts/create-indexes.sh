#!/bin/bash

# Script to automatically create missing Firestore indexes
# Usage: ./scripts/create-indexes.sh

set -e

echo "🔍 Creating Firestore Indexes..."

# Deploy indexes from firestore.indexes.json
firebase deploy --only firestore:indexes --project hcmtemplate

echo "✅ Indexes deployment initiated!"
echo ""
echo "⏳ Note: Index building can take several minutes to hours depending on data size."
echo "📊 Monitor progress at: https://console.firebase.google.com/project/hcmtemplate/firestore/indexes"
echo ""
echo "🔗 Or use these direct links if queries still fail:"

# Generate direct links for manual index creation from error messages
echo "Heritage Spots (featured + isActive + order):"
echo "https://console.firebase.google.com/v1/r/project/hcmtemplate/firestore/indexes?create_composite=CltwFoEIHTcYW1lcy1hZnBpL3YxL3BvaWI5OjpkOCAwKGhrKGl0OBgCGgwKCGZlYXR1cmVkEAEaDAoIaXNBY3RpdmUQARoJCgVvcmRlchABGgwKCF9fbmFtZV9fEAE"

echo ""
echo "Mini Games (isFeatured + isActive + order):"
echo "https://console.firebase.google.com/v1/r/project/hcmtemplate/firestore/indexes?create_composite=ClowYW1lcy5pbmRleGVzL18QARoMCghpc0FjdGl2ZRABGgkKBW9yZGVyEAEaDAoIX19uYW1lX18QAQ"

echo ""
echo "🎯 After indexes are built, refresh your application to resolve query errors."
