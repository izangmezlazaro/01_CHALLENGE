export AWS_ACCESS_KEY_ID="[OCULTO_AWS_KEY]"
export AWS_SECRET_ACCESS_KEY="[OCULTO_SECRET_KEY]"
export AWS_SESSION_TOKEN="[OCULTO_SESSION_TOKEN]"
export AWS_DEFAULT_REGION="us-east-1"
cd proyectoweb
rm -rf .terraform .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup

$ aws sts get-caller-identity
{
    "UserId": "AROAQFXKADGKXXXXXXXXX:user",
    "Account": "012301900181",
    "Arn": "arn:aws:sts::012301900181:assumed-role/voclabs/user"
}

$ terraform init

Initializing the backend...

Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.100.0...
- Installed hashicorp/aws v5.100.0 (signed by HashiCorp)

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.



$ terraform validate
Success! The configuration is valid.

$ terraform plan

Terraform used the selected providers to generate the following execution plan.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_s3_bucket.web_bucket will be created
  + resource "aws_s3_bucket" "web_bucket" {
      + arn                         = (known after apply)
      + bucket                      = (known after apply)
      + bucket_prefix               = "izan-challenge01-music"
      + force_destroy               = true
      + id                          = (known after apply)
      + tags                        = {
          + "Environment" = "Examen"
          + "Name"        = "Web Hosting S3"
        }
    }

  # aws_s3_bucket_website_configuration.web_hosting will be created
  + resource "aws_s3_bucket_website_configuration" "web_hosting" {
      + bucket           = (known after apply)
      + id               = (known after apply)
      + website_domain   = (known after apply)
      + website_endpoint = (known after apply)

      + error_document {
          + key = "index.html"
        }
      + index_document {
          + suffix = "index.html"
        }
    }

Plan: 2 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + bucket_name      = (known after apply)
  + website_endpoint = (known after apply)
```

---


$ terraform apply -auto-approve

aws_s3_bucket.web_bucket: Creating...
aws_s3_bucket.web_bucket: Creation complete after 3s [id=izan-challenge01-music20260924071151111900000001]
aws_s3_bucket_website_configuration.web_hosting: Creating...
aws_s3_bucket_website_configuration.web_hosting: Creation complete after 2s [id=izan-challenge01-music20260924071151111900000001]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:

bucket_name = "izan-challenge01-music20260924071151111900000001"
website_endpoint = "izan-challenge01-music20260924071151111900000001.s3-website-us-east-1.amazonaws.com"

$ BUCKET="izan-challenge01-music20260924071151111900000001"

$ aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

$ aws s3api put-bucket-policy --bucket "$BUCKET" --policy file://policy.json

$ aws s3 website s3://"$BUCKET"/ --index-document index.html --error-document index.html


$ aws s3 sync . s3://"$BUCKET"/ --exclude "*.tf*" --exclude ".git*" --exclude "policy.*" --exclude ".terraform*"

upload: css/styles.css to s3://izan-challenge01-music20260924071151111900000001/css/styles.css
upload: js/app.js to s3://izan-challenge01-music20260924071151111900000001/js/app.js
upload: img/album1.jpg to s3://izan-challenge01-music20260924071151111900000001/img/album1.jpg
upload: img/album2.jpg to s3://izan-challenge01-music20260924071151111900000001/img/album2.jpg
upload: img/album3.jpg to s3://izan-challenge01-music20260924071151111900000001/img/album3.jpg
upload: img/album4.jpg to s3://izan-challenge01-music20260924071151111900000001/img/album4.jpg
upload: img/hero.jpg to s3://izan-challenge01-music20260924071151111900000001/img/hero.jpg
upload: img/instruments.jpg to s3://izan-challenge01-music20260924071151111900000001/img/instruments.jpg
upload: ./index.html to s3://izan-challenge01-music20260924071151111900000001/index.html


$ curl -I "http://izan-challenge01-music20260924071151111900000001.s3-website-us-east-1.amazonaws.com/"

HTTP/1.1 200 OK
x-amz-id-2: W4Vq8...
x-amz-request-id: 7G8...
Date: Thu, 24 Sep 2026 09:23:00 GMT
Last-Modified: Thu, 24 Sep 2026 09:22:45 GMT
ETag: "9b3fa128..."
Content-Type: text/html
Content-Length: 8746
Server: AmazonS3
