import { apiClient } from "@/lib/api";
import { ChallengeWorkbench } from "@/components/challenges/challenge-workbench";
import { EmptyState } from "@/components/common/empty-state";
import { Swords } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [challenge, list] = await Promise.all([
    apiClient
      .getChallenge(id)
      .then((response) => response.challenge)
      .catch(() => null),
    apiClient
      .getChallenges()
      .then((response) => response.challenges)
      .catch(() => []),
  ]);

  if (!challenge) {
    return (
      <EmptyState
        icon={<Swords className="size-12" />}
        title="Challenge not found"
        description="The selected challenge could not be loaded right now."
      />
    );
  }

  const currentIndex = list.findIndex((item) => item.id === challenge.id);
  const nextChallenge =
    currentIndex >= 0 && currentIndex < list.length - 1
      ? list[currentIndex + 1]
      : list.find((item) => item.id !== challenge.id);

  return (
    <ChallengeWorkbench
      challenge={challenge}
      nextChallengeHref={
        nextChallenge ? `/learner/challenges/${nextChallenge.id}` : undefined
      }
    />
  );
}
