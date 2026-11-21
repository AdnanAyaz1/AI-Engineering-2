# CloudScale Solutions - Company Handbook & Service Guide

## 1. Company Overview
CloudScale Solutions was founded in 2023 by Dr. Elena Vance and Marcus Thorne. We provide managed edge compute and automated infrastructure monitoring for distributed engineering teams.

## 2. Service Tier SLAs & Pricing
We offer three service tiers:
* **Starter Tier ($49/month):**
  - 99.5% uptime SLA
  - 5 team seats included
  - 24-hour email support response time
  - Maximum 100,000 edge function invocations per day

* **Professional Tier ($199/month):**
  - 99.9% uptime SLA
  - 25 team seats included
  - 4-hour business-day support response time
  - Maximum 1,000,000 edge function invocations per day
  - Automated weekly database snapshots

* **Enterprise Tier (Custom pricing, starting at $999/month):**
  - 99.99% uptime SLA with financial credit guarantees
  - Unlimited team seats
  - 15-minute 24/7/365 dedicated Slack/Teams response SLA
  - Unlimited edge function invocations
  - Custom data residency in US, EU, or APAC regions

## 3. Refund & Cancellation Policy
- Customers may cancel their subscription at any time via the billing portal.
- Subscriptions cancelled within the first 14 days of initial signup are eligible for a 100% full refund upon request to billing@cloudscale.example.com.
- After 14 days, refunds are not issued for partial billing cycles, but service remains active until the end of the paid period.
- Enterprise contracts are subject to master service agreements (MSAs) and require a 30-day written notice for non-renewal.

## 4. Security & Compliance
- CloudScale is certified SOC 2 Type II and ISO 27001 compliant.
- All data in transit is encrypted using TLS 1.3.
- All persistent storage is encrypted at rest using AES-256 keys managed via AWS KMS.
- We do not sell or share customer data with third-party advertisers.

## 5. Technical Limits & Specifications
- Edge function runtime: Node.js 22 LTS and Rust Wasm.
- Maximum request payload size: 10 MB.
- Maximum execution timeout per function: 30 seconds for Starter/Pro, 120 seconds for Enterprise.
- Memory allocation: 128 MB to 2048 MB per container.
