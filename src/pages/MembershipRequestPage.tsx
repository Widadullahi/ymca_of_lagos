import React, { useState, useRef } from 'react';
import { useAuth } from '../context/NewAuthContext';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import { Link, useNavigate } from 'react-router-dom';
import ymca from '../assets/images/image.png'
import { nigerianStates,ymcaUnits } from '../constants/utils';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
// Mock data for dropdowns - replace with actual API calls or data source
const countries = [
  { value: 'AD', label: 'Andorra' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'AF', label: 'Afghanistan' },
  { value: 'AG', label: 'Antigua and Barbuda' },
  { value: 'AI', label: 'Anguilla' },
  { value: 'AL', label: 'Albania' },
  { value: 'AM', label: 'Armenia' },
  { value: 'AO', label: 'Angola' },
  { value: 'AQ', label: 'Antarctica' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AS', label: 'American Samoa' },
  { value: 'AT', label: 'Austria' },
  { value: 'AU', label: 'Australia' },
  { value: 'AW', label: 'Aruba' },
  { value: 'AX', label: 'Åland Islands' },
  { value: 'AZ', label: 'Azerbaijan' },
  { value: 'BA', label: 'Bosnia and Herzegovina' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'BI', label: 'Burundi' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BL', label: 'Saint Barthélemy' },
  { value: 'BM', label: 'Bermuda' },
  { value: 'BN', label: 'Brunei Darussalam' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'BQ', label: 'Bonaire, Sint Eustatius and Saba' },
  { value: 'BR', label: 'Brazil' },
  { value: 'BS', label: 'Bahamas' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'BV', label: 'Bouvet Island' },
  { value: 'BW', label: 'Botswana' },
  { value: 'BY', label: 'Belarus' },
  { value: 'BZ', label: 'Belize' },
  { value: 'CA', label: 'Canada' },
  { value: 'CC', label: 'Cocos (Keeling) Islands' },
  { value: 'CD', label: 'Congo, Democratic Republic of the' },
  { value: 'CF', label: 'Central African Republic' },
  { value: 'CG', label: 'Congo' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'CI', label: 'Côte d\'Ivoire' },
  { value: 'CK', label: 'Cook Islands' },
  { value: 'CL', label: 'Chile' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'CN', label: 'China' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'CU', label: 'Cuba' },
  { value: 'CV', label: 'Cabo Verde' },
  { value: 'CW', label: 'Curaçao' },
  { value: 'CX', label: 'Christmas Island' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czechia' },
  { value: 'DE', label: 'Germany' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'DK', label: 'Denmark' },
  { value: 'DM', label: 'Dominica' },
  { value: 'DO', label: 'Dominican Republic' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EE', label: 'Estonia' },
  { value: 'EG', label: 'Egypt' },
  { value: 'EH', label: 'Western Sahara' },
  { value: 'ER', label: 'Eritrea' },
  { value: 'ES', label: 'Spain' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'FI', label: 'Finland' },
  { value: 'FJ', label: 'Fiji' },
  { value: 'FK', label: 'Falkland Islands (Malvinas)' },
  { value: 'FM', label: 'Micronesia, Federated States of' },
  { value: 'FO', label: 'Faroe Islands' },
  { value: 'FR', label: 'France' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'GD', label: 'Grenada' },
  { value: 'GE', label: 'Georgia' },
  { value: 'GF', label: 'French Guiana' },
  { value: 'GG', label: 'Guernsey' },
  { value: 'GH', label: 'Ghana' },
  { value: 'GI', label: 'Gibraltar' },
  { value: 'GL', label: 'Greenland' },
  { value: 'GM', label: 'Gambia' },
  { value: 'GN', label: 'Guinea' },
  { value: 'GP', label: 'Guadeloupe' },
  { value: 'GQ', label: 'Equatorial Guinea' },
  { value: 'GR', label: 'Greece' },
  { value: 'GS', label: 'South Georgia and the South Sandwich Islands' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'GU', label: 'Guam' },
  { value: 'GW', label: 'Guinea-Bissau' },
  { value: 'GY', label: 'Guyana' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'HM', label: 'Heard Island and McDonald Islands' },
  { value: 'HN', label: 'Honduras' },
  { value: 'HR', label: 'Croatia' },
  { value: 'HT', label: 'Haiti' },
  { value: 'HU', label: 'Hungary' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IM', label: 'Isle of Man' },
  { value: 'IN', label: 'India' },
  { value: 'IO', label: 'British Indian Ocean Territory' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'IR', label: 'Iran, Islamic Republic of' },
  { value: 'IS', label: 'Iceland' },
  { value: 'IT', label: 'Italy' },
  { value: 'JE', label: 'Jersey' },
  { value: 'JM', label: 'Jamaica' },
  { value: 'JO', label: 'Jordan' },
  { value: 'JP', label: 'Japan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'KI', label: 'Kiribati' },
  { value: 'KM', label: 'Comoros' },
  { value: 'KN', label: 'Saint Kitts and Nevis' },
  { value: 'KP', label: 'Korea, Democratic People\'s Republic of' },
  { value: 'KR', label: 'Korea, Republic of' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'KY', label: 'Cayman Islands' },
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'LA', label: 'Lao People\'s Democratic Republic' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'LC', label: 'Saint Lucia' },
  { value: 'LI', label: 'Liechtenstein' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'LR', label: 'Liberia' },
  { value: 'LS', label: 'Lesotho' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'LV', label: 'Latvia' },
  { value: 'LY', label: 'Libya' },
  { value: 'MA', label: 'Morocco' },
  { value: 'MC', label: 'Monaco' },
  { value: 'MD', label: 'Moldova, Republic of' },
  { value: 'ME', label: 'Montenegro' },
  { value: 'MF', label: 'Saint Martin (French part)' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'MH', label: 'Marshall Islands' },
  { value: 'MK', label: 'North Macedonia' },
  { value: 'ML', label: 'Mali' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'MN', label: 'Mongolia' },
  { value: 'MO', label: 'Macao' },
  { value: 'MP', label: 'Northern Mariana Islands' },
  { value: 'MQ', label: 'Martinique' },
  { value: 'MR', label: 'Mauritania' },
  { value: 'MS', label: 'Montserrat' },
  { value: 'MT', label: 'Malta' },
  { value: 'MU', label: 'Mauritius' },
  { value: 'MV', label: 'Maldives' },
  { value: 'MW', label: 'Malawi' },
  { value: 'MX', label: 'Mexico' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MZ', label: 'Mozambique' },
  { value: 'NA', label: 'Namibia' },
  { value: 'NC', label: 'New Caledonia' },
  { value: 'NE', label: 'Niger' },
  { value: 'NF', label: 'Norfolk Island' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NO', label: 'Norway' },
  { value: 'NP', label: 'Nepal' },
  { value: 'NR', label: 'Nauru' },
  { value: 'NU', label: 'Niue' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'OM', label: 'Oman' },
  { value: 'PA', label: 'Panama' },
  { value: 'PE', label: 'Peru' },
  { value: 'PF', label: 'French Polynesia' },
  { value: 'PG', label: 'Papua New Guinea' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PL', label: 'Poland' },
  { value: 'PM', label: 'Saint Pierre and Miquelon' },
  { value: 'PN', label: 'Pitcairn' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'PS', label: 'Palestine, State of' },
  { value: 'PT', label: 'Portugal' },
  { value: 'PW', label: 'Palau' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RE', label: 'Réunion' },
  { value: 'RO', label: 'Romania' },
  { value: 'RS', label: 'Serbia' },
  { value: 'RU', label: 'Russian Federation' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SB', label: 'Solomon Islands' },
  { value: 'SC', label: 'Seychelles' },
  { value: 'SD', label: 'Sudan' },
  { value: 'SE', label: 'Sweden' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SH', label: 'Saint Helena, Ascension and Tristan da Cunha' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SJ', label: 'Svalbard and Jan Mayen' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SL', label: 'Sierra Leone' },
  { value: 'SM', label: 'San Marino' },
  { value: 'SN', label: 'Senegal' },
  { value: 'SO', label: 'Somalia' },
  { value: 'SR', label: 'Suriname' },
  { value: 'SS', label: 'South Sudan' },
  { value: 'ST', label: 'Sao Tome and Principe' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'SX', label: 'Sint Maarten (Dutch part)' },
  { value: 'SY', label: 'Syrian Arab Republic' },
  { value: 'SZ', label: 'Eswatini' },
  { value: 'TC', label: 'Turks and Caicos Islands' },
  { value: 'TD', label: 'Chad' },
  { value: 'TF', label: 'French Southern Territories' },
  { value: 'TG', label: 'Togo' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TK', label: 'Tokelau' },
  { value: 'TL', label: 'Timor-Leste' },
  { value: 'TM', label: 'Turkmenistan' },
  { value: 'TN', label: 'Tunisia' },
  { value: 'TO', label: 'Tonga' },
  { value: 'TR', label: 'Turkey' },
  { value: 'TT', label: 'Trinidad and Tobago' },
  { value: 'TV', label: 'Tuvalu' },
  { value: 'TW', label: 'Taiwan, Province of China' },
  { value: 'TZ', label: 'Tanzania, United Republic of' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'UG', label: 'Uganda' },
  { value: 'UM', label: 'United States Minor Outlying Islands' },
  { value: 'US', label: 'United States' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'VA', label: 'Holy See (Vatican City State)' },
  { value: 'VC', label: 'Saint Vincent and the Grenadines' },
  { value: 'VE', label: 'Venezuela, Bolivarian Republic of' },
  { value: 'VG', label: 'Virgin Islands, British' },
  { value: 'VI', label: 'Virgin Islands, U.S.' },
  { value: 'VN', label: 'Viet Nam' },
  { value: 'VU', label: 'Vanuatu' },
  { value: 'WF', label: 'Wallis and Futuna' },
  { value: 'WS', label: 'Samoa' },
  { value: 'YE', label: 'Yemen' },
  { value: 'YT', label: 'Mayotte' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' }
];

const units = ymcaUnits

const RequestForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    citizen: 'Nigerian',
    country: 'NG',
    state: '',
    lga: '',
    unit: '',
    club: '',
    age: '',
    gender: '',
    date_of_birth: '',
    place_of_birth: '',
    home_address: '',
    office_address: '',
    profession: '',
    religion: '',
    churchName: '',
    occupation: '',
    marital_status: '',
    validIdType: '',
    validIdFile: null as File | null,
    passportPhoto: null as File | null,
    signature: null as File | null,
    nextOfKin: '',
    referralSource: '',
    referralName: '',
    referredBy: 'no',
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dragActive, setDragActive] = useState({ passportPhoto: false, validIdFile: false, signature: false });
  const [availableClubs, setAvailableClubs] = useState<{value: string, label: string}[]>([]);

  const passportPhotoRef = useRef<HTMLInputElement>(null);
  const validIdFileRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);

  const { fetchWithAuth, displayNotification } = useAuth();
  

  const validIdOptions = [
    { value: 'national_id', label: 'National ID' },
    { value: 'international_passport', label: 'International Passport' },
    { value: 'nin_slip', label: 'NIN Slip' },
  ];





  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'country' ? { state: '', lga: '' } : {}),
      ...(name === 'state' ? { lga: '' } : {}),
      ...(name === 'unit' ? { club: '' } : {}),
    }));

    // Update available clubs when unit changes
    if (name === 'unit') {
      const selectedUnit = units.find(unit => unit.value === value);
      if (selectedUnit && selectedUnit.dropDown) {
        const clubOptions = selectedUnit.dropDown.map(club => {
          const key = Object.keys(club)[0];
          return { value: club[key as keyof typeof club], label: club[key as keyof typeof club] };
        });
        setAvailableClubs(clubOptions);
      } else {
        setAvailableClubs([]);
      }
    }

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (file: File, field: 'passportPhoto' | 'validIdFile' | 'signature') => {
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: `Please upload a valid ${field === 'passportPhoto' ? 'image' : 'file'} (${allowedTypes.join(', ')})`
        }));
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: 'File size must be less than 2MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        [field]: file
      }));

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (field === 'passportPhoto') {
            setPhotoPreview(e.target?.result as string);
          } else if (field === 'validIdFile') {
            setIdPreview(e.target?.result as string);
          } else if (field === 'signature') {
            setSignaturePreview(e.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        if (field === 'validIdFile') {
          setIdPreview(null);
        }
      }

      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDrag = (e: React.DragEvent, field: 'passportPhoto' | 'validIdFile' | 'signature') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [field]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, field: 'passportPhoto' | 'validIdFile' | 'signature') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file, field);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    
    if (!formData.state) {
      errors.state = 'State is required';
    }
    
    if (!formData.unit) {
      errors.unit = 'Unit is required';
    }
    
    if (availableClubs.length > 0 && !formData.club) {
      errors.club = 'Club is required';
    }
    
    if (!formData.validIdType) {
      errors.validIdType = 'Please select a valid ID type';
    }
    
    if (!formData.validIdFile) {
      errors.validIdFile = 'ID document is required';
    }
    
    if (!formData.passportPhoto) {
      errors.passportPhoto = 'Passport photo is required';
    }
    
    setFieldErrors(errors);
    
    // Scroll to first error field if there are errors
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(Object.keys(errors));
    }
    
    return Object.keys(errors).length === 0;
  };

  const scrollToFirstError = (errorFields: string[]) => {
    // Define the order of fields as they appear in the form
    const fieldOrder = [
      'firstName', 'lastName', 'phoneNumber', 'country', 'state', 
      'unit', 'club', 'validIdType', 'validIdFile', 'passportPhoto', 'signature'
    ];
    
    // Find the first field with an error based on form order
    const firstErrorField = fieldOrder.find(field => errorFields.includes(field));
    
    if (firstErrorField) {
      // Try to find the field element by name or id
      let fieldElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      
      // For file inputs, try to find by id
      if (!fieldElement) {
        fieldElement = document.getElementById(firstErrorField) as HTMLElement;
      }
      
      // For react-select components, try to find the container
      if (!fieldElement && (firstErrorField === 'country' || firstErrorField === 'state')) {
        const selectContainer = document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement;
        if (selectContainer) {
          fieldElement = selectContainer;
        }
      }
      
      if (fieldElement) {
        // Scroll to the field with some offset for better visibility
        fieldElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Focus the field if it's focusable
        if (fieldElement.focus && typeof fieldElement.focus === 'function') {
          setTimeout(() => fieldElement.focus(), 300);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const requestData = new FormData();
      // Basic Information
      requestData.append('first_name', formData.firstName);
      requestData.append('last_name', formData.lastName);
      requestData.append('email', formData.email);
      requestData.append('phone_number', formData.phoneNumber);
      
      // Location Information
      requestData.append('citizen', formData.citizen);
      requestData.append('country', formData.country);
      requestData.append('state', formData.state);
      requestData.append('lga', formData.lga);
      
      // YMCA Information
      requestData.append('unit', formData.unit);
      requestData.append('club', formData.club);
      
      // Personal Information
      requestData.append('age', formData.age);
      requestData.append('gender', formData.gender);
      requestData.append('date_of_birth', formData.date_of_birth);
      requestData.append('place_of_birth', formData.place_of_birth);
      requestData.append('home_address', formData.home_address);
      requestData.append('office_address', formData.office_address);
      requestData.append('profession', formData.profession);
      requestData.append('religion', formData.religion);
      requestData.append('church_name', formData.churchName);
      requestData.append('occupation', formData.occupation);
      requestData.append('marital_status', formData.marital_status);
      
      // ID Information
      requestData.append('valid_id_type', formData.validIdType);
      
      // Referral Information
      requestData.append('next_of_kin', formData.nextOfKin);
      requestData.append('referral_source', formData.referralSource);
      requestData.append('referral_name', formData.referralName);
      requestData.append('referred_by', formData.referredBy);
      
      if (formData.validIdFile) {
        requestData.append('valid_id_file', formData.validIdFile);
      }
      if (formData.passportPhoto) {
        requestData.append('passport_photo', formData.passportPhoto);
      }
      if (formData.signature) {
        requestData.append('signature', formData.signature);
      }

      await fetchWithAuth({
        method: 'POST',
        path: '/requests/',
        body: requestData,
        isFormData: true,
      });

      

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          citizen: 'Nigerian',
          country: '',
          age: '',
          gender: '',
          date_of_birth: '',
          place_of_birth: '',
          home_address: '',
          office_address: '',
          profession: '',
          religion: '',
          occupation: '',
          marital_status: '',
          state: '',
          lga: '',
          unit: '',
          club: '',
          validIdType: '',
          validIdFile: null,
          passportPhoto: null,
          signature: null,
          nextOfKin: '',
          referralSource: '',
          referralName: '',
          referredBy: 'no',
          churchName: '',
        });
        setPhotoPreview(null);
        setIdPreview(null);
        setSignaturePreview(null);
        
        const fileInputs = ['passportPhoto', 'validIdFile'].map(id => 
          document.getElementById(id) as HTMLInputElement
        );
        fileInputs.forEach(input => {
          if (input) input.value = '';
        });
      }, 3000);

    } catch (error: any) {
      console.error('Application submission error:', error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        const fieldErrorMessages: Record<string, string> = {};
        
        const fieldMapping: Record<string, string> = {
          'first_name': 'firstName',
          'last_name': 'lastName',
          'phone_number': 'phoneNumber',
          'valid_id_type': 'validIdType',
          'valid_id_file': 'validIdFile',
          'passport_photo': 'passportPhoto',
        };
        
        Object.keys(serverErrors).forEach(field => {
          const frontendField = fieldMapping[field] || field;
          fieldErrorMessages[frontendField] = Array.isArray(serverErrors[field]) 
            ? serverErrors[field][0] 
            : String(serverErrors[field]);
        });
        
        setFieldErrors(fieldErrorMessages);
        
        // Create a more specific error message
        const errorFieldNames = Object.keys(fieldErrorMessages).map(field => {
          const fieldLabels: Record<string, string> = {
            firstName: 'First Name',
            lastName: 'Last Name',
            phoneNumber: 'Phone Number',
            country: 'Country',
            state: 'State',
            lga: 'LGA',
            unit: 'Unit',
            club: 'Club',
            validIdType: 'Valid ID Type',
            validIdFile: 'ID Document',
            passportPhoto: 'Passport Photo',
            signature: 'Signature',
            date_of_birth: 'Date of Birth',
            marital_status: 'Marital Status',
            occupation: 'Occupation'
          };
          return fieldLabels[field] || field;
        });
        
        const errorMessage = errorFieldNames.length === 1 
          ? `Please correct the error in: ${errorFieldNames[0]}`
          : `Please correct the errors in: ${errorFieldNames.join(', ')}`;
        
        displayNotification(errorMessage, 'error');
      } else {
        displayNotification('Application submission failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold text-green-600">Application Submitted Successfully!</h2>
          </div>
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="flex justify-center mb-4">
          <Link to={'/'} >
            <img 
                src={ymca} 
                alt="YMCA Lagos Logo" 
                className="h-10 w-auto object-contain" 
              />
          </Link>
          
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Submit Application</h2>
        
        {Object.keys(fieldErrors).length > 0 && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-red-800">Please correct the following errors:</h3>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(fieldErrors).map(([field, error]) => {
                const fieldLabels: Record<string, string> = {
                  firstName: 'First Name',
                  lastName: 'Last Name',
                  phoneNumber: 'Phone Number',
                  country: 'Country',
                  state: 'State',
                  lga: 'LGA',
                  unit: 'Unit',
                  club: 'Club',
                  validIdType: 'Valid ID Type',
                  validIdFile: 'ID Document',
                  passportPhoto: 'Passport Photo',
                  signature: 'Signature',
                  date_of_birth: 'Date of Birth',
                  marital_status: 'Marital Status',
                  occupation: 'Occupation'
                };
                const fieldLabel = fieldLabels[field] || field;
                return (
                  <li key={field} className="text-red-600">
                    <span className="font-medium">{fieldLabel}:</span> {error}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {/* Personal Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleInputChange}
              error={fieldErrors.firstName}
              required
            />

            <FormInput
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleInputChange}
              error={fieldErrors.lastName}
              required
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              error={fieldErrors.email}
              required
            />

            <FormInput
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              error={fieldErrors.phoneNumber}
              required
            />

            <FormSelect
              label="Gender"
              name="gender"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
              value={formData.gender}
              onChange={handleInputChange}
              error={fieldErrors.gender}
              required
            />

            <FormInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              error={fieldErrors.date_of_birth}
            />

            <FormSelect
              label="Marital Status"
              name="marital_status"
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' },
              ]}
              value={formData.marital_status}
              onChange={handleInputChange}
              error={fieldErrors.marital_status}
            />
          
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">
                Citizenship Status 
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="citizen"
                    value="Nigerian"
                    checked={formData.citizen === 'Nigerian'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Nigerian</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="citizen"
                    value="Foreigner"
                    checked={formData.citizen === 'Foreigner'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Foreigner</span>
                </label>
              </div>
              {fieldErrors.citizen && (
                <p className="text-red-500 text-xs italic mt-1">{fieldErrors.citizen}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.citizen === 'Foreigner' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <CreatableSelect
                  options={countries}
                  value={
                    formData.country 
                      ? countries.find(option => option.value === formData.country) || { value: formData.country, label: formData.country }
                      : null
                  }
                  onChange={(selectedOption) => setFormData({ ...formData, country: selectedOption ? selectedOption.value : '' })}
                  onCreateOption={(inputValue) => {
                    setFormData({ ...formData, country: inputValue });
                  }}
                  placeholder="Select or type a country"
                  isSearchable
                  noOptionsMessage={() => "No country found"}
                  formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                  className={fieldErrors.country ? "border-red-500" : ""}
                  data-field="country"
                />
                {fieldErrors.country && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.country}</p>
                )}
              </div>
            )}
            

            {formData.citizen === 'Nigerian' ? (

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <Select
                options={nigerianStates}
                value={nigerianStates.find(option => option.value === formData.state) || null}
                onChange={(selectedOption) => setFormData({ ...formData, state: selectedOption ? selectedOption.value : '' })}
                placeholder="Select State"
                isSearchable
                noOptionsMessage={() => "No state found"}
                data-field="state"
              />
            </div>
            ) : (
              <FormInput
                label="State/Province"
                name="state"
                type="text"
                placeholder="Enter your state or province"
                value={formData.state}
                onChange={handleInputChange}
                error={fieldErrors.state}
                required
              />
            )}

            {formData.citizen === 'Nigerian' && (
              <FormInput
                label="LGA"
                name="lga"
                type="text"
                placeholder="Enter your LGA"
                value={formData.lga}
                onChange={handleInputChange}
                error={fieldErrors.lga}
                // required
              />
            )}
          
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Religion <span className="text-red-500">*</span></label>
              <select
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select Religion</option>
                <option value="Christian">Christian</option>
                <option value="Other">Other</option>
              </select>
              {fieldErrors.religion && (
                <p className="text-red-500 text-xs italic mt-1">{fieldErrors.religion}</p>
              )}
            </div> */}
            <FormSelect
              label="Religion"
              name="religion"
              options={[
                { value: 'Christian', label: 'Christian' },
                { value: 'Other', label: 'Other' },
              ]}
              value={formData.religion}
              onChange={handleInputChange}
              error={fieldErrors.religion}
              required
            />
            
            {formData.religion === 'Christian' && (
              <FormInput
                label="Church Name"
                name="churchName"
                type="text"
                placeholder="Enter your church name"
                value={formData.churchName}
                onChange={handleInputChange}
                error={fieldErrors.churchName}
                required
              />
            )}
            
            <FormInput
                label="Profession"
                name="profession"
                type="text"
                placeholder="Enter your state or province"
                value={formData.profession}
                onChange={handleInputChange}
                error={fieldErrors.profession}
                required
              />

            <FormInput
              label="Occupation"
              name="occupation"
              type="text"
              placeholder="Enter your occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              error={fieldErrors.occupation}
            />

            <FormSelect
              label="Unit"
              name="unit"
              options={units}
              value={formData.unit}
              onChange={handleInputChange}
              error={fieldErrors.unit}
              required
            />

            {availableClubs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Club/Church</label>
              <Select
                options={availableClubs}
                value={availableClubs.find(option => option.value === formData.club) || null}
                onChange={(selectedOption) => setFormData({ ...formData, club: selectedOption ? selectedOption.value : '' })}
                placeholder="Select Club/Church"
                isSearchable
                noOptionsMessage={() => "No club found"}
              />
            </div>
            )}
          </div>


          {/* add next of kin field */}
          <FormInput
            label="Next of Kin"
            name="nextOfKin"
            type="text"
            placeholder="Enter your next of kin"
            value={formData.nextOfKin}
            onChange={handleInputChange}
            error={fieldErrors.nextOfKin}
            required
          />

          {/* add were you refered by something this should be a yes or no */}
          <FormSelect
            label="Were you referred by someone?"
            name="referredBy"
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            value={formData.referredBy}
            onChange={handleInputChange}
            error={fieldErrors.referredBy}
            required
          />

          {/* add referela nmae optional */}
          <FormInput
            label="Referral Name (Optional)"
            name="referralName"
            type="text"
            placeholder="Enter your referral name"
            value={formData.referralName}
            onChange={handleInputChange}
            error={fieldErrors.referralName}
          />

        </div>

        {/* Identification Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Identification</h3>
          
          <FormSelect
            label="Valid ID Type"
            name="validIdType"
            options={validIdOptions}
            value={formData.validIdType}
            onChange={handleInputChange}
            error={fieldErrors.validIdType}
            required
          />

          <div className="mb-4">
            <label 
              htmlFor="validIdFile" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              ID Document *
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive.validIdFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${fieldErrors.validIdFile ? 'border-red-500' : ''}`}
              onDragEnter={(e) => handleDrag(e, 'validIdFile')}
              onDragLeave={(e) => handleDrag(e, 'validIdFile')}
              onDragOver={(e) => handleDrag(e, 'validIdFile')}
              onDrop={(e) => handleDrop(e, 'validIdFile')}
            >
              <input
                type="file"
                id="validIdFile"
                name="validIdFile"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0], 'validIdFile')}
                className="hidden"
                ref={validIdFileRef}
              />
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6M9 19h6m-3-3v6m3-6v6m-6-6v6" />
                </svg>
                <p className="text-gray-600 mb-2">
                  {formData.validIdFile ? formData.validIdFile.name : 'Drag and drop your ID document here or'}
                </p>
                <button
                  type="button"
                  onClick={() => validIdFileRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Choose File
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload a clear image of your ID document (JPEG, JPG, PNG, max 2MB)
              </p>
              {fieldErrors.validIdFile && (
                <p className="text-red-500 text-sm mt-2">{fieldErrors.validIdFile}</p>
              )}
            </div>
          </div>

          {idPreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                ID Preview:
              </label>
              <div className="flex justify-center">
                <img
                  src={idPreview}
                  alt="ID document preview"
                  className="w-48 h-32 object-cover border-2 border-gray-300 rounded"
                />
              </div>
            </div>
          )}
          {formData.validIdFile && !idPreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Uploaded File:
              </label>
              <p className="text-gray-600">{formData.validIdFile.name}</p>
            </div>
          )}
        </div>

        {/* Photo Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Photo Upload</h3>
          
          <div className="mb-4">
            <label 
              htmlFor="passportPhoto" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Passport Photo *
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive.passportPhoto ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${fieldErrors.passportPhoto ? 'border-red-500' : ''}`}
              onDragEnter={(e) => handleDrag(e, 'passportPhoto')}
              onDragLeave={(e) => handleDrag(e, 'passportPhoto')}
              onDragOver={(e) => handleDrag(e, 'passportPhoto')}
              onDrop={(e) => handleDrop(e, 'passportPhoto')}
            >
              <input
                type="file"
                id="passportPhoto"
                name="passportPhoto"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0], 'passportPhoto')}
                className="hidden"
                ref={passportPhotoRef}
              />
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6M9 19h6m-3-3v6m3-6v6m-6-6v6" />
                </svg>
                <p className="text-gray-600 mb-2">
                  {formData.passportPhoto ? formData.passportPhoto.name : 'Drag and drop your passport photo here or'}
                </p>
                <button
                  type="button"
                  onClick={() => passportPhotoRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Choose Photo
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload a clear passport picture of yourself (JPEG, JPG, or PNG, max 2MB)
              </p>
              {fieldErrors.passportPhoto && (
                <p className="text-red-500 text-sm mt-2">{fieldErrors.passportPhoto}</p>
              )}
            </div>
          </div>

          {photoPreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Photo Preview:
              </label>
              <div className="flex justify-center">
                <img
                  src={photoPreview}
                  alt="Passport photo preview"
                  className="w-32 h-32 object-cover border-2 border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Signature Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Signature Upload</h3>
          <div className="mb-4">
            <label
              htmlFor="signature"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Signature (optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive.signature ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${fieldErrors.signature ? 'border-red-500' : ''}`}
              onDragEnter={(e) => handleDrag(e, 'signature')}
              onDragLeave={(e) => handleDrag(e, 'signature')}
              onDragOver={(e) => handleDrag(e, 'signature')}
              onDrop={(e) => handleDrop(e, 'signature')}
            >
              <input
                type="file"
                id="signature"
                name="signature"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0], 'signature')}
                className="hidden"
                ref={signatureRef}
              />
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6M9 19h6m-3-3v6m3-6v6m-6-6v6" />
                </svg>
                <p className="text-gray-600 mb-2">
                  {formData.signature ? formData.signature.name : 'Drag and drop your signature image here or'}
                </p>
                <button
                  type="button"
                  onClick={() => signatureRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Choose Signature
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload a clear handwritten or e-signature image (JPEG, JPG, or PNG, max 2MB)
              </p>
              {fieldErrors.signature && (
                <p className="text-red-500 text-sm mt-2">{fieldErrors.signature}</p>
              )}
            </div>
          </div>

          {signaturePreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Signature Preview:
              </label>
              <div className="flex justify-center">
                <img
                  src={signaturePreview}
                  alt="Signature preview"
                  className="w-48 h-32 object-contain border-2 border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mb-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Important Notes:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure all information provided is accurate and up-to-date</li>
            <li>• Your passport photo should be recent and clearly show your face</li>
            <li>• Valid ID document will be verified as part of the process</li>
            <li>• You will receive a confirmation once your application is processed</li>
          </ul>
        </div>
        <a 
          className="inline-block mt-4 align-baseline font-bold text-sm text-red-600 hover:text-red-800"
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            navigate('/login');
          }}
        >
          Already have an account? Login
        </a>
      </form>
    </div>
  );
};

export default RequestForm;
