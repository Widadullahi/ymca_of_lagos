//@ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/NewAuthContext";
import { nigerianStates } from "../../../constants/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const validIdOptions = [
  { value: 'national_id', label: 'National Identity Number (NIN)' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'international_passport', label: 'International Passport' },
  { value: 'bvn', label: 'BVN' },
];

const unitOptions = [
  { value: 'Council of Church', label: 'Council of Church' },
  { value: 'Youth Council', label: 'Youth Council' },
  { value: "Y's Men", label: "Y's Men" },
  { value: 'Central Club', label: 'Central Club' },
];

const getYouthCouncilGroupByAge = (age: number) => {
  if (age >= 1 && age <= 23) return 'Hi-Y Club';
  if (age >= 24 && age <= 30) return 'Y-Elite Club';
  return '';
};

const AddUserModal: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  churches: any;
  youthGroups: any;
  onAddMember: () => void;
}> = ({ isOpen, closeModal, onAddMember, churches }) => {
  const { fetchWithAuth, displayNotification } = useAuth();

  const initialFormData = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    gender: '',
    date_of_birth: '',
    age: '',
    marital_status: '',
    citizen: 'Nigerian',
    country: 'NG',
    state: '',
    lga: '',
    address: '',
    unit: '',
    club: '',
    church_name: '',
    profession: '',
    occupation: '',
    religion: '',
    valid_id_type: '',
    next_of_kin: '',
    next_of_kin_phone: '',
    referred_by: 'no',
    referral_name: '',
    referral_source: '',
    card_expiry_date: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState<{
    passport_photo: File | null;
    valid_id_file: File | null;
    signature: File | null;
  }>({
    passport_photo: null,
    valid_id_file: null,
    signature: null,
  });
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!formData.date_of_birth) return;
    const today = new Date();
    const birthDate = new Date(formData.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    setFormData(prev => ({
      ...prev,
      age: age > 0 ? String(age) : '',
    }));
  }, [formData.date_of_birth]);

  const filteredUnits = useMemo(() => {
    const age = Number(formData.age);
    if (!age) return unitOptions;
    if (age <= 30) return unitOptions.filter(unit => unit.value === 'Youth Council');
    return unitOptions.filter(unit => unit.value !== 'Youth Council');
  }, [formData.age]);

  useEffect(() => {
    if (formData.unit && !filteredUnits.some(unit => unit.value === formData.unit)) {
      setFormData(prev => ({
        ...prev,
        unit: '',
        club: '',
      }));
    }
  }, [filteredUnits, formData.unit]);

  useEffect(() => {
    const age = Number(formData.age);
    if (formData.unit === 'Youth Council') {
      setFormData(prev => ({
        ...prev,
        club: getYouthCouncilGroupByAge(age),
      }));
      return;
    }

    if (formData.unit !== 'Council of Church' && formData.club) {
      setFormData(prev => ({
        ...prev,
        club: '',
      }));
    }
  }, [formData.age, formData.unit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const next = { ...prev, [name]: value };

      if (name === 'unit') {
        next.club = '';
      }

      if (name === 'citizen' && value === 'Nigerian') {
        next.country = 'NG';
      }

      if (name === 'citizen' && value === 'Foreigner') {
        next.state = '';
        next.lga = '';
        if (next.country === 'NG') {
          next.country = '';
        }
      }

      if (name === 'religion' && value !== 'Christian') {
        next.church_name = '';
      }

      if (name === 'referred_by' && value !== 'yes') {
        next.referral_name = '';
        next.referral_source = '';
      }

      return next;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'passport_photo' | 'valid_id_file' | 'signature') => {
    const file = e.target.files?.[0];
    if (!file) {
      setFiles(prev => ({ ...prev, [field]: null }));
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, [field]: 'Only JPEG, JPG, or PNG files are allowed' }));
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, [field]: 'File size must be less than 10MB' }));
      e.target.value = '';
      return;
    }

    setFiles(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    const reader = new FileReader();
    reader.onload = event => {
      setPreviews(prev => ({ ...prev, [field]: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const age = Number(formData.age);

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.marital_status) newErrors.marital_status = 'Marital status is required';
    if (!formData.citizen) newErrors.citizen = 'Citizenship is required';
    if (formData.citizen === 'Foreigner' && !formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.state.trim()) newErrors.state = formData.citizen === 'Foreigner' ? 'State/Province is required' : 'State is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (formData.unit === 'Youth Council' && age >= 31) newErrors.unit = "Age 31+ cannot join Youth Council";
    if (formData.unit !== 'Youth Council' && age > 0 && age <= 30) newErrors.unit = 'Members aged 30 and below must register under Youth Council';
    if (formData.unit === 'Council of Church' && !formData.club) newErrors.club = 'Church selection is required';
    if (formData.unit === 'Youth Council' && !getYouthCouncilGroupByAge(age)) newErrors.club = 'Youth Council is only available for ages 1-30';
    if (!formData.profession.trim()) newErrors.profession = 'Profession is required';
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    if (!formData.religion) newErrors.religion = 'Religion is required';
    if (formData.religion === 'Christian' && !formData.church_name.trim()) newErrors.church_name = 'Church name is required';
    if (!formData.valid_id_type) newErrors.valid_id_type = 'Valid ID type is required';
    if (!formData.next_of_kin.trim()) newErrors.next_of_kin = 'Next of kin is required';
    if (!formData.next_of_kin_phone.trim()) newErrors.next_of_kin_phone = 'Next of kin phone is required';
    if (!files.valid_id_file) newErrors.valid_id_file = 'Valid ID document is required';
    if (!files.passport_photo) newErrors.passport_photo = 'Passport photo is required';
    if (formData.referred_by === 'yes' && !formData.referral_name.trim()) newErrors.referral_name = 'Referral name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFiles({
      passport_photo: null,
      valid_id_file: null,
      signature: null,
    });
    setPreviews({});
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value || '');
      });

      if (files.passport_photo) payload.append('passport_photo', files.passport_photo);
      if (files.valid_id_file) payload.append('valid_id_file', files.valid_id_file);
      if (files.signature) payload.append('signature', files.signature);

      const response = await fetchWithAuth({
        method: 'POST',
        path: '/admin/members/',
        body: payload,
        isFormData: true,
      });

      displayNotification('success', response?.message || 'Member created successfully');
      onAddMember();
      resetForm();
      closeModal();
    } catch (error: any) {
      displayNotification('error', error?.message || 'Unable to create member');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Member</h2>
            <p className="mt-1 text-sm text-gray-600">This now follows the registration form fields much more closely.</p>
          </div>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <SectionTitle title="Personal Information" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} />
            <InputField label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} error={errors.last_name} />
            <InputField label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
            <InputField label="Phone Number *" name="phone_number" value={formData.phone_number} onChange={handleChange} error={errors.phone_number} />
            <SelectField label="Gender *" name="gender" value={formData.gender} onChange={handleChange} error={errors.gender} options={['Male', 'Female']} />
            <InputField label="Date of Birth *" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} error={errors.date_of_birth} />
            <InputField label="Age" name="age" value={formData.age} onChange={handleChange} disabled />
            <SelectField label="Marital Status *" name="marital_status" value={formData.marital_status} onChange={handleChange} error={errors.marital_status} options={['Single', 'Married', 'Divorced', 'Widowed']} />
            <SelectField label="Citizenship *" name="citizen" value={formData.citizen} onChange={handleChange} error={errors.citizen} options={['Nigerian', 'Foreigner']} />
            {formData.citizen === 'Foreigner' ? (
              <InputField label="Country *" name="country" value={formData.country} onChange={handleChange} error={errors.country} />
            ) : (
              <SelectField label="State *" name="state" value={formData.state} onChange={handleChange} error={errors.state} options={nigerianStates.map(item => item.value)} />
            )}
            {formData.citizen === 'Foreigner' ? (
              <InputField label="State/Province *" name="state" value={formData.state} onChange={handleChange} error={errors.state} />
            ) : (
              <InputField label="LGA" name="lga" value={formData.lga} onChange={handleChange} error={errors.lga} />
            )}
            <SelectField label="Religion *" name="religion" value={formData.religion} onChange={handleChange} error={errors.religion} options={['Christian', 'Other']} />
            {formData.religion === 'Christian' && (
              <InputField label="Church Name *" name="church_name" value={formData.church_name} onChange={handleChange} error={errors.church_name} />
            )}
            <InputField label="Profession *" name="profession" value={formData.profession} onChange={handleChange} error={errors.profession} />
            <InputField label="Occupation *" name="occupation" value={formData.occupation} onChange={handleChange} error={errors.occupation} />
          </div>

          <div className="mt-4">
            <TextAreaField label="Address *" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
          </div>

          <SectionTitle title="YMCA Unit Selection" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              label="Unit *"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              error={errors.unit}
              options={filteredUnits.map(option => option.value)}
            />

            {formData.unit === 'Council of Church' && (
              <SelectField
                label="Council of Church *"
                name="club"
                value={formData.club}
                onChange={handleChange}
                error={errors.club}
                options={churches.map((item: any) => item.label)}
              />
            )}

            {formData.unit === 'Youth Council' && (
              <InputField
                label="Youth Council Group"
                name="club"
                value={formData.club}
                onChange={handleChange}
                error={errors.club}
                disabled
              />
            )}
          </div>

          <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-semibold">Age Guidance</p>
            <p className="mt-1">Ages 1-23: Youth Council with Hi-Y Club.</p>
            <p className="mt-1">Ages 24-30: Youth Council with Y-Elite Club.</p>
            <p className="mt-1">Age 31 and above: Council of Church, Y's Men, or Central Club.</p>
          </div>

          <SectionTitle title="Next of Kin & Referral" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField label="Next of Kin Name *" name="next_of_kin" value={formData.next_of_kin} onChange={handleChange} error={errors.next_of_kin} />
            <InputField label="Next of Kin Phone *" name="next_of_kin_phone" value={formData.next_of_kin_phone} onChange={handleChange} error={errors.next_of_kin_phone} />
            <SelectField label="Were You Referred?" name="referred_by" value={formData.referred_by} onChange={handleChange} error={errors.referred_by} options={['yes', 'no']} />
            {formData.referred_by === 'yes' && (
              <>
                <InputField label="Referral Name *" name="referral_name" value={formData.referral_name} onChange={handleChange} error={errors.referral_name} />
                <InputField label="Referral Source" name="referral_source" value={formData.referral_source} onChange={handleChange} error={errors.referral_source} />
              </>
            )}
          </div>

          <SectionTitle title="Identification" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              label="Valid ID Type *"
              name="valid_id_type"
              value={formData.valid_id_type}
              onChange={handleChange}
              error={errors.valid_id_type}
              options={validIdOptions.map(option => option.value)}
              optionLabels={Object.fromEntries(validIdOptions.map(option => [option.value, option.label]))}
            />
            <InputField
              label="Card Expiry Date (Optional)"
              name="card_expiry_date"
              type="date"
              value={formData.card_expiry_date}
              onChange={handleChange}
              error={errors.card_expiry_date}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <FileField
              label="Valid ID Document *"
              field="valid_id_file"
              preview={previews.valid_id_file}
              error={errors.valid_id_file}
              onChange={handleFileChange}
            />
            <FileField
              label="Passport Photo *"
              field="passport_photo"
              preview={previews.passport_photo}
              error={errors.passport_photo}
              onChange={handleFileChange}
            />
            <FileField
              label="Signature"
              field="signature"
              preview={previews.signature}
              error={errors.signature}
              onChange={handleFileChange}
            />
          </div>

          <div className="mt-8 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Default password for this member will be <span className="font-semibold">member12345</span>.
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="mt-8 mb-4 border-b pb-2">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
);

const InputField = ({ label, name, value, onChange, error, type = 'text', disabled = false }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full rounded-md border px-3 py-2 ${disabled ? 'bg-gray-100' : 'bg-white'} ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const TextAreaField = ({ label, name, value, onChange, error }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, error, options, optionLabels = {} }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
    >
      <option value="">Select {label.replace('*', '').trim()}</option>
      {options.map(option => (
        <option key={option} value={option}>
          {optionLabels[option] || option}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const FileField = ({ label, field, preview, error, onChange }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="file"
      accept="image/jpeg,image/jpg,image/png"
      onChange={(e) => onChange(e, field)}
      className={`w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    <p className="mt-1 text-xs text-gray-500">JPEG, JPG, or PNG up to 10MB</p>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    {preview && <img src={preview} alt={`${field} preview`} className="mt-2 h-20 w-20 rounded object-cover" />}
  </div>
);

export default AddUserModal;
