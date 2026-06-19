package com.example.ComplainSystem.services;

import com.example.ComplainSystem.config.AppProperties;
import com.example.ComplainSystem.config.MailProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import sendinblue.ApiClient;
import sendinblue.Configuration;
import sibApi.TransactionalEmailsApi;
import sibModel.CreateSmtpEmail;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;

import java.util.List;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final AppProperties appProperties;
    private final MailProperties mailProperties;
    private final TransactionalEmailsApi brevoApi;

    public EmailService(AppProperties appProperties,
                        MailProperties mailProperties,
                        @Value("${brevo.api-key}") String apiKey) {
        this.appProperties  = appProperties;
        this.mailProperties = mailProperties;

        ApiClient client = Configuration.getDefaultApiClient();
        client.setApiKey(apiKey);
        this.brevoApi = new TransactionalEmailsApi();
    }

    // ── 0. Application Confirmation ────────────────────────────────────────────

    @Async
    public void sendApplicationConfirmation(String toEmail, String toName, String orgName) {
        String subject = "ResolveHub – Application Received for " + orgName;
        String body = """
                <p>Hi %s,</p>
                <p>Thank you for applying to join <strong>ResolveHub</strong>.</p>
                <p>We have received your organization application for <strong>%s</strong> and it is currently <strong>under review</strong>.</p>
                <div style="background:#f5f7fb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">What happens next?</p>
                  <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
                    <li>Our team will review your application details</li>
                    <li>You will receive an email with your admin credentials once approved</li>
                    <li>Estimated review time: <strong>1–2 business days</strong></li>
                  </ul>
                </div>
                <p style="color:#6b7280;font-size:13px;">If you have any questions, please reply to this email.</p>
                """.formatted(toName, orgName);
        send(toEmail, toName, subject, wrap(body, "Application Received"));
    }

    // ── 1. Complaint Created ────────────────────────────────────────────────────

    @Async
    public void sendComplaintCreated(String toEmail, String toName,
                                     String ticketNumber, String title,
                                     String orgName) {
        String trackingUrl = appProperties.getBaseUrl() + "/issues";
        String subject = "[" + ticketNumber + "] Complaint Received – " + title;
        String body = """
                <p>Hi %s,</p>
                <p>Your complaint has been successfully submitted to <strong>%s</strong>.</p>
                <table style="border-collapse:collapse;margin:16px 0;">
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Ticket</td>
                      <td style="padding:6px 12px;font-family:monospace;color:#4f46e5;">%s</td></tr>
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Title</td>
                      <td style="padding:6px 12px;">%s</td></tr>
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Status</td>
                      <td style="padding:6px 12px;">Open</td></tr>
                </table>
                <p style="margin:24px 0;">
                  <a href="%s" style="background:linear-gradient(135deg,#3525cd,#4f46e5);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    Track My Complaint
                  </a>
                </p>
                """.formatted(toName, orgName, ticketNumber, title, trackingUrl);
        send(toEmail, toName, subject, wrap(body, "Complaint Submitted"));
    }

    // ── 2. Magic Tracking Link ──────────────────────────────────────────────────

    @Async
    public void sendMagicTrackingLink(String toEmail, String toName,
                                      String ticketNumber, String title,
                                      String orgName, String trackingToken) {
        String trackingUrl = appProperties.getBaseUrl() + "/track/" + ticketNumber + "?token=" + trackingToken;
        String subject = "[" + ticketNumber + "] Track your complaint – " + title;
        String body = """
                <p>Hi %s,</p>
                <p>Your complaint has been submitted to <strong>%s</strong>.</p>
                <table style="border-collapse:collapse;margin:16px 0;">
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Ticket</td>
                      <td style="padding:6px 12px;font-family:monospace;color:#4f46e5;">%s</td></tr>
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Title</td>
                      <td style="padding:6px 12px;">%s</td></tr>
                </table>
                <p>Use the secure link below to track your complaint. No login required.</p>
                <p style="margin:24px 0;">
                  <a href="%s" style="background:linear-gradient(135deg,#3525cd,#4f46e5);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    Track My Complaint
                  </a>
                </p>
                <p style="color:#9ca3af;font-size:12px;">This link is unique to your complaint. Do not share it.</p>
                """.formatted(toName, orgName, ticketNumber, title, trackingUrl);
        send(toEmail, toName, subject, wrap(body, "Your Tracking Link"));
    }

    // ── 2b. Comment Notification ────────────────────────────────────────────────

    @Async
    public void sendCommentNotification(String toEmail, String toName,
                                        String commenterName, String ticketNumber,
                                        String title, String commentText, Long issueId) {
        String issueUrl = appProperties.getBaseUrl() + "/issues/" + issueId;
        String subject  = "[" + ticketNumber + "] New reply on: " + title;
        String body = """
                <p>Hi %s,</p>
                <p><strong>%s</strong> has replied on complaint <strong>%s</strong>.</p>
                <div style="background:#f5f7fb;border-left:4px solid #4f46e5;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;">
                  <p style="margin:0;font-size:14px;color:#374151;">%s</p>
                </div>
                <p style="margin:24px 0;">
                  <a href="%s" style="background:linear-gradient(135deg,#3525cd,#4f46e5);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    View Full Conversation
                  </a>
                </p>
                """.formatted(toName, commenterName, ticketNumber, commentText, issueUrl);
        send(toEmail, toName, subject, wrap(body, "New Reply"));
    }

    // ── 3. Status Update ────────────────────────────────────────────────────────

    @Async
    public void sendStatusUpdate(String toEmail, String toName,
                                  String ticketNumber, String title,
                                  String oldStatus, String newStatus,
                                  Long issueId, String resolutionNote,
                                  String trackingToken) {
        boolean isResolved = "RESOLVED".equals(newStatus);

        String viewUrl = (trackingToken != null && !trackingToken.isBlank())
                ? appProperties.getBaseUrl() + "/track/" + ticketNumber + "?token=" + trackingToken
                : appProperties.getBaseUrl() + "/issues/" + issueId;

        String reopenUrl = (trackingToken != null && !trackingToken.isBlank())
                ? appProperties.getBaseUrl() + "/track/" + ticketNumber + "?token=" + trackingToken
                : null;

        String subject = "[" + ticketNumber + "] Status Update: " + formatStatus(newStatus);

        String noteBlock = (isResolved && resolutionNote != null && !resolutionNote.isBlank())
                ? "<div style=\"background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;\">"
                  + "<p style=\"margin:0 0 4px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#15803d;\">Resolution Note</p>"
                  + "<p style=\"margin:0;font-size:14px;color:#374151;\">" + resolutionNote + "</p>"
                  + "</div>"
                : "";

        String reopenBlock = (isResolved && reopenUrl != null)
                ? "<div style=\"background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px 16px;margin:20px 0;\">"
                  + "<p style=\"margin:0 0 6px;font-size:13px;font-weight:bold;color:#c2410c;\">Not satisfied with the resolution?</p>"
                  + "<p style=\"margin:0 0 12px;font-size:13px;color:#374151;\">You have <strong>48 hours</strong> to reopen this complaint.</p>"
                  + "<a href=\"" + reopenUrl + "\" style=\"background:#ef4444;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;\">"
                  + "Mark as Unsatisfied / Reopen"
                  + "</a>"
                  + "</div>"
                : "";

        String body = """
                <p>Hi %s,</p>
                <p>The status of your complaint has been updated.</p>
                <table style="border-collapse:collapse;margin:16px 0;">
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Ticket</td>
                      <td style="padding:6px 12px;font-family:monospace;color:#4f46e5;">%s</td></tr>
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Title</td>
                      <td style="padding:6px 12px;">%s</td></tr>
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Previous</td>
                      <td style="padding:6px 12px;color:#9ca3af;">%s</td></tr>
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">New Status</td>
                      <td style="padding:6px 12px;font-weight:bold;color:#4f46e5;">%s</td></tr>
                </table>
                %s
                %s
                <p style="margin:24px 0;">
                  <a href="%s" style="background:linear-gradient(135deg,#3525cd,#4f46e5);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    View Full Details
                  </a>
                </p>
                """.formatted(toName, ticketNumber, title,
                              formatStatus(oldStatus), formatStatus(newStatus),
                              noteBlock, reopenBlock, viewUrl);

        send(toEmail, toName, subject, wrap(body, "Status Updated"));
    }

    // ── 3b. Reopen Notification ─────────────────────────────────────────────────

    @Async
    public void sendReopenNotification(String toEmail, String toName,
                                       String ticketNumber, String title) {
        String issueUrl = appProperties.getBaseUrl() + "/issues";
        String subject  = "[" + ticketNumber + "] Complaint Reopened by User";
        String body = """
                <p>Hi %s,</p>
                <p>A user has marked their complaint as <strong>unsatisfied</strong> and it has been reopened.</p>
                <table style="border-collapse:collapse;margin:16px 0;">
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Ticket</td>
                      <td style="padding:6px 12px;font-family:monospace;color:#4f46e5;">%s</td></tr>
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">Title</td>
                      <td style="padding:6px 12px;">%s</td></tr>
                  <tr><td style="padding:6px 12px;font-weight:bold;color:#6b7280;">New Status</td>
                      <td style="padding:6px 12px;font-weight:bold;color:#f59e0b;">In Progress</td></tr>
                </table>
                <p style="margin:24px 0;">
                  <a href="%s" style="background:linear-gradient(135deg,#3525cd,#4f46e5);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    View Issues
                  </a>
                </p>
                """.formatted(toName, ticketNumber, title, issueUrl);
        send(toEmail, toName, subject, wrap(body, "Complaint Reopened"));
    }

    // ── 3c. Managed User Welcome ────────────────────────────────────────────────

    @Async
    public void sendManagedUserWelcome(String toEmail, String toName,
                                       String role, String password,
                                       String adminName) {
        String loginUrl  = appProperties.getBaseUrl() + "/login";
        String changeUrl = appProperties.getBaseUrl() + "/profile/change-password";
        String roleLabel = "STAFF".equals(role) ? "Support Staff" : "User";
        String subject   = "Welcome to ResolveHub – Your Account is Ready";
        String body = """
                <p>Hi %s,</p>
                <p>Your ResolveHub account has been created by <strong>%s</strong>.</p>
                <p>You have been added as a <strong>%s</strong>.</p>
                <div style="background:#f5f7fb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#6b7280;">Your Login Credentials</p>
                  <table style="border-collapse:collapse;width:100%%;">
                    <tr><td style="padding:6px 0;font-weight:bold;color:#374151;width:140px;">Email</td>
                        <td style="padding:6px 0;font-family:monospace;">%s</td></tr>
                    <tr><td style="padding:6px 0;font-weight:bold;color:#374151;">Password</td>
                        <td style="padding:6px 0;font-family:monospace;color:#4f46e5;font-weight:bold;">%s</td></tr>
                  </table>
                </div>
                <p style="color:#ef4444;font-size:13px;font-weight:bold;">&#9888; Please change your password immediately after first login.</p>
                <div style="margin:24px 0;">
                  <a href="%s" style="background:linear-gradient(135deg,#3525cd,#4f46e5);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:12px;">
                    Login Now
                  </a>
                  <a href="%s" style="background:#f5f7fb;color:#374151;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;border:1px solid #e5e7eb;">
                    Change Password
                  </a>
                </div>
                """.formatted(toName, adminName, roleLabel, toEmail, password, loginUrl, changeUrl);
        send(toEmail, toName, subject, wrap(body, "Welcome to ResolveHub"));
    }

    // ── 4. Organization Approval ────────────────────────────────────────────────

    @Async
    public void sendOrgApproval(String toEmail, String adminName,
                                String orgName, String orgSlug,
                                String tempPassword, String apiKey) {
        String loginUrl  = appProperties.getBaseUrl() + "/login";
        String portalUrl = appProperties.getBaseUrl() + "/org/" + orgSlug;
        String subject   = "Welcome to ResolveHub – Your Organization is Approved";
        String body = """
                <p>Hi %s,</p>
                <p>&#127881; Your organization <strong>%s</strong> has been approved on ResolveHub.</p>
                <div style="background:#f5f7fb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#6b7280;">Login Credentials</p>
                  <table style="border-collapse:collapse;width:100%%;">
                    <tr><td style="padding:6px 0;font-weight:bold;color:#374151;width:160px;">Email</td>
                        <td style="padding:6px 0;font-family:monospace;">%s</td></tr>
                    <tr><td style="padding:6px 0;font-weight:bold;color:#374151;">Temporary Password</td>
                        <td style="padding:6px 0;font-family:monospace;color:#4f46e5;font-weight:bold;">%s</td></tr>
                  </table>
                </div>
                <div style="background:#f5f7fb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#6b7280;">Organization Details</p>
                  <table style="border-collapse:collapse;width:100%%;">
                    <tr><td style="padding:6px 0;font-weight:bold;color:#374151;width:160px;">Organization</td>
                        <td style="padding:6px 0;">%s</td></tr>
                    <tr><td style="padding:6px 0;font-weight:bold;color:#374151;">Public Portal</td>
                        <td style="padding:6px 0;"><a href="%s" style="color:#4f46e5;">%s</a></td></tr>
                    <tr><td style="padding:6px 0;font-weight:bold;color:#374151;">API Key</td>
                        <td style="padding:6px 0;font-family:monospace;font-size:12px;color:#6b7280;">%s</td></tr>
                  </table>
                </div>
                <p style="color:#ef4444;font-size:13px;font-weight:bold;">&#9888; Please change your password immediately after first login.</p>
                <p style="margin:24px 0;">
                  <a href="%s" style="background:linear-gradient(135deg,#3525cd,#4f46e5);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    Login to Dashboard
                  </a>
                </p>
                """.formatted(adminName, orgName,
                              toEmail, tempPassword,
                              orgName, portalUrl, portalUrl,
                              apiKey, loginUrl);
        send(toEmail, adminName, subject, wrap(body, "Organization Approved"));
    }

    // ── 5. Organization Rejection ───────────────────────────────────────────────

    @Async
    public void sendOrgRejection(String toEmail, String adminName,
                                  String orgName, String reason) {
        String applyUrl = appProperties.getBaseUrl() + "/register";
        String subject  = "ResolveHub – Application Update for " + orgName;
        String reasonBlock = (reason != null && !reason.isBlank())
                ? "<div style=\"background:#fff1f2;border:1px solid #fecdd3;border-radius:8px;padding:14px 16px;margin:16px 0;\">"
                  + "<p style=\"margin:0 0 4px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#9f1239;\">Reason</p>"
                  + "<p style=\"margin:0;color:#374151;font-size:14px;\">" + reason + "</p>"
                  + "</div>"
                : "";
        String body = """
                <p>Hi %s,</p>
                <p>After reviewing your application for <strong>%s</strong>, we are unable to approve it at this time.</p>
                %s
                <p style="margin:24px 0;">
                  <a href="%s" style="background:linear-gradient(135deg,#3525cd,#4f46e5);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    Submit New Application
                  </a>
                </p>
                """.formatted(adminName, orgName, reasonBlock, applyUrl);
        send(toEmail, adminName, subject, wrap(body, "Application Status"));
    }

    // ── Core send via Brevo API ──────────────────────────────────────────────────

    private void send(String toEmail, String toName, String subject, String htmlBody) {
        if (mailProperties.getFrom() == null || mailProperties.getFrom().isBlank()) {
            log.warn("Email not sent — mail.from is not configured. Subject: {}", subject);
            return;
        }
        try {
            SendSmtpEmail email = new SendSmtpEmail();

            SendSmtpEmailSender sender = new SendSmtpEmailSender();
            sender.setEmail(mailProperties.getFrom());
            sender.setName(mailProperties.getFromName());
            email.setSender(sender);

            SendSmtpEmailTo recipient = new SendSmtpEmailTo();
            recipient.setEmail(toEmail);
            recipient.setName(toName != null ? toName : toEmail);
            email.setTo(List.of(recipient));

            email.setSubject(subject);
            email.setHtmlContent(htmlBody);

            CreateSmtpEmail result = brevoApi.sendTransacEmail(email);
            log.info("Email sent via Brevo API to {} — {} (messageId: {})", toEmail, subject, result.getMessageId());
        } catch (Exception e) {
            log.error("Failed to send email via Brevo API to {} — {}: {}", toEmail, subject, e.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private String formatStatus(String status) {
        if (status == null) return "";
        return switch (status.toUpperCase()) {
            case "OPEN"         -> "Open";
            case "UNDER_REVIEW" -> "Under Review";
            case "ASSIGNED"     -> "Assigned to Staff";
            case "IN_PROGRESS"  -> "In Progress";
            case "RESOLVED"     -> "Resolved";
            case "CLOSED"       -> "Closed";
            default             -> status.replace("_", " ");
        };
    }

    private String wrap(String content, String preheader) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width,initial-scale=1">
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#f5f7fb;font-family:'Inter',Arial,sans-serif;color:#0f1117;">
                  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,17,23,0.08);">
                    <div style="background:linear-gradient(135deg,#3525cd,#4f46e5);padding:24px 32px;">
                      <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">ResolveHub</span>
                    </div>
                    <div style="padding:32px;line-height:1.6;font-size:15px;">
                      %s
                    </div>
                    <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#9ca3af;">
                        This email was sent by ResolveHub · Smart Complaint Management
                      </p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(preheader, content);
    }
}
