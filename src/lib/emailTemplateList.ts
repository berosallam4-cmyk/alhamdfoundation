export type TemplateKey =
  | "new_admin"
  | "new_student"
  | "approve"
  | "reject"
  | "lucky"
  | "withdraw";

export const TEMPLATE_LIST: {
  key: TemplateKey;
  label: string;
  desc: string;
}[] = [
  {
    key: "new_admin",
    label: "New Application → Foundation",
    desc: "Sent to the foundation's notification email whenever a student submits a new application.",
  },
  {
    key: "new_student",
    label: "New Application → Student",
    desc: "Confirmation sent to the student right after they submit their application.",
  },
  {
    key: "approve",
    label: "Application Approved",
    desc: "Sent when you press the Approve button on an application.",
  },
  {
    key: "reject",
    label: "Application Rejected",
    desc: "Sent when you press the Reject button on an application.",
  },
  {
    key: "lucky",
    label: "Lucky Draw / Selected",
    desc: "Sent when a student is selected in the draw or marked as Selected.",
  },
  {
    key: "withdraw",
    label: "Withdrawn / Cancelled",
    desc: "Sent when an approved or selected student is moved back to pending.",
  },
];
