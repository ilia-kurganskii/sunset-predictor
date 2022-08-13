LAMBDA_NAME=$1
PLACES_DIR=$(dirname -- "$0")/places
aws lambda invoke --cli-binary-format raw-in-base64-out --function-name "$LAMBDA_NAME" --payload file://$PLACES_DIR/hague.json ./response.json >> /dev/null
aws lambda invoke --cli-binary-format raw-in-base64-out --function-name "$LAMBDA_NAME" --payload file://$PLACES_DIR/hague-zeilvernegning.json ./response.json >> /dev/null
