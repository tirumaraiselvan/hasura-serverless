#!/bin/bash
set -e

mkdir -p temp
cd temp
rm -rf graphql-engine-heroku
git clone https://github.com/hasura/graphql-engine-heroku.git
cd graphql-engine-heroku
heroku apps:create
heroku stack:set container
INFO=$(heroku apps:info --json)
NAME=$(echo $INFO | jq -r ".app.name")
HTTP_URL=$(echo $INFO | jq -r ".app.web_url")
heroku addons:create heroku-postgresql:hobby-dev -a $NAME
git push heroku master

echo "endpoint: $HTTP_URL" > ../../hasura/config.yaml
cd ../../hasura
hasura migrate apply


GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo
echo -e "${GREEN}Run \`hasura console\` from the \`hasura\` directory${NC}"
echo


