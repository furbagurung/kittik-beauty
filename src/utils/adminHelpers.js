export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.toLowerCase().trim());
}

export function getUserRole(email) {
  return isAdminEmail(email) ? "admin" : "customer";
}
