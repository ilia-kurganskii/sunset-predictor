LAMBDA_NAME=$1
WEBHOOK_URL=$1
PLACES_DIR=$(dirname -- "$0")/places
find $PLACES_DIR -maxdepth 1 -type f -exec \
  aws lambda invoke --cli-binary-format raw-in-base64-out --function-name "$LAMBDA_NAME" --payload file://{} ./response.json \; >>/dev/null

aws lambda invoke --cli-binary-format raw-in-base64-out --function-name "$LAMBDA_NAME" --payload "{ \"type\": \"init\", \"webhook_url\": \"$WEBHOOK_URL\" }" ./response.json >>/dev/null
