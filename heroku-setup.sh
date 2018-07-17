#!/bin/bash
set -e

GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Removing existing remotes (if exists)...${NC}"
git remote remove hasura || true
git remote remove orders || true
git remote remove analytics || true
git remote remove restaurant || true
git remote remove hasuraclient || true
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
ORDER_APP_NAME=$(echo $ORDER_APP_INFO | jq -r ".name")
ORDER_APP_WEB_URL=$(echo $ORDER_APP_INFO | jq -r ".web_url")
HTTP_GRAPHQL_ENDPOINT=$HASURA_APP_WEB_URL/v1alpha1/graphql
heroku config:set REACT_APP_HASURA_HTTP_URL=$HTTP_GRAPHQL_ENDPOINT -a $ORDER_APP_NAME
WEBSOCKET_GRAPHQL_ENDPOINT=${HTTP_GRAPHQL_ENDPOINT/http/ws}
heroku config:set REACT_APP_HASURA_WEBSOCKET_URL=$WEBSOCKET_GRAPHQL_ENDPOINT -a $ORDER_APP_NAME
git subtree push --prefix order-app orders master


ANALYTICS_APP_INFO=$(heroku apps:create --remote analytics --json)
ANALYTICS_APP_NAME=$(echo $ANALYTICS_APP_INFO | jq -r ".name")
ANALYTICS_APP_WEB_URL=$(echo $ANALYTICS_APP_INFO | jq -r ".web_url")
heroku config:set REACT_APP_HASURA_HTTP_URL=$HTTP_GRAPHQL_ENDPOINT -a $ANALYTICS_APP_NAME
heroku config:set REACT_APP_HASURA_WEBSOCKET_URL=$WEBSOCKET_GRAPHQL_ENDPOINT -a $ANALYTICS_APP_NAME
git subtree push --prefix analytics analytics master

RESTAURANT_APP_INFO=$(heroku apps:create --remote restaurant --json)
RESTAURANT_APP_NAME=$(echo $RESTAURANT_APP_INFO | jq -r ".name")
RESTAURANT_APP_WEB_URL=$(echo $RESTAURANT_APP_INFO | jq -r ".web_url")
heroku config:set HASURA_HTTP_URL=$HTTP_GRAPHQL_ENDPOINT -a $RESTAURANT_APP_NAME
heroku config:set HASURA_WEBSOCKET_URL=$WEBSOCKET_GRAPHQL_ENDPOINT -a $RESTAURANT_APP_NAME
git subtree push --prefix restaurant restaurant master

HASURA_CLIENT_INFO=$(heroku apps:create --remote hasuraclient --json)
HASURA_CLIENT_NAME=$(echo $HASURA_CLIENT_INFO | jq -r ".name")
HASURA_CLIENT_WEB_URL=$(echo $HASURA_CLIENT_INFO | jq -r ".web_url")
heroku config:set HASURA_HTTP_URL=$HTTP_GRAPHQL_ENDPOINT -a $HASURA_CLIENT_NAME
heroku config:set HASURA_WEBSOCKET_URL=$WEBSOCKET_GRAPHQL_ENDPOINT -a $HASURA_CLIENT_NAME
git subtree push --prefix hasura hasuraclient master



echo
echo -e "${GREEN}Run \`hasura console\` from the \`hasura\` directory${NC}"
echo

echo
echo -e "${GREEN}Order app is running at $ORDER_APP_WEB_URL${NC}"
echo

echo
echo -e "${GREEN}Analytics app is running at $ANALYTICS_APP_WEB_URL${NC}"
echo

echo
echo -e "${GREEN}Restaurant app is running at $RESTAURANT_APP_WEB_URL${NC}"
echo

echo
echo -e "${GREEN}Hasura client is running at $HASURA_CLIENT_WEB_URL${NC}"
echo
