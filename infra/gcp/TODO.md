# GCP deployment — not filled in yet

Will become Terraform that deploys the Dockerfile above into the customer's
GCP project as: Cloud Run (runs the container) + Cloud SQL (the database) +
Secret Manager (holds keys) + a Service Account scoped to only those two
resources.

## What we need from the customer before writing the real Terraform

1. **GCP project ID** — which project are we deploying into
2. **Region**
3. **Existing VPC / private service access already set up?**
4. **Domain** — what URL should the app live at
5. **Who provides the initial deploy credentials, and how they're scoped**
   (a one-time deploy service account, not a standing owner role)
6. **Where should audit logs go** — their own Cloud Logging setup, if they have one

Once we have these answers, this file gets replaced with real `.tf` files.
