import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/NewAuthContext';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import { Link, useNavigate } from 'react-router-dom';
import ymca from '../assets/images/image.png'
import { nigerianStates, ymcaUnits } from '../constants/utils';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';

import { useState, useEffect } from 'react';
import axios from 'axios';

const MembershipRequestPage = () => {
  const [clubs, setClubs] = useState([]);
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generic fetch function
  const fetchData = async (endpoint, setter) => {
    try {
      const { data } = await axios.get(endpoint);
      setter(data);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchData('/api/clubs', setClubs),
        fetchData('/api/churches', setChurches),
      ]);
      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading) return <p>Loading options...</p>;
  if (error) return <p>Failed to load options</p>;

  return (
    <div>
      <h2>Clubs</h2>
      <select>
        {clubs.map(club => (
          <option key={club.id} value={club.id}>
            {club.name}
          </option>
        ))}
      </select>

      <h2>Churches</h2>
      <select>
        {churches.map(church => (
          <option key={church.id} value={church.id}>
            {church.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MembershipRequestPage;

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
  const [dragActive, setDragActive] = useState({ passportPhoto: false, validIdFile: false, signature: false });
  const [availableClubs, setAvailableClubs] = useState<{value: string, label: string}[]>([]);
  const [availableUnits, setAvailableUnits] = useState<{value: string, label: string}[]>(units);
  const [availableChurches, setAvailableChurches] = useState<{value: string, label: string}[]>([]);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const passportPhotoRef = useRef<HTMLInputElement>(null);
  const validIdFileRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);

  const { fetchWithAuth, displayNotification } = useAuth();

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    // Calculate age based on full years
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Function to filter available clubs based on age
  const getAvailableClubs = (age: number, selectedUnit: any) => {
    if (age <= 0 || !age || !selectedUnit || !selectedUnit.dropDown) return [];
    
    console.log('Calculating clubs for age:', age);
    console.log('Selected unit:', selectedUnit);
    
    const allClubs = selectedUnit.dropDown.map((club: any) => {
      const key = Object.keys(club)[0];
      return { value: club[key], label: club[key] };
    });
    
    console.log('All clubs in unit:', allClubs);
    
    // If the selected unit is Youth Council, filter clubs based on age
    const isYouthCouncil = selectedUnit.value.toLowerCase().includes('youth') || 
                           selectedUnit.label.toLowerCase().includes('youth');
    
    if (isYouthCouncil) {
      if (age <= 23) {
        // 1-23 years - only Hi-Y club in Youth Council
        const hiYClubs = allClubs.filter(club => {
          const clubName = club.value.toLowerCase();
          const clubLabel = club.label.toLowerCase();
          
          // Only exact matches for Hi-Y
          const isHiY = clubName.includes('hi-y') || clubLabel.includes('hi-y');
          
          console.log('Club:', club.value, 'Is Hi-Y?', isHiY);
          return isHiY;
        });
        console.log('Hi-Y clubs found:', hiYClubs);
        return hiYClubs;
      } else if (age >= 24 && age <= 30) {
        // 24-30 years - only Y-Elite club in Youth Council
        const yEliteClubs = allClubs.filter(club => {
          const clubName = club.value.toLowerCase();
          const clubLabel = club.label.toLowerCase();
          
          // Only exact matches for Y-Elite
          const isYElite = clubName.includes('y-elite') || clubLabel.includes('y-elite');
          
          console.log('Club:', club.value, 'Is Y-Elite?', isYElite);
          return isYElite;
        });
        console.log('Y-Elite clubs found:', yEliteClubs);
        return yEliteClubs;
      } else {
        // 31 and above - cannot join Youth Council at all
        console.log('Age 31+ cannot join Youth Council');
        return [];
      }
    } else {
      // For non-Youth Council units (adult units), show all clubs
      console.log('Adult unit - showing all clubs');
      return allClubs;
    }
  };

  // Function to filter available churches based on age
  const getAvailableChurches = (age: number, selectedUnit: any) => {
    if (!selectedUnit || !selectedUnit.churchDropDown) return [];
    
    console.log('Calculating churches for age:', age);
    
    const allChurches = selectedUnit.churchDropDown.map((church: any) => {
      const key = Object.keys(church)[0];
      return { value: church[key], label: church[key] };
    });
    
    console.log('All churches in unit:', allChurches);
    
    // If the selected unit is Youth Council, filter churches based on age
    const isYouthCouncil = selectedUnit.value.toLowerCase().includes('youth') || 
                           selectedUnit.label.toLowerCase().includes('youth');
    
    if (isYouthCouncil) {
      if (age <= 23) {
        // 1-23 years - only youth-appropriate churches
        const youthChurches = allChurches.filter(church => {
          const churchName = church.value.toLowerCase();
          const churchLabel = church.label.toLowerCase();
          
          // Filter churches that are appropriate for youth (age 1-23)
          // You can customize this logic based on your church naming conventions
          const isYouthChurch = !churchName.includes('adult') && 
                               !churchLabel.includes('adult') &&
                               !churchName.includes('senior') &&
                               !churchLabel.includes('senior');
          
          console.log('Church:', church.value, 'Is Youth Church?', isYouthChurch);
          return isYouthChurch;
        });
        console.log('Youth churches found:', youthChurches);
        return youthChurches;
      } else if (age >= 24 && age <= 30) {
        // 24-30 years - young adult churches
        const youngAdultChurches = allChurches.filter(church => {
          const churchName = church.value.toLowerCase();
          const churchLabel = church.label.toLowerCase();
          
          // Filter churches that are appropriate for young adults (age 24-30)
          const isYoungAdultChurch = churchName.includes('young') || 
                                    churchLabel.includes('young') ||
                                    churchName.includes('youth') ||
                                    churchLabel.includes('youth') ||
                                    churchName.includes('y-elite') ||
                                    churchLabel.includes('y-elite');
          
          console.log('Church:', church.value, 'Is Young Adult Church?', isYoungAdultChurch);
          return isYoungAdultChurch;
        });
        console.log('Young adult churches found:', youngAdultChurches);
        return youngAdultChurches;
      } else {
        // 31 and above - cannot join Youth Council at all
        console.log('Age 31+ cannot join Youth Council churches');
        return [];
      }
    } else {
      // For non-Youth Council units (adult units), show all churches
      console.log('Adult unit - showing all churches');
      return allChurches;
    }
  };

  // Effect to update age and available clubs when date of birth or unit changes
  useEffect(() => {
    if (formData.date_of_birth) {
      const calculatedAge = calculateAge(formData.date_of_birth);
      console.log('Date:', formData.date_of_birth, 'Calculated Age:', calculatedAge);
      
      // Update age in form data
      setFormData(prev => ({
        ...prev,
        age: calculatedAge.toString()
      }));

      // If a unit is selected, update available clubs based on age
      if (formData.unit) {
        const selectedUnit = units.find(unit => unit.value === formData.unit);
        if (selectedUnit) {
          const filteredClubs = getAvailableClubs(calculatedAge, selectedUnit);
          setAvailableClubs(filteredClubs);
          
          // If Council Of Church is selected, also filter churches
          const isCouncilOfChurch = formData.club && (
            formData.club.toLowerCase().includes('council of church') || 
            formData.club.toLowerCase().includes('council') ||
            formData.club.toLowerCase().includes('church')
          );
          
          if (isCouncilOfChurch && selectedUnit.churchDropDown) {
            const filteredChurches = getAvailableChurches(calculatedAge, selectedUnit);
            setAvailableChurches(filteredChurches);
            
            // Clear church if current selection is not available for the calculated age
            const currentChurchValid = filteredChurches.some(church => church.value === formData.churchName);
            if (formData.churchName && !currentChurchValid) {
              setFormData(prev => ({
                ...prev,
                churchName: ''
              }));
            }
          }
          
          // Clear club if current selection is not available for the calculated age
          const currentClubValid = filteredClubs.some(club => club.value === formData.club);
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
      // Reset age if no date of birth
      setFormData(prev => ({
        ...prev,
        age: ''
      }));
      setAvailableClubs([]);
      setAvailableChurches([]);
    }
  }, [formData.date_of_birth, formData.unit, formData.club]);

  const validIdOptions = [
    { value: 'national_id', label: 'National ID' },
    { value: 'international_passport', label: 'International Passport' },
    { value: 'nin_slip', label: 'NIN Slip' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'country' ? { state: '', lga: '' } : {}),
      ...(name === 'state' ? { lga: '' } : {}),
      ...(name === 'unit' ? { club: '', churchName: '' } : {}),
      ...(name === 'club' ? { churchName: '' } : {}),
    }));

    // Update available clubs when unit changes
    if (name === 'unit') {
      const selectedUnit = units.find(unit => unit.value === value);
      
      if (selectedUnit && selectedUnit.dropDown && formData.age) {
        const calculatedAge = parseInt(formData.age);
        const filteredClubs = getAvailableClubs(calculatedAge, selectedUnit);
        setAvailableClubs(filteredClubs);
        
        // Check if selected unit has church dropdown
        if (selectedUnit.churchDropDown) {
          const churchOptions = getAvailableChurches(calculatedAge, selectedUnit);
          setAvailableChurches(churchOptions);
        } else {
          setAvailableChurches([]);
        }
      } else if (selectedUnit && selectedUnit.dropDown) {
        // If no age yet, show all clubs initially
        const allClubs = selectedUnit.dropDown.map((club: any) => {
          const key = Object.keys(club)[0];
          return { value: club[key], label: club[key] };
        });
        setAvailableClubs(allClubs);
        
        // Check if selected unit has church dropdown
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
      const selectedUnit = units.find(unit => unit.value === formData.unit);
      const isCouncilOfChurch = value.toLowerCase().includes('council of church') || 
                                value.toLowerCase().includes('council') ||
                                value.toLowerCase().includes('church');
      
      if (isCouncilOfChurch && selectedUnit && selectedUnit.churchDropDown && formData.age) {
        const calculatedAge = parseInt(formData.age);
        const filteredChurches = getAvailableChurches(calculatedAge, selectedUnit);
        setAvailableChurches(filteredChurches);
      } else if (isCouncilOfChurch && selectedUnit && selectedUnit.churchDropDown) {
        // If no age yet, show all churches initially
        const allChurches = selectedUnit.churchDropDown.map((church: any) => {
          const key = Object.keys(church)[0];
          return { value: church[key], label: church[key] };
        });
        setAvailableChurches(allChurches);
      } else {
        setAvailableChurches([]);
        setFormData(prev => ({ ...prev, churchName: '' }));
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

        // If a unit is already selected, update available clubs based on new age
        if (formData.unit) {
          const selectedUnit = units.find(unit => unit.value === formData.unit);
          if (selectedUnit) {
            const filteredClubs = getAvailableClubs(calculatedAge, selectedUnit);
            setAvailableClubs(filteredClubs);
            
            // If Council Of Church is selected, also update churches
            const isCouncilOfChurch = formData.club && (
              formData.club.toLowerCase().includes('council of church') || 
              formData.club.toLowerCase().includes('council') ||
              formData.club.toLowerCase().includes('church')
            );
            
            if (isCouncilOfChurch && selectedUnit.churchDropDown) {
              const filteredChurches = getAvailableChurches(calculatedAge, selectedUnit);
              setAvailableChurches(filteredChurches);
              
              // Clear church if current selection is not available for new age
              const currentChurchValid = filteredChurches.some(church => church.value === formData.churchName);
              if (formData.churchName && !currentChurchValid) {
                setFormData(prev => ({
                  ...prev,
                  churchName: ''
                }));
              }
            }
            
            // Clear club if current selection is not available for new age
            const currentClubValid = filteredClubs.some(club => club.value === formData.club);
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
        // Reset if date is cleared
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

    // Church name validation when Council Of Church is selected
    const isCouncilOfChurch = formData.club && (
      formData.club.toLowerCase().includes('council of church') || 
      formData.club.toLowerCase().includes('council') ||
      formData.club.toLowerCase().includes('church')
    );
    
    if (isCouncilOfChurch && !formData.churchName) {
      errors.churchName = 'Please select your church';
    }

    // Church validation based on age restrictions
    if (formData.age && formData.churchName && formData.unit && formData.club) {
      const ageNum = parseInt(formData.age);
      const selectedUnit = units.find(unit => unit.value === formData.unit);
      const selectedChurch = availableChurches.find(church => church.value === formData.churchName);
      
      const isCouncilOfChurch = formData.club && (
        formData.club.toLowerCase().includes('council of church') || 
        formData.club.toLowerCase().includes('council') ||
        formData.club.toLowerCase().includes('church')
      );
      
      if (isCouncilOfChurch && selectedUnit) {
        const isYouthCouncil = selectedUnit.value.toLowerCase().includes('youth') || 
                              selectedUnit.label.toLowerCase().includes('youth');
        
        if (isYouthCouncil) {
          if (ageNum <= 23 && selectedChurch) {
            const churchName = selectedChurch.value.toLowerCase();
            const isYouthChurch = !churchName.includes('adult') && 
                                 !churchName.includes('senior');
            if (!isYouthChurch) {
              errors.churchName = 'Age 23 and below can only join youth-appropriate churches';
            }
          } else if (ageNum >= 24 && ageNum <= 30 && selectedChurch) {
            const churchName = selectedChurch.value.toLowerCase();
            const isYoungAdultChurch = churchName.includes('young') || 
                                      churchName.includes('youth') ||
                                      churchName.includes('y-elite');
            if (!isYoungAdultChurch) {
              errors.churchName = 'Age 24-30 can only join young adult churches';
            }
          } else if (ageNum >= 31) {
            errors.churchName = 'Age 31 and above cannot join Youth Council churches';
          }
        }
      }
    }

    // Club validation based on age restrictions
    if (formData.age && formData.club && formData.unit) {
      const ageNum = parseInt(formData.age);
      const selectedUnit = units.find(unit => unit.value === formData.unit);
      const selectedClub = availableClubs.find(club => club.value === formData.club);
      
      const isYouthCouncil = selectedUnit && (
        selectedUnit.value.toLowerCase().includes('youth') || 
        selectedUnit.label.toLowerCase().includes('youth')
      );
      
      if (isYouthCouncil) {
        if (ageNum <= 23) {
          const isHiYClub = selectedClub && (
            selectedClub.value.toLowerCase().includes('hi-y') || 
            selectedClub.label.toLowerCase().includes('hi-y')
          );
          if (!isHiYClub) {
            errors.club = 'Age 23 and below can only join Hi-Y clubs in Youth Council';
          }
        } else if (ageNum >= 24 && ageNum <= 30) {
          const isYEliteClub = selectedClub && (
            selectedClub.value.toLowerCase().includes('y-elite') || 
            selectedClub.label.toLowerCase().includes('y-elite')
          );
          if (!isYEliteClub) {
            errors.club = 'Age 24-30 can only join Y-Elite clubs in Youth Council';
          }
        } else if (ageNum >= 31) {
          errors.club = 'Age 31 and above cannot join Youth Council. Please select an adult unit.';
        }
      }
    }

    // Mark all fields as touched when validating
    const allFields = [
      'firstName', 'lastName', 'phoneNumber', 'country', 'state', 
      'unit', 'club', 'churchName', 'validIdType', 'validIdFile', 'passportPhoto'
    ];
    const newTouchedFields: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(prev => ({ ...prev, ...newTouchedFields }));
    
    setFieldErrors(errors);
    
    // Scroll to first error field if there are errors
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(Object.keys(errors));
    }
    
    return Object.keys(errors).length === 0;
  };

  const scrollToFirstError = (errorFields: string[]) => {
    const fieldOrder = [
      'firstName', 'lastName', 'phoneNumber', 'country', 'state', 
      'unit', 'club', 'churchName', 'validIdType', 'validIdFile', 'passportPhoto', 'signature'
    ];
    
    const firstErrorField = fieldOrder.find(field => errorFields.includes(field));
    
    if (firstErrorField) {
      let fieldElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      
      if (!fieldElement) {
        fieldElement = document.getElementById(firstErrorField) as HTMLElement;
      }
      
      if (!fieldElement && (firstErrorField === 'country' || firstErrorField === 'state' || firstErrorField === 'club' || firstErrorField === 'churchName')) {
        const selectContainer = document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement;
        if (selectContainer) {
          fieldElement = selectContainer;
        }
      }
      
      if (fieldElement) {
        fieldElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
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
      requestData.append('first_name', formData.firstName);
      requestData.append('last_name', formData.lastName);
      requestData.append('email', formData.email);
      requestData.append('phone_number', formData.phoneNumber);
      requestData.append('citizen', formData.citizen);
      requestData.append('country', formData.country);
      requestData.append('state', formData.state);
      requestData.append('lga', formData.lga);
      requestData.append('unit', formData.unit);
      requestData.append('club', formData.club);
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
      requestData.append('valid_id_type', formData.validIdType);
      requestData.append('next_of_kin', formData.nextOfKinName);
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
          nextOfKinName: '',
          nextOfKinNumber: '',
          referralSource: '',
          referralName: '',
          referredBy: 'no',
          churchName: '',
        });
        setPhotoPreview(null);
        setIdPreview(null);
        setSignaturePreview(null);
        setTouchedFields({});
        setAvailableClubs([]);
        setAvailableChurches([]);
        
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
            churchName: 'Church Name',
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
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex justify-center mb-4">
          <Link to={'/'}>
            <img src={ymca} alt="YMCA Lagos Logo" className="h-10 w-auto object-contain" />
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
                  churchName: 'Church Name',
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
              className={getInputBorderColor('firstName', formData.firstName)}
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
              className={getInputBorderColor('lastName', formData.lastName)}
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
              className={getInputBorderColor('email', formData.email)}
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
              className={getInputBorderColor('phoneNumber', formData.phoneNumber)}
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
              className={getInputBorderColor('gender', formData.gender)}
            />

            <FormInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              error={fieldErrors.date_of_birth}
              required
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
              {fieldErrors.citizen && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.citizen}</p>}
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
                  className={`${fieldErrors.country ? "border-red-500" : ""} ${getInputBorderColor('country', formData.country)}`}
                  data-field="country"
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
                  data-field="state"
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
              required
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
                required
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
              required
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Club</label>
                <Select
                  options={availableClubs}
                  value={availableClubs.find(option => option.value === formData.club) || null}
                  onChange={(selectedOption) => {
                    setTouchedFields(prev => ({ ...prev, club: true }));
                    const newClub = selectedOption ? selectedOption.value : '';
                    setFormData({ ...formData, club: newClub, churchName: '' });
                    
                    // Show church dropdown if Council Of Church is selected
                    const isCouncilOfChurch = newClub.toLowerCase().includes('council of church') || 
                                              newClub.toLowerCase().includes('council') ||
                                              newClub.toLowerCase().includes('church');
                    
                    if (isCouncilOfChurch && formData.unit) {
                      const selectedUnit = units.find(unit => unit.value === formData.unit);
                      if (selectedUnit && selectedUnit.churchDropDown && formData.age) {
                        const calculatedAge = parseInt(formData.age);
                        const filteredChurches = getAvailableChurches(calculatedAge, selectedUnit);
                        setAvailableChurches(filteredChurches);
                      } else if (selectedUnit && selectedUnit.churchDropDown) {
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
                  placeholder="Select Club"
                  isSearchable
                  noOptionsMessage={() => "No club found"}
                  className={getInputBorderColor('club', formData.club)}
                />
                {fieldErrors.club && <p className="mt-1 text-sm text-red-600">{fieldErrors.club}</p>}
              </div>
            )}

            {/* Church Name Dropdown - Only show when Council Of Church is selected */}
            {availableChurches.length > 0 && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Church <span className="text-red-500">*</span>
                </label>
                <Select
                  options={availableChurches}
                  value={availableChurches.find(option => option.value === formData.churchName) || null}
                  onChange={(selectedOption) => {
                    setTouchedFields(prev => ({ ...prev, churchName: true }));
                    setFormData({ ...formData, churchName: selectedOption ? selectedOption.value : '' });
                  }}
                  placeholder="Select your church"
                  isSearchable
                  noOptionsMessage={() => "No church found"}
                  className={getInputBorderColor('churchName', formData.churchName)}
                />
                {fieldErrors.churchName && <p className="mt-1 text-sm text-red-600">{fieldErrors.churchName}</p>}
                
                {/* Show age-based church restrictions message */}
                {formData.age && formData.unit && (
                  <p className="text-sm text-blue-600 mt-1">
                    Age {formData.age}: Available churches - {availableChurches.map(church => church.label).join(', ')}
                  </p>
                )}
              </div>
            )}

            {!formData.date_of_birth && (
              <p className="text-sm text-yellow-600 mb-2 col-span-2">
                Please enter your date of birth first to see available clubs and churches
              </p>
            )}

            {formData.age && formData.unit && availableClubs.length > 0 && (
              <p className="text-sm text-blue-600 mb-2 col-span-2">
                Age {formData.age}: Available clubs - {availableClubs.map(club => club.label).join(', ')}
              </p>
            )}

            {formData.age && formData.unit && availableClubs.length === 0 && (
              <p className="text-sm text-red-600 mb-2 col-span-2">
                {formData.unit.toLowerCase().includes('youth')
                  ? formData.age <= 30 
                    ? `No clubs available for age ${formData.age} in Youth Council. Please contact administrator.`
                    : `Age ${formData.age} cannot join Youth Council. Please select an adult unit.`
                  : `No clubs available for age ${formData.age} in this unit. Please select a different unit.`
                }
              </p>
            )}

            {formData.age && (
              <p className="text-sm text-gray-600 mb-2 col-span-2">
                Age restrictions: 
                <br/>• 1-23: Youth Council → Hi-Y club only + Youth churches
                <br/>• 24-30: Youth Council → Y-Elite club only + Young adult churches  
                <br/>• 31+: Adult units (Y's Men, Council Of Church, Central Club, etc.) + All churches
              </p>
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
            required
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
            required
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
            required
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

          <div className="mb-4">
            <label htmlFor="validIdFile" className="block text-gray-700 text-sm font-bold mb-2">
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
              {fieldErrors.validIdFile && <p className="text-red-500 text-sm mt-2">{fieldErrors.validIdFile}</p>}
            </div>
          </div>

          {idPreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">ID Preview:</label>
              <div className="flex justify-center">
                <img src={idPreview} alt="ID document preview" className="w-48 h-32 object-cover border-2 border-gray-300 rounded" />
              </div>
            </div>
          )}
          {formData.validIdFile && !idPreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Uploaded File:</label>
              <p className="text-gray-600">{formData.validIdFile.name}</p>
            </div>
          )}
        </div>

        {/* Photo Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Photo Upload</h3>
          
          <div className="mb-4">
            <label htmlFor="passportPhoto" className="block text-gray-700 text-sm font-bold mb-2">
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
              {fieldErrors.passportPhoto && <p className="text-red-500 text-sm mt-2">{fieldErrors.passportPhoto}</p>}
            </div>
          </div>

          {photoPreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Photo Preview:</label>
              <div className="flex justify-center">
                <img src={photoPreview} alt="Passport photo preview" className="w-32 h-32 object-cover border-2 border-gray-300 rounded" />
              </div>
            </div>
          )}
        </div>

        {/* Signature Upload Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Signature Upload</h3>
          <div className="mb-4">
            <label htmlFor="signature" className="block text-gray-700 text-sm font-bold mb-2">
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
              {fieldErrors.signature && <p className="text-red-500 text-sm mt-2">{fieldErrors.signature}</p>}
            </div>
          </div>

          {signaturePreview && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Signature Preview:</label>
              <div className="flex justify-center">
                <img src={signaturePreview} alt="Signature preview" className="w-48 h-32 object-contain border-2 border-gray-300 rounded" />
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