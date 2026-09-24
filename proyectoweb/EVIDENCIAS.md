# Historial de Comandos de Evidencia

```bash
export AWS_ACCESS_KEY_ID="[OCULTO_AWS_KEY]"
export AWS_SECRET_ACCESS_KEY="[OCULTO_SECRET_KEY]"
export AWS_SESSION_TOKEN="[OCULTO_SESSION_TOKEN]"
export AWS_DEFAULT_REGION="us-east-1"
cd proyectoweb
rm -rf .terraform .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup

terraform init
terraform apply -auto-approve

BUCKET="izan-challenge01-music20260924071151111900000001"

aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

cat << EOF > policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET" --policy file://policy.json
aws s3 website s3://"$BUCKET"/ --index-document index.html --error-document index.html
aws s3 sync . s3://"$BUCKET"/ --exclude "*.tf*" --exclude ".git*" --exclude "policy.*" --exclude ".terraform*"
```