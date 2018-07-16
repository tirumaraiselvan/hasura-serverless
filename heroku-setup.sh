#!/bin/bash
set -e

mkdir -p temp
cd temp
rm -rf graphql-engine-heroku
git clone https://github.com/hasura/graphql-engine-heroku.git
cd graphql-engine-heroku
HASURA_APP_INFO=$(heroku apps:create --remote hasura --json)
heroku stack:set container
HASURA_APP_NAME=$(echo $HASURA_APP_INFO | jq -r ".name")
HASURA_APP_WEB_URL=$(echo $HASURA_APP_INFO | jq -r ".web_url")
heroku addons:create heroku-postgresql:hobby-dev -a $HASURA_APP_NAME
git push hasura master

echo "endpoint: $HASURA_APP_WEB_URL" > ../../hasura/config.yaml
cd ../../hasura
hasura migrate apply

cd ..

ORDER_APP_INFO=$(heroku apps:create --remote orders --json)
ORDER_APP_WEB_URL=$(echo $ORDER_APP_INFO | jq -r ".web_url")
git subtree push --prefix order-app orders master


ANALYTICS_APP_INFO=$(heroku apps:create --remote analytics --json)
ANALYTICS_APP_WEB_URL=$(echo $ANALYTICS_APP_INFO | jq -r ".web_url")
git subtree push --prefix analytics analytics master


GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo
echo -e "${GREEN}Run \`hasura console\` from the \`hasura\` directory${NC}"
echo

echo
echo -e "${GREEN}Order app is running at $ORDER_APP_WEB_URL${NC}"
echo

echo
echo -e "${GREEN}Analytics app is running at $ANALYTICS_APP_WEB_URL${NC}"
echo
