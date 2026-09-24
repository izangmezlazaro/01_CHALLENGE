terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "web_bucket" {
  bucket_prefix = "izan-challenge01-music"
  force_destroy = true

  lifecycle {
    ignore_changes = [
      object_lock_configuration,
      server_side_encryption_configuration,
      logging,
      lifecycle_rule
    ]
  }

  tags = {
    Name        = "Web Hosting S3"
    Environment = "Examen"
  }
}


resource "aws_s3_bucket_website_configuration" "web_hosting" {
  bucket = aws_s3_bucket.web_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "web_public" {
  bucket = aws_s3_bucket.web_bucket.id

  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

output "bucket_name" {

  value = aws_s3_bucket.web_bucket.id
}

output "website_endpoint" {
  value = aws_s3_bucket_website_configuration.web_hosting.website_endpoint
}