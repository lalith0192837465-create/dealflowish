# BYOC Architecture — Cloud-Agnostic Plan

This describes how DealFlow deploys into a CUSTOMER's own cloud account,
whichever cloud they use. The APP itself never changes. Only the deployment
layer (this folder) changes per cloud.

## What's identical, no matter the cloud

The app is a single containerized Next.js application plus one Postgres
database. That's it — that's the whole runtime. This is deliberate: the
simpler the shape, the easier it is to package for any cloud, and the
easier it is for a customer's security team to review.

```
[Customer's cloud account]
   |
   |--- Container running the DealFlow app (this repo, built into a Docker image)
   |--- Postgres database (their managed DB service)
   |--- Secrets storage (their secrets manager — holds API keys, DB password)
   |--- A way in: a URL, reachable only inside their network or via login
```

## The mapping: same job, different tool name per cloud

| Job | AWS | GCP | Azure |
|---|---|---|---|
| Run the container | ECS Fargate | Cloud Run | Container Apps |
| Database | RDS (Postgres) | Cloud SQL (Postgres) | Azure Database for PostgreSQL |
| Secrets | Secrets Manager | Secret Manager | Key Vault |
| Permissions | IAM Role (scoped to just this app) | Service Account (scoped) | Managed Identity (scoped) |
| Network isolation | VPC, private subnet | VPC, private service access | VNet, private endpoint |

Because the app itself is "just a container + a database" on every cloud,
switching clouds later is swapping which Terraform folder we use
(`infra/aws`, `infra/gcp`, `infra/azure`) — not rewriting the app.

## What's in each `infra/<cloud>` folder right now

Skeleton only — deliberately not filled in, because filling it in requires
customer-specific answers (which AWS account, which region, do they already
have a VPC we should use, etc. — see the security questions below). Each
folder has a `TODO.md` listing exactly what we need from that customer
before this becomes real Terraform.

## The permission model, described in plain terms (applies to all three)

Whatever cloud it's on, the app's permission gets exactly:
- Read/write to its own database, nothing else
- Read access to its own secrets, nothing else
- No permission to touch any other resource in the customer's account —
  not their other databases, not their other apps, nothing

This is the actual promise BYOC makes: "we can't see your other stuff, even
though we're running inside your account."
