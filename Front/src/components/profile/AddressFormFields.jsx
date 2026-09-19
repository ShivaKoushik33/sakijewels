import { useId } from 'react';

const fieldClass =
  'w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm text-[#141416] bg-white';
const labelClass = 'text-sm font-medium text-[#141416]';

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Suggestions({ id, values }) {
  return (
    <datalist id={id}>
      {values.map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
}

/**
 * The address fields shared by the add and edit pages, in the order the shop
 * asked for. Village, city, district and state are filled in from the
 * pincode and every one of them stays editable, with the pincode's other
 * options offered as suggestions.
 */
export default function AddressFormFields({
  fields,
  formData,
  onChange,
  suggestions,
  loadingPin,
  pinMsg,
}) {
  // Both pages can be mounted with the same markup, so the datalists need
  // ids of their own.
  const listId = useId();
  const localityList = `${listId}-localities`;
  const cityList = `${listId}-cities`;
  const districtList = `${listId}-districts`;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <Field label={fields.nameLabel}>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={onChange}
            className={fieldClass}
            placeholder={fields.namePlaceholder}
          />
        </Field>

        <Field label={fields.phoneLabel}>
          <input
            type="tel"
            inputMode="numeric"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            maxLength={10}
            className={fieldClass}
            placeholder={fields.phonePlaceholder}
          />
        </Field>
      </div>

      <div className="sm:w-1/2 sm:pr-2 md:pr-2.5">
        <Field label={fields.pincodeLabel}>
          <input
            type="text"
            inputMode="numeric"
            name="pincode"
            value={formData.pincode}
            onChange={onChange}
            maxLength={6}
            className={fieldClass}
            placeholder={fields.pincodePlaceholder}
          />
          {loadingPin && (
            <p className="text-xs text-[#901CDB] mt-1">Filling address from pincode...</p>
          )}
          {pinMsg && <p className="text-xs text-red-500 mt-1">{pinMsg}</p>}
        </Field>
      </div>

      <Field label={fields.addressLabel}>
        <textarea
          name="house"
          value={formData.house}
          onChange={onChange}
          className="w-full min-h-[72px] px-4 py-2 border border-[#E6E8EC] rounded-lg text-sm text-[#141416] bg-white"
          placeholder={fields.addressPlaceholder}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <Field label={fields.villageLabel}>
          <input
            type="text"
            name="street"
            list={localityList}
            value={formData.street}
            onChange={onChange}
            className={fieldClass}
            placeholder={fields.villagePlaceholder}
          />
          <Suggestions id={localityList} values={suggestions.localities} />
        </Field>

        <Field label={fields.cityLabel}>
          <input
            type="text"
            name="city"
            list={cityList}
            value={formData.city}
            onChange={onChange}
            className={fieldClass}
            placeholder={fields.cityPlaceholder}
          />
          <Suggestions id={cityList} values={suggestions.cities} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <Field label={fields.districtLabel}>
          <input
            type="text"
            name="district"
            list={districtList}
            value={formData.district}
            onChange={onChange}
            className={fieldClass}
            placeholder={fields.districtPlaceholder}
          />
          <Suggestions id={districtList} values={suggestions.districts} />
        </Field>

        <Field label={fields.stateLabel}>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={onChange}
            className={fieldClass}
            placeholder={fields.statePlaceholder}
          />
        </Field>
      </div>

      <Field label={fields.landmarkLabel}>
        <input
          type="text"
          name="landmark"
          value={formData.landmark}
          onChange={onChange}
          className={fieldClass}
          placeholder={fields.landmarkPlaceholder}
        />
      </Field>
    </>
  );
}
