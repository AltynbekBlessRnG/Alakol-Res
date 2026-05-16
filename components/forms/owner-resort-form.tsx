import { submitResortForReviewAction, updateResortAction } from "@/lib/actions";
import { getResortCompleteness } from "@/lib/supabase/data";
import type { Resort, ResortAmenity, ResortImage, ResortPrice } from "@/lib/types";
import { OwnerResortEditor } from "@/components/forms/owner-resort-editor";

type OwnerResortFormProps = {
  resort: Resort & { amenities: ResortAmenity[]; prices: ResortPrice[]; images: ResortImage[] };
  error?: string;
};

export function OwnerResortForm({ resort, error }: OwnerResortFormProps) {
  return (
    <OwnerResortEditor
      resort={resort}
      completeness={getResortCompleteness(resort)}
      error={error}
      updateAction={updateResortAction}
      submitAction={submitResortForReviewAction}
    />
  );
}
