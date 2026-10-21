import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";

export const Route = createFileRoute("/cookies")({
  head: () => meta("Cookie Notice", "The essential storage A Classic Match uses, under UK GDPR and PECR."),
  component: () => (
    <InfoPage title="Cookie Notice">
      <p>
        Under UK GDPR and the Privacy and Electronic Communications Regulations (PECR), we must
        tell you what we store on your device. We only use strictly necessary storage, which does
        not require consent.
      </p>
      <h2>What we store</h2>
      <ul>
        <li>Sign-in session — keeps you logged in to your account.</li>
        <li>Your saved list, quiz answers, reading plan, page log, ratings, goal and reminder settings — so the app works before you sign in.</li>
        <li>Your Amazon store choice and that you’ve seen this notice.</li>
      </ul>
      <p>We use no advertising, analytics or tracking cookies. You can clear this storage any time in your browser settings.</p>
    </InfoPage>
  ),
});
