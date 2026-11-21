
export interface Document {
  id: number;
  title: string;
  content: string;
}

export const documents: Document[] = [
  {
    id: 1,
    title: "Reset Password",
    content:
      "To reset your password, visit the login page, click forgot password, enter your registered email address, and follow the password reset link sent to your inbox.",
  },
  {
    id: 2,
    title: "Update Billing Information",
    content:
      "To update your billing information, open account settings, navigate to the billing section, and update your payment method or billing address.",
  },
  {
    id: 3,
    title: "Recover Account Access",
    content:
      "If you cannot access your account, use the account recovery process. Verify your registered email address and follow the instructions to regain access.",
  },
  {
    id: 4,
    title: "Cancel Subscription",
    content:
      "To cancel your subscription, open your account settings, select subscription management, and click cancel subscription.",
  },
  {
    id: 5,
    title: "Change Email Address",
    content:
      "To change your registered email address, visit profile settings, enter your new email address, and verify it using the confirmation link.",
  },
];
