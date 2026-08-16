import ClassicTemplate from "@/templates/classic";
import EditorialTemplate from "@/templates/editorial";
import MinimalTemplate from "@/templates/minimal";
import RomanticTemplate from "@/templates/romantic";
import TwilightTemplate from "@/templates/twilight";
import BlossomTemplate from "@/templates/blossom";
import ModernTemplate from "@/templates/modern";
import LuxuryTemplate from "@/templates/luxury";
import GardenTemplate from "@/templates/garden";

export const TEMPLATE_MAP: Record<string, React.ComponentType> = {
  classic: ClassicTemplate,
  editorial: EditorialTemplate,
  minimal: MinimalTemplate,
  romantic: RomanticTemplate,
  twilight: TwilightTemplate,
  blossom: BlossomTemplate,
  modern: ModernTemplate,
  luxury: LuxuryTemplate,
  garden: GardenTemplate,
};
