import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationFieldsProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  idPrefix?: string;
}

const compose = (address: string, city: string, state: string, postalCode: string) =>
  [address.trim(), city.trim(), state.trim(), postalCode.trim()].filter(Boolean).join(", ");

const parse = (value: string) => {
  const parts = (value || "").split(",").map((p) => p.trim());
  return {
    address: parts[0] || "",
    city: parts[1] || "",
    state: parts[2] || "",
    postalCode: parts.slice(3).join(", ") || "",
  };
};

export const LocationFields = ({ value, onChange, required, idPrefix = "location" }: LocationFieldsProps) => {
  const [parts, setParts] = useState(() => parse(value));

  useEffect(() => {
    if (compose(parts.address, parts.city, parts.state, parts.postalCode) !== (value || "").trim()) {
      setParts(parse(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const update = (field: "address" | "city" | "state" | "postalCode", fieldValue: string) => {
    const next = { ...parts, [field]: fieldValue };
    setParts(next);
    onChange(compose(next.address, next.city, next.state, next.postalCode));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`${idPrefix}-address`}>Address {required && "*"}</Label>
        <Input
          id={`${idPrefix}-address`}
          value={parts.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="Street address"
          required={required}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-city`}>City {required && "*"}</Label>
        <Input
          id={`${idPrefix}-city`}
          value={parts.city}
          onChange={(e) => update("city", e.target.value)}
          placeholder="City"
          required={required}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-state`}>State {required && "*"}</Label>
        <Input
          id={`${idPrefix}-state`}
          value={parts.state}
          onChange={(e) => update("state", e.target.value)}
          placeholder="State"
          required={required}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-postal`}>Postal Code</Label>
        <Input
          id={`${idPrefix}-postal`}
          value={parts.postalCode}
          onChange={(e) => update("postalCode", e.target.value)}
          placeholder="ZIP"
        />
      </div>
    </div>
  );
};
