#! /usr/bin/env bash

set -e

# Build and push order-app and analytics-app to gh-pages branch

if [[ $(git diff --stat) != '' ]]; then
    echo 'dirty tree, commit all changes'
    exit 1
fi

ORIGIN_REMOTE_URL=$(git config --get remote.origin.url)

git clone . tmp
cd tmp
git checkout -b gh-pages
git rm -rf .
cd ..

cd order-app
npm run build
mv build ../tmp/order-app
cd ..

cd analytics-app
npm run build
mv build ../tmp/analytics-app
cd ..

cd tmp
git add .
git commit -m "deploy"
git remote set-url origin "$ORIGIN_REMOTE_URL"
git push -f origin gh-pages
cd ..

rm -rf tmp

echo "done"
