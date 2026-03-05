import { PropertyForm } from "@/components/property-form";

export default function AddPropertyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PropertyForm mode="add" />
    </div>
  );
}
