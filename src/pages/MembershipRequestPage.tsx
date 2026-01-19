import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/NewAuthContext';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import { Link, useNavigate } from 'react-router-dom';
import ymca from '../assets/images/image.png';
import { nigerianStates, ymcaUnits } from '../constants/utils';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { motion, } from 'framer-motion';

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

const units = ymcaUnits;

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  citizen: string;
  country: string;
  state: string;
  lga: string;
  unit: string;
  club: string;
  age: string;
  gender: string;
  date_of_birth: string;
  place_of_birth: string;
  home_address: string;
  office_address: string;
  profession: string;
  religion: string;
  churchName: string;
  occupation: string;
  marital_status: string;
  address: string;
  validIdType: string;
  validIdFile: File | null;
  passport_photo: File | null;
  signature: File | null;
  nextOfKinName: string;
  nextOfKinNumber: string;
  referralSource: string;
  referralName: string;
  referredBy: string;
}

const RequestForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
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
    address: '',
    validIdType: '',
    validIdFile: null,
    passport_photo: null,
    signature: null,
    nextOfKinName: '',
    nextOfKinNumber: '',
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
  const [dragActive, setDragActive] = useState({ 
    passport_photo: false, 
    validIdFile: false, 
    signature: false 
  });
  const [availableClubs, setAvailableClubs] = useState<{value: string, label: string}[]>([]);
  const [availableUnits] = useState<{value: string, label: string}[]>(units);
  const [availableChurches, setAvailableChurches] = useState<{value: string, label: string}[]>([]);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const passport_photoRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const validIdFileRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const signatureRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  const { fetchWithAuth, displayNotification } = useAuth();

  const validIdOptions = [
    { value: 'national_id', label: 'National ID' },
    { value: 'international_passport', label: 'International Passport' },
    // { value: 'nin_slip', label: 'NIN Slip' },
    { value: 'voters_card', label: 'Voters Card' },
    { value: 'others', label: 'Others' },
  ];

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Function to filter available clubs based on age - UPDATED VERSION
  const getAvailableClubs = (age: number, selectedUnit: any) => {
    if (age <= 0 || !age || !selectedUnit || !selectedUnit.dropDown) {
      console.log('No clubs available - missing required data');
      return [];
    }

    let allClubs = selectedUnit.dropDown.map((club: any) => {
      const key = Object.keys(club)[0];
      return { value: club[key], label: club[key] };
    });

    // For users 35+, completely hide Y’s men and central club from the dropdown
    if (age >= 35) {
      allClubs = allClubs.filter(
        (club: { value: string; label: string }) => {
          const v = club.value.trim().toLowerCase();
          return v !== "y's men" && v !== 'central club';
        }
      );
    }

    const unitName = selectedUnit.label.toLowerCase();
    const unitValue = selectedUnit.value.toLowerCase();

    // Check for Youth Council
    const isYouthCouncil = unitName.includes('youth') || unitValue.includes('youth');

    // Check for Y's Men
    const isYsMen = unitName.includes("y's men") || unitValue.includes("y's men") ||
      unitName.includes('ys men') || unitValue.includes('ys men');

    // Check for Central Club
    const isCentralClub = unitName.includes('central') || unitValue.includes('central');

    // Check for Council of Church
    const isCouncilOfChurch = unitName.includes('council') && unitName.includes('church');

    if (isYouthCouncil) {
      if (age <= 23) {
        const youthClubs = allClubs.filter(
          (club: { value: string; label: string }) => {
            const normalize = (str: string) =>
              str.toLowerCase().replace(/\s+/g, '');
            const clubName = normalize(club.value);
            const clubLabel = normalize(club.label);
            return clubName.includes('hi-y') || clubLabel.includes('hi-y');
          }
        );
        if (youthClubs.length === 0) {
          return allClubs;
        }
        return youthClubs;
      } else if (age >= 24 && age <= 30) {
        const youngAdultClubs = allClubs.filter((club: { value: string; label: string }) => {
          const clubName = club.value.toLowerCase();
          const clubLabel = club.label.toLowerCase();
          return clubName.includes('y-elite') || clubLabel.includes('y-elite');
        });
        if (youngAdultClubs.length === 0) {
          return allClubs;
        }
        return youngAdultClubs;
      } else {
        return [];
      }
    } else if (isYsMen || isCentralClub) {
      // Y's Men and Central Club are only for adults (31+), but 35+ cannot join
      if (age >= 31 && age < 35) {
        return allClubs;
      } else {
        return [];
      }
    } else if (isCouncilOfChurch) {
      if (age <= 23) {
        return allClubs.filter((club: { value: string; label: string }) => {
          const clubName = club.value.toLowerCase();
          return !clubName.includes('adult') && !clubName.includes('senior');
        });
      } else if (age >= 24 && age <= 30) {
        return allClubs.filter((club: { value: string; label: string }) => {
          const clubName = club.value.toLowerCase();
          return clubName.includes('y-elite');
        });
      } else {
        return allClubs;
      }
    } else {
      return allClubs;
    }
  };

  // Function to filter available churches based on age
  const getAvailableChurches = (age: number, selectedUnit: any) => {
    if (!selectedUnit || !selectedUnit.churchDropDown) return [];
    
    const allChurches = selectedUnit.churchDropDown.map((church: any) => {
      const key = Object.keys(church)[0];
      return { value: church[key], label: church[key] };
    });
    
    const isYouthCouncil = selectedUnit.value.toLowerCase().includes('youth') || 
                           selectedUnit.label.toLowerCase().includes('youth');
    
    if (isYouthCouncil) {
      if (age <= 23) {
        return allChurches.filter((church: {value: string, label: string}) => {
          const churchName = church.value.toLowerCase();
          return !churchName.includes('adult') && !churchName.includes('senior');
        });
      } else if (age >= 24 && age <= 30) {
        return allChurches.filter((church: {value: string, label: string}) => {
          const churchName = church.value.toLowerCase();
          return churchName.includes('Y-Elite');
        });
      } else {
        return [];
      }
    } else {
      return allChurches;
    }
  };

  // Effect to update age and available clubs when date of birth or unit changes
  useEffect(() => {
    if (formData.date_of_birth) {
      const calculatedAge = calculateAge(formData.date_of_birth);
      
      setFormData(prev => ({
        ...prev,
        age: calculatedAge.toString()
      }));

      if (formData.unit) {
        const selectedUnit = units.find(unit => unit.value === formData.unit) as any;
        if (selectedUnit) {
          const filteredClubs = getAvailableClubs(calculatedAge, selectedUnit);
          setAvailableClubs(filteredClubs);
          
          const isCouncilOfChurch = formData.club && (
            formData.club.toLowerCase().includes('council of church') || 
            formData.club.toLowerCase().includes('council') ||
            formData.club.toLowerCase().includes('church')
          );
          
          if (isCouncilOfChurch && selectedUnit.churchDropDown) {
            const filteredChurches = getAvailableChurches(calculatedAge, selectedUnit);
            setAvailableChurches(filteredChurches);
            
            const currentChurchValid = filteredChurches.some((church: { value: string; }) => church.value === formData.churchName);
            if (formData.churchName && !currentChurchValid) {
              setFormData(prev => ({
                ...prev,
                churchName: ''
              }));
            }
          }
          
          const currentClubValid = filteredClubs.some((club: { value: string; }) => club.value === formData.club);
          if (formData.club && !currentClubValid) {
            setFormData(prev => ({
              ...prev,
              club: '',
              churchName: ''
            }));
            setAvailableChurches([]);
          }
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        age: ''
      }));
      setAvailableClubs([]);
      setAvailableChurches([]);
    }
  }, [formData.date_of_birth, formData.unit, formData.club]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    const updates: Partial<FormData> = {
      [name]: value,
    };

    // Handle cascading resets
    if (name === 'country') {
      updates.state = '';
      updates.lga = '';
    } else if (name === 'state') {
      updates.lga = '';
    } else if (name === 'unit') {
      updates.club = '';
      updates.churchName = '';
    } else if (name === 'club') {
      updates.churchName = '';
    }

    setFormData(prev => ({
      ...prev,
      ...updates,
    }));

    // Update available clubs when unit changes
    if (name === 'unit') {
      const selectedUnit = units.find(unit => unit.value === value) as any;
      
      if (selectedUnit && selectedUnit.dropDown && formData.age) {
        const calculatedAge = parseInt(formData.age);
        const filteredClubs = getAvailableClubs(calculatedAge, selectedUnit);
        setAvailableClubs(filteredClubs);
        
        if (selectedUnit.churchDropDown) {
          const churchOptions = getAvailableChurches(calculatedAge, selectedUnit);
          setAvailableChurches(churchOptions);
        } else {
          setAvailableChurches([]);
        }
      } else if (selectedUnit && selectedUnit.dropDown) {
        const allClubs = selectedUnit.dropDown.map((club: any) => {
          const key = Object.keys(club)[0];
          return { value: club[key], label: club[key] };
        });
        setAvailableClubs(allClubs);
        
        if (selectedUnit.churchDropDown) {
          const allChurches = selectedUnit.churchDropDown.map((church: any) => {
            const key = Object.keys(church)[0];
            return { value: church[key], label: church[key] };
          });
          setAvailableChurches(allChurches);
        } else {
          setAvailableChurches([]);
        }
      } else {
        setAvailableClubs([]);
        setAvailableChurches([]);
      }
    }

    // Update available churches when club is "Council Of Church"
    if (name === 'club') {
      const selectedUnit = units.find(unit => unit.value === formData.unit) as any;
      const isCouncilOfChurch = value.toLowerCase().includes('council of church') ;
      
      if (isCouncilOfChurch && selectedUnit && selectedUnit.churchDropDown && formData.age) {
        const calculatedAge = parseInt(formData.age);
        const filteredChurches = getAvailableChurches(calculatedAge, selectedUnit);
        setAvailableChurches(filteredChurches);
        
        // Also update available clubs to show appropriate message
        if (filteredChurches.length > 0) {
          setAvailableClubs([{ value: 'council_of_church', label: 'Council of Church - Select your church below' }]);
        }
      } else if (isCouncilOfChurch && selectedUnit && selectedUnit.churchDropDown) {
        const allChurches = selectedUnit.churchDropDown.map((church: any) => {
          const key = Object.keys(church)[0];
          return { value: church[key], label: church[key] };
        });
        setAvailableChurches(allChurches);
        setAvailableClubs([{ value: 'council_of_church', label: 'Council of Church - Select your church below' }]);
      } else {
        setAvailableChurches([]);
        setFormData(prev => ({ ...prev, churchName: '' }));
        
        // Reset available clubs to normal when not selecting Council of Church
        if (selectedUnit && selectedUnit.dropDown && formData.age) {
          const calculatedAge = parseInt(formData.age);
          const filteredClubs = getAvailableClubs(calculatedAge, selectedUnit);
          setAvailableClubs(filteredClubs);
        }
      }
    }

    // Manual age calculation if date_of_birth is entered
    if (name === 'date_of_birth') {
      if (value) {
        const calculatedAge = calculateAge(value);
        setFormData(prev => ({
          ...prev,
          age: calculatedAge.toString()
        }));

        if (formData.unit) {
          const selectedUnit = units.find(unit => unit.value === formData.unit) as any;
          if (selectedUnit) {
            const filteredClubs = getAvailableClubs(calculatedAge, selectedUnit);
            setAvailableClubs(filteredClubs);
            
            const isCouncilOfChurch = formData.club && (
              formData.club.toLowerCase().includes('council of church') 
            );
            
            if (isCouncilOfChurch && selectedUnit.churchDropDown) {
              const filteredChurches = getAvailableChurches(calculatedAge, selectedUnit);
              setAvailableChurches(filteredChurches);
              
              const currentChurchValid = filteredChurches.some((church: { value: string; }) => church.value === formData.churchName);
              if (formData.churchName && !currentChurchValid) {
                setFormData(prev => ({
                  ...prev,
                  churchName: ''
                }));
              }
            }
            
            const currentClubValid = filteredClubs.some((club: { value: string; }) => club.value === formData.club);
            if (formData.club && !currentClubValid) {
              setFormData(prev => ({
                ...prev,
                club: '',
                churchName: ''
              }));
              setAvailableChurches([]);
            }
          }
        }
      } else {
        setFormData(prev => ({
          ...prev,
          age: ''
        }));
        setAvailableClubs([]);
        setAvailableChurches([]);
      }
    }

    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (file: File, field: 'passport_photo' | 'validIdFile' | 'signature') => {
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: `Please upload a valid image (JPEG, JPG, PNG)`
        }));
        return;
      }

      const maxSize = 2 * 1024 * 1024;
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
          const result = e.target?.result as string;
          if (field === 'passport_photo') {
            setPhotoPreview(result);
          } else if (field === 'validIdFile') {
            setIdPreview(result);
          } else if (field === 'signature') {
            setSignaturePreview(result);
          }
        };
        reader.readAsDataURL(file);
      }

      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDrag = (e: React.DragEvent, field: 'passport_photo' | 'validIdFile' | 'signature') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [field]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, field: 'passport_photo' | 'validIdFile' | 'signature') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file, field);
    }
  };

  // Helper function to get input border color based on validation
  const getInputBorderColor = (fieldName: string, value: any) => {
    if (touchedFields[fieldName] || Object.keys(fieldErrors).length > 0) {
      if (fieldErrors[fieldName]) {
        return 'border-red-500';
      } else if (value && value.toString().trim() !== '') {
        return 'border-green-500';
      }
    }
    return 'border-gray-300';
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Required field validations
    const requiredFields = {
      first_name: 'First name is required',
      last_name: 'Last name is required',
      phone_number: 'Phone number is required',
      country: 'Country is required',
      state: 'State is required',
      unit: 'Unit is required',
      address: 'Address is required',
      validIdType: 'Please select a valid ID type',
      validIdFile: 'ID document is required',
      passport_photo: 'Passport photo is required',
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field as keyof FormData]) {
        errors[field] = message;
      }
    });

    // Phone number format validation
    if (formData.phone_number && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone_number.trim())) {
      errors.phone_number = 'Please enter a valid phone number';
    }

    // Club validation
    if (availableClubs.length > 0 && !formData.club) {
      errors.club = 'Club is required';
    }

    // Church name validation when Council Of Church is selected
    const isCouncilOfChurch = formData.club && (
      formData.club.toLowerCase().includes('council of church') 
    );
    
    if (isCouncilOfChurch && !formData.churchName) {
      errors.churchName = 'Please select your church';
    }

    // Age-based validations
    if (formData.age && formData.unit) {
      const ageNum = parseInt(formData.age);
      const selectedUnit = units.find(unit => unit.value === formData.unit);
      const isYouthCouncil = selectedUnit && (
        selectedUnit.value.toLowerCase().includes('youth') || 
        selectedUnit.label.toLowerCase().includes('youth')
      );
      
      if (isYouthCouncil) {
        if (ageNum >= 31) {
          errors.unit = 'Age 31 and above cannot join Youth Council. Please select an other unit.';
        }
      }
    }

    // Mark all fields as touched when validating
    const allFields = Object.keys(requiredFields);
    const newTouchedFields: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...newTouchedFields }));
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(Object.keys(errors));
    }
    
    return Object.keys(errors).length === 0;
  };

  const scrollToFirstError = (errorFields: string[]) => {
    const fieldOrder = [
      'first_name', 'last_anme', 'phone_number', 'country', 'state', 
      'unit', 'club', 'churchName', 'validIdType', 'validIdFile', 'passport_photo'
    ];
    
    const firstErrorField = fieldOrder.find(field => errorFields.includes(field));
    
    if (firstErrorField) {
      const fieldElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      
      if (fieldElement) {
        fieldElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        setTimeout(() => fieldElement.focus?.(), 300);
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
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (value instanceof File) {
            requestData.append(key, value);
          } else {
            requestData.append(key, value.toString());
          }
        }
      });

      await fetchWithAuth({
        method: 'POST',
        path: '/requests/',
        body: requestData,
        isFormData: true,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
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
          address: '',
          validIdType: '',
          validIdFile: null,
          passport_photo: null,
          signature: null,
          nextOfKinName: '',
          nextOfKinNumber: '',
          referralSource: '',
          referralName: '',
          referredBy: 'no',
        });
        setPhotoPreview(null);
        setIdPreview(null);
        setSignaturePreview(null);
        setTouchedFields({});
        setAvailableClubs([]);
        setAvailableChurches([]);
        
        // Reset file inputs
        [passport_photoRef, validIdFileRef, signatureRef].forEach(ref => {
          if (ref.current) ref.current.value = '';
        });
      }, 3000);

    } catch (error: any) {
      console.error('Application submission error:', error);
      
      if (error.response?.data) {
        const serverErrors = error.response.data;
        const fieldErrorMessages: Record<string, string> = {};
        
        const fieldMapping: Record<string, string> = {
          'first_name': 'first_name',
          'last_name': 'last_name',
          'phone_number': 'phone_number',
          'valid_id_type': 'validIdType',
          'valid_id_file': 'validIdFile',
          'passport_photo': 'passport_photo',
        };
        
        Object.keys(serverErrors).forEach(field => {
          const frontendField = fieldMapping[field] || field;
          fieldErrorMessages[frontendField] = Array.isArray(serverErrors[field]) 
            ? serverErrors[field][0] 
            : String(serverErrors[field]);
        });
        
        setFieldErrors(fieldErrorMessages);
        
        const errorFieldNames = Object.keys(fieldErrorMessages);
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

  // File upload component to reduce duplication
  const FileUploadField = ({
    field,
    label,
    accept = "image/jpeg,image/jpg,image/png",
    required = false,
    preview,
    dragActiveKey,
    fileRef
  }: {
    field: 'passport_photo' | 'validIdFile' | 'signature';
    label: string;
    accept?: string;
    required?: boolean;
    preview: string | null;
    dragActiveKey: keyof typeof dragActive;
    fileRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div className="mb-4">
      <label htmlFor={field} className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && '*'}
      </label>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive[dragActiveKey] ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${fieldErrors[field] ? 'border-red-500' : ''}`}
        onDragEnter={(e) => handleDrag(e, field)}
        onDragLeave={(e) => handleDrag(e, field)}
        onDragOver={(e) => handleDrag(e, field)}
        onDrop={(e) => handleDrop(e, field)}
      >
        <input
          type="file"
          id={field}
          name={field}
          accept={accept}
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0], field)}
          className="hidden"
          ref={fileRef}
        />
        <div className="flex flex-col items-center">
          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6M9 19h6m-3-3v6m3-6v6m-6-6v6" />
          </svg>
          <p className="text-gray-600 mb-2">
            {formData[field] ? formData[field]?.name : `Drag and drop your ${label.toLowerCase()} here or`}
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Choose File
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Upload a clear image (JPEG, JPG, PNG, max 2MB)
        </p>
        {fieldErrors[field] && <p className="text-red-500 text-sm mt-2">{fieldErrors[field]}</p>}
      </div>

      {preview && (
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Preview:</label>
          <div className="flex justify-center">
            <img 
              src={preview} 
              alt={`${label} preview`} 
              className={`${
                field === 'passport_photo' ? 'w-32 h-32' : 'w-48 h-32'
              } object-cover border-2 border-gray-300 rounded`} 
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-10 px-2 flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Animated background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-20 -z-10 animate-float" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-20 -z-10 animate-float2" />

      {/* Hero Header */}
      <div className="w-full max-w-2xl mx-auto text-center mb-8">
        <div className="flex justify-center mb-4">
          <Link to={'/'}>
            <img src={ymca} alt="YMCA Lagos Logo" className="h-12 w-auto object-contain drop-shadow-lg" />
          </Link>
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent mb-2"
        >
          YMCA Membership Application
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-gray-700 text-lg max-w-xl mx-auto mb-2"
        >
          Join the largest youth movement in Africa. Fill out the form below to become a member of YMCA Lagos.
        </motion.p>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center border-t-8 border-green-400 animate-fade-in"
          >
            <svg className="w-16 h-16 text-green-500 mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Application Submitted Successfully!</h2>
            <p className="text-gray-700">Thank you for joining YMCA Lagos. We will contact you soon.</p>
          </motion.div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl px-8 pt-8 pb-10 mb-8 border border-gray-100 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-6 text-center text-gradient">Submit Application</h2>

        {Object.keys(fieldErrors).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 shadow"
          >
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-red-800">Please correct the following errors:</h3>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(fieldErrors).map(([field, error]) => {
                const fieldLabels: Record<string, string> = {
                  first_name: 'First Name',
                  last_name: 'Last Name',
                  phone_number: 'Phone Number',
                  country: 'Country',
                  state: 'State',
                  lga: 'LGA',
                  unit: 'Unit',
                  club: 'Club',
                  churchName: 'Church Name',
                  validIdType: 'Valid ID Type',
                  validIdFile: 'ID Document',
                  passport_photo: 'Passport Photo',
                  signature: 'Signature',
                };
                const fieldLabel = fieldLabels[field] || field;
                return (
                  <li key={field} className="text-red-600">
                    <span className="font-medium">{fieldLabel}:</span> {error}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}

        {/* Section Divider */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b-2 border-gradient pb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="first_name"
              type="text"
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={handleInputChange}
              error={fieldErrors.first_name}
              required
              className={getInputBorderColor('first_name', formData.first_name)}
            />

            <FormInput
              label="Last Name"
              name="last_name"
              type="text"
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={handleInputChange}
              error={fieldErrors.last_name}
              required
              className={getInputBorderColor('last_name', formData.last_name)}
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              error={fieldErrors.email}
              className={getInputBorderColor('email', formData.email)}
            />

            <FormInput
              label="Phone Number"
              name="phone_number"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone_number}
              onChange={handleInputChange}
              error={fieldErrors.phone_number}
              required
              className={getInputBorderColor('phone_number', formData.phone_number)}
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
              className={getInputBorderColor('gender', formData.gender)}
            />

            <FormInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              error={fieldErrors.date_of_birth}
              className={getInputBorderColor('date_of_birth', formData.date_of_birth)}
            />

            {/* Age field - read only, automatically calculated */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Age *</label>
              <input
                type="text"
                name="age"
                value={formData.age || ''}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 cursor-not-allowed"
                placeholder="Age will be calculated automatically"
              />
              <p className="text-xs text-gray-500 mt-1">Calculated automatically from date of birth</p>
            </div>

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
              className={getInputBorderColor('marital_status', formData.marital_status)}
            />
          
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Citizenship Status</label>
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.citizen === 'Foreigner' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country <span className="text-red-500">*</span></label>
                <CreatableSelect
                  options={countries}
                  value={formData.country ? countries.find(option => option.value === formData.country) || { value: formData.country, label: formData.country } : null}
                  onChange={(selectedOption) => {
                    setTouchedFields(prev => ({ ...prev, country: true }));
                    setFormData({ ...formData, country: selectedOption ? selectedOption.value : '' });
                  }}
                  onCreateOption={(inputValue) => {
                    setTouchedFields(prev => ({ ...prev, country: true }));
                    setFormData({ ...formData, country: inputValue });
                  }}
                  placeholder="Select or type a country"
                  isSearchable
                  noOptionsMessage={() => "No country found"}
                  formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                  className={getInputBorderColor('country', formData.country)}
                />
                {fieldErrors.country && <p className="mt-1 text-sm text-red-600">{fieldErrors.country}</p>}
              </div>
            )}
            
            {formData.citizen === 'Nigerian' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <Select
                  options={nigerianStates}
                  value={nigerianStates.find(option => option.value === formData.state) || null}
                  onChange={(selectedOption) => {
                    setTouchedFields(prev => ({ ...prev, state: true }));
                    setFormData({ ...formData, state: selectedOption ? selectedOption.value : '' });
                  }}
                  placeholder="Select State"
                  isSearchable
                  noOptionsMessage={() => "No state found"}
                  className={getInputBorderColor('state', formData.state)}
                />
                {fieldErrors.state && <p className="mt-1 text-sm text-red-600">{fieldErrors.state}</p>}
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
                className={getInputBorderColor('state', formData.state)}
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
                className={getInputBorderColor('lga', formData.lga)}
              />
            )}
          
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
              className={getInputBorderColor('religion', formData.religion)}
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
                className={getInputBorderColor('churchName', formData.churchName)}
              />
            )}
            
            <FormInput
              label="Profession"
              name="profession"
              type="text"
              placeholder="Enter your profession"
              value={formData.profession}
              onChange={handleInputChange}
              error={fieldErrors.profession}
              className={getInputBorderColor('profession', formData.profession)}
            />

            <FormInput
              label="Occupation"
              name="occupation"
              type="text"
              placeholder="Enter your occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              error={fieldErrors.occupation}
              className={getInputBorderColor('occupation', formData.occupation)}
            />

            <FormSelect
              label="Unit"
              name="unit"
              options={availableUnits}
              value={formData.unit}
              onChange={handleInputChange}
              error={fieldErrors.unit}
              required
              className={getInputBorderColor('unit', formData.unit)}
            />

            {availableClubs.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData?.unit?.toLowerCase().includes('council of church') ? <>Church</> : <>Club</>}
                </label>

                <Select
                  options={availableClubs}
                  value={availableClubs.find(option => option.value === formData.club) || null}
                  onChange={(selectedOption) => {
                    setTouchedFields(prev => ({ ...prev, club: true }));
                    const newClub = selectedOption ? selectedOption.value : '';
                    setFormData({ ...formData, club: newClub, churchName: '' });
                    
                    const isCouncilOfChurch = newClub.toLowerCase().includes('council of church') ;
                    
                    if (isCouncilOfChurch && formData.unit) {
                      const selectedUnit = units.find(unit => unit.value === formData.unit);
                      if (selectedUnit && 'churchDropDown' in selectedUnit && selectedUnit.churchDropDown && formData.age) {
                        const calculatedAge = parseInt(formData.age);
                        const filteredChurches = getAvailableChurches(calculatedAge, selectedUnit);
                        setAvailableChurches(filteredChurches);
                      } else if (selectedUnit && 'churchDropDown' in selectedUnit && selectedUnit.churchDropDown && Array.isArray(selectedUnit.churchDropDown)) {
                        const allChurches = selectedUnit.churchDropDown.map((church: any) => {
                          const key = Object.keys(church)[0];
                          return { value: church[key], label: church[key] };
                        });
                        setAvailableChurches(allChurches);
                      }
                    } else {
                      setAvailableChurches([]);
                    }
                  }}
                  placeholder="Select"
                  isSearchable
                  noOptionsMessage={() => "No church found"}
                  className={getInputBorderColor('church', formData.club)}
                />
                {fieldErrors.club && <p className="mt-1 text-sm text-red-600">{fieldErrors.club}</p>}
              </div>
            )}

            {/* Church Name Dropdown - Only show when Council Of Church is selected */}
            {availableChurches.length > 0 && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Church
                </label>
                <Select
                  options={availableChurches}
                  value={availableChurches.find(option => option.value === formData.churchName) || null}
                  onChange={(selectedOption) => {
                    setTouchedFields(prev => ({ ...prev, churchName: true }));
                    setFormData({ ...formData, churchName: selectedOption ? selectedOption.value : '' });
                  }}
                  placeholder="Select your Church"
                  isSearchable
                  noOptionsMessage={() => "No church found"}
                  className={getInputBorderColor('churchName', formData.churchName)}
                />
                {fieldErrors.churchName && <p className="mt-1 text-sm text-red-600">{fieldErrors.churchName}</p>}
              </div>
            )}

            {!formData.date_of_birth && (
              <p className="text-sm text-yellow-600 mb-2 col-span-2">
                Please enter your date of birth first to see available clubs and churches
              </p>
            )}

            {/* Updated error message for no clubs available */}
            {formData.age && formData.unit && availableClubs.length === 0 && (
              <div className="text-sm text-red-600 mb-2 col-span-2 p-3 bg-red-50 rounded border border-red-200">
                {(() => {
                  const unitName = formData.unit;
                  const unitLabel = availableUnits.find(u => u.value === unitName)?.label || unitName;
                  const isCouncilOfChurch = unitLabel.toLowerCase().includes('council') && unitLabel.toLowerCase().includes('church');
                  
                  // Determine the specific message based on unit type
                  let specificMessage = '';
                  
                  if (unitLabel.toLowerCase().includes("y's men") || unitLabel.toLowerCase().includes('ys men')) {
                    specificMessage = `Y's Men not available for your age group`;
                  } else if (unitLabel.toLowerCase().includes('central')) {
                    specificMessage = `Central Club not available for your age group`;
                  } else if (isCouncilOfChurch) {
                    specificMessage = `No churches available for your age group in Council of Church`;
                  } else if (unitLabel.toLowerCase().includes('youth')) {
                    specificMessage = `No clubs available for your age group in Youth Council`;
                  } else {
                    specificMessage = `No clubs available for your age group`;
                  }
                  
                  return (
                    <>
                      <p className="font-semibold">{specificMessage}</p>
                      <p>Age {formData.age} in {unitLabel}:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Youth Council (ages 1-23): Hi-Y </li>
                        <li>Youth Council (ages 24-30): Y-Elite </li>
                        <li>Age 31+: Please select an other unit</li>
                      </ul>
                      <p className="mt-2">Please try selecting a different unit or contact administration.</p>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Helpful info section */}
            {formData.age && formData.unit && (
              <div className="text-sm text-blue-600 mb-2 col-span-2 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="font-semibold">Age Guidance for {availableUnits.find(u => u.value === formData.unit)?.label || formData.unit}:</p>
                {(() => {
                  const age = parseInt(formData.age);
                  const unitLabel = availableUnits.find(u => u.value === formData.unit)?.label || formData.unit;
                  const isYouthCouncil = unitLabel.toLowerCase().includes('youth');
                  const isCouncilOfChurch = unitLabel.toLowerCase().includes('council') && unitLabel.toLowerCase().includes('church');
                  
                  if (isYouthCouncil) {
                    if (age <= 23) {
                      return <p>At age {formData.age}, you can join: Hi-Y</p>;
                    } else if (age >= 24 && age <= 30) {
                      return <p>At age {formData.age}, you can join: Y-Elite</p>;
                    } else {
                      return <p>At age {formData.age}, you cannot join Youth Council. Please select an other unit.</p>;
                    }
                  } else if (isCouncilOfChurch) {
                    // For Council of Church, show a simple message instead of listing all churches
                    if (age <= 23) {
                      return <p>At age {formData.age}, you can only join Youth Council</p>;
                    } else if (age >= 24 && age <= 30) {
                      return <p>At age {formData.age}, you can only join Youth Council</p>;
                    } else {
                      return <p>At age {formData.age}, you can join any other unit</p>;
                    }
                  } else if (unitLabel.toLowerCase().includes("y's men") || unitLabel.toLowerCase().includes('central')) {
                    if (age >= 31) {
                      return <p>At age {formData.age}, you can join this unit</p>;
                    } else {
                      return <p>At age {formData.age}, you cannot join {unitLabel}. Minimum age is 31.</p>;
                    }
                  } else {
                    // For other units, show available clubs but limit the display
                    const availableClubLabels = availableClubs.map(club => club.label);
                    if (availableClubLabels.length > 3) {
                      return <p>At age {formData.age}, you can join {availableClubLabels.length} available clubs</p>;
                    } else if (availableClubLabels.length > 0) {
                      return <p>At age {formData.age}, you can join: {availableClubLabels.join(', ')}</p>;
                    } else {
                      return <p>At age {formData.age}, no clubs available for this unit</p>;
                    }
                  }
                })()}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              onBlur={() => setTouchedFields(prev => ({ ...prev, address: true }))}
              placeholder="Enter your full residential address"
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${getInputBorderColor('address', formData.address)}`}
              required
            />
            {fieldErrors.address && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
            )}
          </div>

          <FormInput
            label="Next of Kin Name"
            name="nextOfKinName"
            type="text"
            placeholder="Next Of Kin's Name"
            value={formData.nextOfKinName}
            onChange={handleInputChange}
            error={fieldErrors.nextOfKinName}
            className={getInputBorderColor('nextOfKinName', formData.nextOfKinName)}
          />

          <FormInput
            label="Next of Kin Phone No"
            name="nextOfKinNumber"
            type="text"
            placeholder="Next of kin's Phone No"
            value={formData.nextOfKinNumber}
            onChange={handleInputChange}
            error={fieldErrors.nextOfKinNumber}
            className={getInputBorderColor('nextOfKinNumber', formData.nextOfKinNumber)}
          />

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
            className={getInputBorderColor('referredBy', formData.referredBy)}
          />

          {formData.referredBy === 'yes' && (
            <FormInput
              label="Referral Name"
              name="referralName"
              type="text"
              placeholder="Enter your referral name"
              value={formData.referralName}
              onChange={handleInputChange}
              error={fieldErrors.referralName}
              className={getInputBorderColor('referralName', formData.referralName)}
            />
          )}
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
            className={getInputBorderColor('validIdType', formData.validIdType)}
          />

          <FileUploadField
            field="validIdFile"
            label="ID Document"
            required={true}
            preview={idPreview}
            dragActiveKey="validIdFile"
            fileRef={validIdFileRef}
          />
        </div>

        {/* Photo Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Photo Upload</h3>
          
          <FileUploadField
            field="passport_photo"
            label="Passport Photo"
            required={true}
            preview={photoPreview}
            dragActiveKey="passport_photo"
            fileRef={passport_photoRef}
          />
        </div>

        {/* Signature Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Signature Upload</h3>
          
          <FileUploadField
            field="signature"
            label="Signature"
            required={false}
            preview={signaturePreview}
            dragActiveKey="signature"
            fileRef={signatureRef}
          />
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