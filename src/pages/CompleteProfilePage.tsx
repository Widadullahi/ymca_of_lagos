import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';
import { nigerianStates } from '../constants/utils';

const unitOptions = [
  'Council of Church',
  'Youth Council',
  "Y's Men",
  'Central Club',
];

const adultUnitOptions = ['Council of Church', "Y's Men", 'Central Club'];
const validIdOptions = [
  { value: 'national_id', label: 'National Identity Number (NIN)' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'international_passport', label: 'International Passport' },
  { value: 'bvn', label: 'BVN' },
];

const getYouthCouncilGroupByAge = (age: number) => {
  if (age >= 1 && age <= 23) return 'Hi-Y Club';
  if (age >= 24 && age <= 30) return 'Y-Elite Club';
  return '';
};

const CompleteProfilePage: React.FC = () => {
  const { user, fetchWithAuth, fetchUserProfile, displayNotification } = useAuth();
  const navigate = useNavigate();

  const [churches, setChurches] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    phone_number: '',
    gender: '',
    date_of_birth: '',
    age: '',
    place_of_birth: '',
    marital_status: '',
    citizen: 'Nigerian',
    country: 'NG',
    state: '',
    lga: '',
    address: '',
    unit: '',
    club: '',
    profession: '',
    occupation: '',
    religion: '',
    church_name: '',
    valid_id_type: '',
    valid_id_number: '',
    next_of_kin: '',
    next_of_kin_phone: '',
    referred_by: 'no',
    referral_source: '',
    referral_name: '',
  });
  const [files, setFiles] = useState<{
    passport_photo: File | null;
    valid_id_file: File | null;
    signature: File | null;
  }>({
    passport_photo: null,
    valid_id_file: null,
    signature: null,
  });

  const userRequest = user?.user_request;
  const currentPassport = userRequest?.passport_photo || '';
  const currentValidIdFile = userRequest?.valid_id_file || userRequest?.validIdFile || '';
  const currentSignature = userRequest?.signature || user?.card?.signature || '';
  const needsPassportUpload = !currentPassport || currentPassport.includes('bulk-upload-passport-');
  const needsValidIdUpload = !currentValidIdFile;
  const needsSignatureUpload = !currentSignature;

  useEffect(() => {
    if (!user) return;

    if (user.role === 'Admin') {
      navigate('/admin/dashboard');
      return;
    }

    if (!user.profile_completion_required) {
      navigate('/dashboard');
      return;
    }

    setFormData({
      phone_number: userRequest?.phone_number || '',
      gender: userRequest?.gender || '',
      date_of_birth: userRequest?.date_of_birth || '',
      age: userRequest?.age || '',
      place_of_birth: userRequest?.place_of_birth || '',
      marital_status: userRequest?.marital_status || '',
      citizen: userRequest?.citizen || 'Nigerian',
      country: userRequest?.country || 'NG',
      state: userRequest?.state || '',
      lga: userRequest?.lga || '',
      address: userRequest?.address || '',
      unit: userRequest?.unit || '',
      club: userRequest?.club || '',
      profession: userRequest?.profession || '',
      occupation: userRequest?.occupation || '',
      religion: userRequest?.religion || '',
      church_name: userRequest?.church_name || '',
      valid_id_type: userRequest?.valid_id_type || '',
      valid_id_number: userRequest?.valid_id_number || '',
      next_of_kin: userRequest?.next_of_kin || '',
      next_of_kin_phone: userRequest?.next_of_kin_phone || '',
      referred_by: userRequest?.referred_by || 'no',
      referral_source: userRequest?.referral_source || '',
      referral_name: userRequest?.referral_name || '',
    });
  }, [navigate, user, userRequest]);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const churchResponse = await fetchWithAuth({ method: 'GET', path: '/churches', isAthenticated: false });

        setChurches((churchResponse?.data || []).map((item: any) => item.name));
      } catch (error) {
        displayNotification('error', 'Unable to load unit dropdown options');
      }
    };

    loadLists();
  }, [displayNotification, fetchWithAuth]);

  useEffect(() => {
    if (!formData.date_of_birth) return;

    const today = new Date();
    const birthDate = new Date(formData.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    setFormData((prev) => ({
      ...prev,
      age: age > 0 ? String(age) : '',
    }));
  }, [formData.date_of_birth]);

  const filteredUnits = useMemo(() => {
    const age = Number(formData.age);
    if (!age) return unitOptions;
    if (age <= 30) return ['Youth Council'];
    return adultUnitOptions;
  }, [formData.age]);

  useEffect(() => {
    if (formData.unit && !filteredUnits.includes(formData.unit)) {
      setFormData((prev) => ({
        ...prev,
        unit: '',
        club: '',
      }));
    }
  }, [filteredUnits, formData.unit]);

  useEffect(() => {
    const age = Number(formData.age);
    if (formData.unit === 'Youth Council') {
      const derivedGroup = getYouthCouncilGroupByAge(age);
      setFormData((prev) => ({
        ...prev,
        club: derivedGroup,
      }));
      return;
    }

    if (formData.unit !== 'Council of Church' && formData.club && (formData.unit === "Y's Men" || formData.unit === 'Central Club' || !formData.unit)) {
      setFormData((prev) => ({
        ...prev,
        club: '',
      }));
    }
  }, [formData.age, formData.unit]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (name === 'unit') {
      setFormData((prev) => ({
        ...prev,
        unit: value,
        club: '',
      }));
    }

    if (name === 'citizen' && value === 'Nigerian') {
      setFormData((prev) => ({
        ...prev,
        country: 'NG',
      }));
    }

    if (name === 'citizen' && value === 'Foreigner') {
      setFormData((prev) => ({
        ...prev,
        country: prev.country === 'NG' ? '' : prev.country,
        state: '',
        lga: '',
      }));
    }

    if (name === 'religion' && value !== 'Christian') {
      setFormData((prev) => ({
        ...prev,
        church_name: '',
      }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = event.target;
    const selectedFile = selectedFiles?.[0] || null;

    setFiles((prev) => ({
      ...prev,
      [name]: selectedFile,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.phone_number.trim()) errors.phone_number = 'Phone number is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    if (!formData.place_of_birth.trim()) errors.place_of_birth = 'Place of birth is required';
    if (!formData.marital_status) errors.marital_status = 'Marital status is required';
    if (!formData.citizen) errors.citizen = 'Citizenship is required';
    if (formData.citizen === 'Foreigner' && !formData.country.trim()) errors.country = 'Country is required';
    if (!formData.state.trim()) errors.state = formData.citizen === 'Foreigner' ? 'State/Province is required' : 'State is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    const age = Number(formData.age);

    if (!formData.unit) errors.unit = 'Unit is required';
    if (formData.unit === 'Youth Council' && age >= 31) {
      errors.unit = "Age 31+ cannot join Youth Council. Please select Y's Men, Central Club, or Council of Church.";
    }
    if (formData.unit !== 'Youth Council' && age > 0 && age <= 30) {
      errors.unit = 'Members aged 30 and below must register under Youth Council.';
    }
    if (formData.unit === 'Council of Church' && !formData.club) errors.club = 'Please select a church';
    if (formData.unit === 'Youth Council' && !getYouthCouncilGroupByAge(age)) errors.club = 'Youth Council is only available for ages 1-30';
    if (!formData.profession.trim()) errors.profession = 'Profession is required';
    if (!formData.occupation.trim()) errors.occupation = 'Occupation is required';
    if (!formData.religion) errors.religion = 'Religion is required';
    if (formData.religion === 'Christian' && !formData.church_name.trim()) errors.church_name = 'Church name is required';
    if (!formData.valid_id_type) errors.valid_id_type = 'Valid ID type is required';
    if (!formData.valid_id_number.trim()) errors.valid_id_number = 'Valid ID number is required';
    if (!formData.next_of_kin.trim()) errors.next_of_kin = 'Next of kin is required';
    if (!formData.next_of_kin_phone.trim()) errors.next_of_kin_phone = 'Next of kin phone is required';
    if (needsPassportUpload && !files.passport_photo) errors.passport_photo = 'Passport photo is required';
    if (needsValidIdUpload && !files.valid_id_file) errors.valid_id_file = 'Valid ID document is required';
    if (needsSignatureUpload && !files.signature) errors.signature = 'Signature is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value || '');
      });

      if (files.passport_photo) payload.append('passport_photo', files.passport_photo);
      if (files.valid_id_file) payload.append('valid_id_file', files.valid_id_file);
      if (files.signature) payload.append('signature', files.signature);

      await fetchWithAuth({
        method: 'PUT',
        path: '/requests/me/complete/',
        body: payload,
        isFormData: true,
      });

      await fetchUserProfile();
      displayNotification('success', 'Profile completed successfully');
      navigate('/dashboard');
    } catch (error) {
      displayNotification('error', error instanceof Error ? error.message : 'Unable to complete profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Complete Your Membership Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account was created from a bulk upload. Before you can continue, complete the remaining registration details below.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md bg-gray-50 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={`${userRequest?.first_name || user?.first_name || ''} ${userRequest?.last_name || user?.last_name || ''}`.trim()}
              disabled
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={userRequest?.email || user?.email || ''}
              disabled
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
            />
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} error={fieldErrors.phone_number} />
            <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} error={fieldErrors.gender} options={['Male', 'Female', 'Other']} />
            <Field label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} error={fieldErrors.date_of_birth} />
            <Field label="Age" name="age" value={formData.age} onChange={handleInputChange} disabled />
            <Field label="Place of Birth" name="place_of_birth" value={formData.place_of_birth} onChange={handleInputChange} error={fieldErrors.place_of_birth} />
            <SelectField label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleInputChange} error={fieldErrors.marital_status} options={['Single', 'Married', 'Divorced', 'Widowed']} />
            <SelectField label="Citizenship" name="citizen" value={formData.citizen} onChange={handleInputChange} error={fieldErrors.citizen} options={['Nigerian', 'Foreigner']} />
            {formData.citizen === 'Foreigner' ? (
              <Field label="Country" name="country" value={formData.country} onChange={handleInputChange} error={fieldErrors.country} />
            ) : (
              <SelectField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                error={fieldErrors.state}
                options={nigerianStates.map((item) => item.value)}
              />
            )}
            {formData.citizen === 'Foreigner' ? (
              <Field label="State/Province" name="state" value={formData.state} onChange={handleInputChange} error={fieldErrors.state} />
            ) : (
              <Field label="LGA" name="lga" value={formData.lga} onChange={handleInputChange} />
            )}
          </div>

          <TextAreaField label="Address" name="address" value={formData.address} onChange={handleInputChange} error={fieldErrors.address} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Unit" name="unit" value={formData.unit} onChange={handleInputChange} error={fieldErrors.unit} options={filteredUnits} />
            {formData.unit === 'Council of Church' && (
              <SelectField label="Council of Church" name="club" value={formData.club} onChange={handleInputChange} error={fieldErrors.club} options={churches} />
            )}
            {formData.unit === 'Youth Council' && (
              <Field label="Youth Council Club" name="club" value={formData.club} disabled error={fieldErrors.club} />
            )}
            <Field label="Profession" name="profession" value={formData.profession} onChange={handleInputChange} error={fieldErrors.profession} />
            <Field label="Occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} error={fieldErrors.occupation} />
            <SelectField label="Religion" name="religion" value={formData.religion} onChange={handleInputChange} error={fieldErrors.religion} options={['Christian', 'Other']} />
            {formData.religion === 'Christian' && (
              <Field label="Church Name" name="church_name" value={formData.church_name} onChange={handleInputChange} error={fieldErrors.church_name} />
            )}
          </div>

          <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold">Age Guidance</p>
            <p className="mt-1">Ages 1-23: Youth Council with Hi-Y Club.</p>
            <p className="mt-1">Ages 24-30: Youth Council with Y-Elite Club.</p>
            <p className="mt-1">Age 31 and above: Council of Church, Y's Men, or Central Club.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Valid ID Type"
              name="valid_id_type"
              value={formData.valid_id_type}
              onChange={handleInputChange}
              error={fieldErrors.valid_id_type}
              options={validIdOptions.map((item) => item.value)}
              optionLabels={Object.fromEntries(validIdOptions.map((item) => [item.value, item.label]))}
            />
            <Field label="Valid ID Number" name="valid_id_number" value={formData.valid_id_number} onChange={handleInputChange} error={fieldErrors.valid_id_number} />
            <Field label="Next of Kin" name="next_of_kin" value={formData.next_of_kin} onChange={handleInputChange} error={fieldErrors.next_of_kin} />
            <Field label="Next of Kin Phone" name="next_of_kin_phone" value={formData.next_of_kin_phone} onChange={handleInputChange} error={fieldErrors.next_of_kin_phone} />
            <SelectField label="Were You Referred?" name="referred_by" value={formData.referred_by} onChange={handleInputChange} options={['yes', 'no']} />
            {formData.referred_by === 'yes' && (
              <>
                <Field label="Referral Source" name="referral_source" value={formData.referral_source} onChange={handleInputChange} />
                <Field label="Referral Name" name="referral_name" value={formData.referral_name} onChange={handleInputChange} />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileField label="Passport Photo" name="passport_photo" onChange={handleFileChange} error={fieldErrors.passport_photo} helperText={needsPassportUpload ? 'Required on first login.' : 'Optional if you want to replace the current photo.'} />
            <FileField label="Valid ID Document" name="valid_id_file" onChange={handleFileChange} error={fieldErrors.valid_id_file} helperText={needsValidIdUpload ? 'Required on first login.' : 'Optional if already uploaded.'} />
            <FileField label="Signature" name="signature" onChange={handleFileChange} error={fieldErrors.signature} helperText={needsSignatureUpload ? 'Required on first login.' : 'Optional if already uploaded.'} />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save And Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

type FieldProps = {
  label: string;
  name: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  error?: string;
  type?: string;
  disabled?: boolean;
};

const Field: React.FC<FieldProps> = ({ label, name, value = '', onChange, error, type = 'text', disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
      disabled={disabled}
      className={`mt-1 w-full rounded-md border px-3 py-2 ${disabled ? 'bg-gray-100' : 'bg-white'} ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const TextAreaField: React.FC<FieldProps> = ({ label, name, value = '', onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
      rows={4}
      className={`mt-1 w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

type SelectFieldProps = FieldProps & {
  options: string[];
  optionLabels?: Record<string, string>;
};

const SelectField: React.FC<SelectFieldProps> = ({ label, name, value = '', onChange, error, options, optionLabels = {} }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
      className={`mt-1 w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {optionLabels[option] || option}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const FileField: React.FC<{
  label: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  helperText: string;
}> = ({ label, name, onChange, error, helperText }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="file"
      name={name}
      accept="image/*"
      onChange={onChange}
      className={`mt-1 w-full rounded-md border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    <p className="mt-1 text-xs text-gray-500">{helperText}</p>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default CompleteProfilePage;
