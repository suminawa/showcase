// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
export type { AuthPort, AuthResult, AuthErrorCode, OAuthProvider, SessionUser } from "./auth";
export type {
  AdminOrgRow, AdminSubscriptionRow, DataPort, InvitationRow, InvitationStatus, MemberView,
  Membership, Organization, Profile, Project, StripeCustomer, SubscriptionRow,
} from "./data";
export type { BillingErrorCode, BillingPort, SubscriptionChange, WebhookResult } from "./billing";
export type { MailMessage, MailPort, MailResult } from "./mail";

import type { AuthPort } from "./auth";
import type { BillingPort } from "./billing";
import type { DataPort } from "./data";
import type { MailPort } from "./mail";

export type Ports = { auth: AuthPort; data: DataPort; billing: BillingPort; mail: MailPort };
