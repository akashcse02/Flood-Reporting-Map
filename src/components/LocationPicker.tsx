import { divisions, getAreas, getCities } from "@/data/locations";
import { SearchSelect } from "@/components/SearchSelect";

export type LocationValue = { division: string; city: string; area: string };

type Props = {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
};

export function LocationPicker({ value, onChange }: Props) {
  const cities = getCities(value.division).map((c) => c.name);
  const areas = getAreas(value.division, value.city);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SearchSelect
        placeholder="Division"
        options={divisions.map((d) => d.name)}
        value={value.division}
        onChange={(division) => onChange({ division, city: "", area: "" })}
      />
      <SearchSelect
        placeholder="City / District"
        options={cities}
        value={value.city}
        disabled={!value.division}
        onChange={(city) => onChange({ ...value, city, area: "" })}
      />
      <SearchSelect
        placeholder="Area"
        options={areas}
        value={value.area}
        disabled={!value.city}
        onChange={(area) => onChange({ ...value, area })}
      />
    </div>
  );
}
