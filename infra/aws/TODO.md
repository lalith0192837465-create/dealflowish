# AWS deployment — not filled in yet

This will become a Terraform module that deploys the Dockerfile above into
the customer's AWS account as: ECS Fargate (runs the container) + RDS (the
database) + Secrets Manager (holds keys) + an IAM role scoped to only those
two resources.

## What we need from the customer before writing the real Terraform

1. **AWS account ID** — which account are we deploying into
2. **Region** — where their other infrastructure lives (latency + compliance)
3. **Existing VPC?** — do they want this inside an existing network, or a new isolated one
4. **Domain** — what URL should the app live at (their subdomain, or ours)
5. **Who provides the AWS credentials for the initial deploy** — and how those
   credentials are scoped (this should be a one-time deploy role, not a
   standing admin credential)
6. **Log/audit destination** — do they want deployment and access logs sent
   to their own CloudTrail/logging setup

Once we have these answers, this file gets replaced with real `.tf` files.
