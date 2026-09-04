# Azure deployment — not filled in yet

Will become Terraform (or Bicep) that deploys the Dockerfile above into the
customer's Azure subscription as: Container Apps (runs the container) +
Azure Database for PostgreSQL (the database) + Key Vault (holds keys) + a
Managed Identity scoped to only those two resources.

## What we need from the customer before writing the real Terraform

1. **Subscription ID and resource group** — which subscription are we deploying into
2. **Region**
3. **Existing VNet / private endpoint setup already in place?**
4. **Domain** — what URL should the app live at
5. **Who provides the initial deploy credentials, and how they're scoped**
   (a one-time deploy identity, not a standing owner/contributor role)
6. **Where should audit logs go** — their own Azure Monitor / Log Analytics, if they have one

Once we have these answers, this file gets replaced with real `.tf`/`.bicep` files.
