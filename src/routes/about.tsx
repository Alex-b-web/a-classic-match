import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";

export const Route = createFileRoute("/about")({
  head: () => meta("About", "The story behind A Classic Match, the quiz that finds your next classic book."),
  component: () => (
    <InfoPage title="About">
      <p>
        A Classic Match helps readers find the classic books that suit them — through a short quiz,
        a searchable library, reading plans and a daily reading record.
      </p>
      <p className="italic text-muted-foreground">More about us is coming soon.</p>
    </InfoPage>
  ),
});
