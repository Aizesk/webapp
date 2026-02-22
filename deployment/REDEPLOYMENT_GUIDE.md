# Learner Lab Redeployment Guide

This guide explains how to restore the Aizesk platform in a fresh AWS Learner Lab account or session. Since Learner Labs have dynamic URLs and credentials that expire every 4 hours, these steps are critical for a successful migration.

## 1. AWS Session Setup
Every 4 hours, or when changing labs, you must update your local credentials:
1. In the Learner Lab console, click **AWS Details**.
2. Click **Show** next to AWS CLI credentials.
3. Copy the content and paste it into `~/.aws/credentials` under the `[default]` profile.

## 2. Infrastructure Deployment
Run the following commands to provision the network, RDS, ECS, and the API Gateway Proxy:

```bash
cd webapp/deployment
./deploy.sh infra
```

> [!IMPORTANT]
> This will generate a new Load Balancer DNS name and a new API Gateway URL. These are the "Source of Truth" for all external integrations.

To see the new URLs at any time, run:
```bash
./deploy.sh status
```

## 3. Shopify App Configuration
Shopify **requires** an HTTPS callback. Since the ALB is HTTP-only in this lab, we use an API Gateway Proxy.

1. Go to your **Shopify Partner Dashboard** > **Apps** > **App Setup**.
2. Update the following fields with your **HTTPS Proxy URL** (the `https://...` from Section 6):
   - **App URL**: `https://<api-gateway-id>.execute-api.us-east-1.amazonaws.com`
   - **Allowed redirection URL(s)**: `https://<api-gateway-id>.execute-api.us-east-1.amazonaws.com/api/v1/platforms/callback/shopify`
3. **Save** changes in Shopify.

> [!CAUTION]
> **DO NOT** use the Load Balancer DNS Name (`aizesk-alb-...`) here. Shopify will reject it because it is not HTTPS.

> [!TIP]
> If you get "redirect_uri not whitelisted" after updating the URL, try **Rotating the API Secret** in Shopify Settings and updating it in your `terraform.tfvars`.

## 4. Stripe Integration
Stripe webhooks also require an HTTPS endpoint.

1. Go to your **Stripe Dashboard** (Developers > Webhooks).
2. Add a new endpoint.
3. **Endpoint URL**: `https://<api-gateway-id>.execute-api.us-east-1.amazonaws.com/api/v1/subscriptions/webhook/stripe`
4. **Events to listen for**:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copy the **Signing Secret** (whsec_...) and update it in `terraform.tfvars` under `stripe_webhook_secret`.

## 5. Backend Deployment
Once the infrastructure is ready, deploy the services. Terraform will automatically inject the new Load Balancer and API Gateway URLs into the `CORS_ALLOWED_ORIGINS` and `SHOPIFY_REDIRECT_URI` environment variables.

```bash
cd webapp/deployment
./deploy.sh backend
```

## 6. How to identify your Proxy URL (HTTPS)
The API Gateway URL is your "Proxy URL". This is **NOT** the same as the Load Balancer DNS name.

| Name | Example | Protocol | Use Case |
| :--- | :--- | :--- | :--- |
| **DNS Name (ALB)** | `aizesk-alb-123.elb.com` | `http://` | Internal APIs, Frontend calls. |
| **Proxy URL (API Gateway)** | `y49d1531dd.execute-api...` | `https://` | **Shopify & Stripe Webhooks (MANDATORY)** |

**To find the Proxy URL and its ID:**
1. Run `./deploy.sh status`.
2. Look at the **Proxy (HTTPS)** line in the `URLs` section. 
3. It will look something like this:
   ```text
   URLs:
     Frontend:      http://aizesk-frontend-...
     ALB (HTTP):    http://aizesk-alb-...
     Proxy (HTTPS): https://y49d1531dd.execute-api.us-east-1.amazonaws.com
   ```
4. In this example, `y49d1531dd` is your **API Gateway ID**.

## 7. Summary of Dynamic URLs
| Component | Protocol | Description |
| :--- | :--- | :--- |
| **Frontend** | `http://` | S3 Static Website. Used for the webapp UI. |
| **ALB (API)** | `http://` | Internal/Main API entry point. |
| **API Gateway** | `https://` | **Proxy URL**: Use this for Shopify and Stripe Webhooks. |

## 8. Troubleshooting
- **CORS Error**: Ensure that the S3 Website URL and the API Gateway URL are both listed in the `CORS_ALLOWED_ORIGINS` environment variable (managed in `ecs-overrides.tf`).
- **Registration Fails**: Check if `auth-service` has the correct `SUBSCRIPTION_SERVICE_URL`.
- **Database Connection**: If RDS is recreated, Terraform will update the `SPRING_DATASOURCE_URL` automatically, but you must redeploy the services to apply it.

## 9. Final Checklist (New Lab session)
- [ ] AWS Credentials updated in `~/.aws/credentials`.
- [ ] `terraform apply` finished without errors.
- [ ] New API Gateway URL copied to **Shopify App Setup**.
- [ ] New API Gateway URL copied to **Stripe Webhooks**.
- [ ] Stripe Webhook Signing Secret updated in `terraform.tfvars`.
- [ ] `./deploy.sh backend` executed to refresh environment variables in ECS.
