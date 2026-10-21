import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () =>
    meta("Privacy Policy", "How A Classic Match collects, uses and protects your data under UK GDPR."),
  component: () => (
    <InfoPage title="Privacy Policy">
      <p className="text-muted-foreground">Last updated: October 2026</p>
      <p>
        This policy explains how A Classic Match (“we”, “us”) handles your personal data under the
        UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. We are
        the data controller.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: your email address (and name, if you sign in with Google).</li>
        <li>Reading data: saved books, quiz answers, reading plan, pages logged, ratings, reviews and reading goal.</li>
        <li>Technical data needed to keep you signed in securely.</li>
      </ul>
      <h2>Why and on what lawful basis</h2>
      <ul>
        <li>To provide your account and sync your reading data — performance of a contract (Art. 6(1)(b)).</li>
        <li>To keep the service secure and working — legitimate interests (Art. 6(1)(f)).</li>
        <li>To send reading reminders, only if you turn them on — consent (Art. 6(1)(a)).</li>
      </ul>
      <p>We do not sell your data or use it for advertising.</p>
      <h2>Who processes it</h2>
      <p>
        Your data is stored by our hosting and database provider, which acts as our processor
        under a data processing agreement. Where data is transferred outside the UK, it is
        protected by appropriate safeguards such as the UK International Data Transfer Addendum.
      </p>
      <h2>How long we keep it</h2>
      <p>We keep your data while your account is active. When you delete your account, it is erased.</p>
      <h2>Your rights</h2>
      <p>
        You have the right to access, correct, erase, restrict or object to processing of your
        data, to data portability, and to withdraw consent at any time. You can delete your
        account and all its data yourself from the <Link to="/account" className="underline">Account</Link> page.
        You may also complain to the Information Commissioner’s Office (ico.org.uk).
      </p>
      <h2>Contact</h2>
      <p>
        For any question about your data, or to use any of your rights, email{" "}
        <a href="mailto:hello@aclassicmatch.com" className="underline">hello@aclassicmatch.com</a>.
      </p>
    </InfoPage>
  ),
});
