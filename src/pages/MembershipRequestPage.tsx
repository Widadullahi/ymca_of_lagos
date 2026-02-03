import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/NewAuthContext';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import { Link, useNavigate } from 'react-router-dom';
import ymca from '../assets/images/image.png';
import { nigerianStates } from '../constants/utils';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { motion } from 'framer-motion';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale/en-GB";
import { format, differenceInYears } from "date-fns";

// Register locale
registerLocale("en-GB", enGB);

// Types
interface UnitOption {
  value: string;
  label: string;
  dropDown?: Array<{ [key: string]: string }>;
  churchDropDown?: Array<{ [key: string]: string }>;
}

interface ClubOption {
  value: string;
  label: string;
}

interface FormData {
  // Personal Info
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  age: string;
  marital_status: string;
  citizen: string;
  
  // Location
  country: string;
  state: string;
  lga: string;
  address: string;
  
  // YMCA Info
  unit: string;
  club: string;
  churchName: string;
  
  // Professional & Religious
  profession: string;
  occupation: string;
  religion: string;
  
  // Identification
  validIdType: string;
  validIdFile: File | null;
  passport_photo: File | null;
  signature: File | null;
  
  // Next of Kin & Referral
  nextOfKinName: string;
  nextOfKinNumber: string;
  referredBy: string;
  referralName: string;
}

// Country options
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

// Unit options - YMCA Lagos Units
const units: UnitOption[] = [
  {
    value: 'Council of Church',
    label: 'Council of Church',
    // dropDown: [{ 'Council of Church': 'Council of Church' }],
    churchDropDown: [
      { "METHODIST CHURCH CATHEDRAL, PALM AVENUE, LAGOS": "METHODIST CHURCH CATHEDRAL, PALM AVENUE, LAGOS" },
      { "ST. JOHN ANG. CHURCH, IJU ISHAGA, LAGOS.": "ST. JOHN ANG. CHURCH, IJU ISHAGA, LAGOS." },
      { "CHRIST ANGLICAN CHURCH, AMUWO ODOFIN, MILE 2, LAGOS.": "CHRIST ANGLICAN CHURCH, AMUWO ODOFIN, MILE 2, LAGOS." },
      { "METHODIST CHURCH NIGERIA, OPEBI, LAGOS.": "METHODIST CHURCH NIGERIA, OPEBI, LAGOS." },
      { "ST. PETER'S ANG. CHURCH, KONGO-AGBADO, LAGOS.": "ST. PETER'S ANG. CHURCH, KONGO-AGBADO, LAGOS." },
      { "METHODIST CHURCH OF NIGERIA, TABON-TABON, AGEGE, LAGOS.": "METHODIST CHURCH OF NIGERIA, TABON-TABON, AGEGE, LAGOS." },
      { "METHODIST CHURCH NIGERIA, FESTAC TOWN, LAGOS.": "METHODIST CHURCH NIGERIA, FESTAC TOWN, LAGOS." },
      { "ST. PETER'S ANG. CHURCH, ABULE EGBA, LAGOS.": "ST. PETER'S ANG. CHURCH, ABULE EGBA, LAGOS." },
      { "ST. DAVIDS ANGLICAN CHURCH LAFIAGI, LAGOS.": "ST. DAVIDS ANGLICAN CHURCH LAFIAGI, LAGOS." },
      { "EBENEZER AFRICAN CHURCH, EGBEDA, LAGOS.": "EBENEZER AFRICAN CHURCH, EGBEDA, LAGOS." },
      { "FIRST BAPTIST CHURCH, IJU, LAGOS.": "FIRST BAPTIST CHURCH, IJU, LAGOS." },
      { "FIRST AFRICAN CHURCH, IPAJA, LAGOS.": "FIRST AFRICAN CHURCH, IPAJA, LAGOS." },
      { "SAVIOUR'S AFRICAN CHURCH, ORILE AGBADO, LAGOS.": "SAVIOUR'S AFRICAN CHURCH, ORILE AGBADO, LAGOS." },
      { "METHODIST CHURCH NIGERIA, ORILE AGEGE, LAGOS.": "METHODIST CHURCH NIGERIA, ORILE AGEGE, LAGOS." },
      { "C & S MOVT. CHURCH WORLWIDE (AMAZING GRACE), IYANA IPAJA, LAGOS.": "C & S MOVT. CHURCH WORLWIDE (AMAZING GRACE), IYANA IPAJA, LAGOS." },
      { "ST. MARY'S ANGLICAN CHURCH, AJASA COMMAND, LAGOS.": "ST. MARY'S ANGLICAN CHURCH, AJASA COMMAND, LAGOS." },
      { "ST. MICHAEL ANG. CHURCH, SUBERU OJE, ALAGBADO, LAGOS.": "ST. MICHAEL ANG. CHURCH, SUBERU OJE, ALAGBADO, LAGOS." },
      { "ST. PETERS ANG. CHURCH, AKUTE, LAGOS.": "ST. PETERS ANG. CHURCH, AKUTE, LAGOS." },
      { "ST. PAUL'S ANG. CHURCH, SANGO AGEGE, LAGOS.": "ST. PAUL'S ANG. CHURCH, SANGO AGEGE, LAGOS." },
      { "WILLIAMS MEMORIAL METHODFIST CHRURCH, EBUTE METTA, LAGOS.": "WILLIAMS MEMORIAL METHODFIST CHRURCH, EBUTE METTA, LAGOS." },
      { "IJERO BAPTIST CHURCH, EBUTE-METTA, LAGOS.": "IJERO BAPTIST CHURCH, EBUTE-METTA, LAGOS." },
      { "ST. STEPHEN ANGLICAN CHURCH, (OWEH) IGBOGI, LAGOS.": "ST. STEPHEN ANGLICAN CHURCH, (OWEH) IGBOGI, LAGOS." },
      { "ALL SAINT ANGLICAN CHURCH, YABA, LAGOS.": "ALL SAINT ANGLICAN CHURCH, YABA, LAGOS." },
      { "AFRICAN CHURCH BETHEL ABULE - OJA, LAGOS.": "AFRICAN CHURCH BETHEL ABULE - OJA, LAGOS." },
      { "AFRICAN BETHEL CHURCH (BINNING MEMORIAL), LAGOS.": "AFRICAN BETHEL CHURCH (BINNING MEMORIAL), LAGOS." },
      { "HOARES MEM. METHODIST CATHEDRAL, YABA, LAGOS.": "HOARES MEM. METHODIST CATHEDRAL, YABA, LAGOS." },
      { "ST. JUDE ANGLICAN CHURCH, EBUTTE META, LAGOS.": "ST. JUDE ANGLICAN CHURCH, EBUTTE META, LAGOS." },
      { "OUR SAVIOUR ANG. CHURCH, ABULE IJESHA, LAGOS.": "OUR SAVIOUR ANG. CHURCH, ABULE IJESHA, LAGOS." },
      { "ST. JOHN'S ANG. CHURCH, ORILE-IGANMU, LAGOS.": "ST. JOHN'S ANG. CHURCH, ORILE-IGANMU, LAGOS." },
      { "HOLY TRINITY ANG. CHURCH, IKATE, LAGOS.": "HOLY TRINITY ANG. CHURCH, IKATE, LAGOS." },
      { "TALABI COKER MEMORIAL METHODIST CHURCH, IJESHA, LAGOS.": "TALABI COKER MEMORIAL METHODIST CHURCH, IJESHA, LAGOS." },
      { "C & S AYO NI O, LAGOS.": "C & S AYO NI O, LAGOS." },
      { "ST. LUKE'S ANGLICAN CHURCH, IJESHATEDO, LAGOS.": "ST. LUKE'S ANGLICAN CHURCH, IJESHATEDO, LAGOS." },
      { "METHODIST CHURCH OF NIGERIA, IJESHATEDO, LAGOS.": "METHODIST CHURCH OF NIGERIA, IJESHATEDO, LAGOS." },
      { "BISHOP ADELAKUN HOWEL MEMORIAL CHURCH (BAHM), LAGOS.": "BISHOP ADELAKUN HOWEL MEMORIAL CHURCH (BAHM), LAGOS." },
      { "EMMANUEL AFRICAN CHURCH, ITIRE, SURULERE, LAGOS.": "EMMANUEL AFRICAN CHURCH, ITIRE, SURULERE, LAGOS." },
      { "ST. PETER'S ANG CHURCH, ISHERI, LAGOS.": "ST. PETER'S ANG CHURCH, ISHERI, LAGOS." },
      { "HOLY TRINITY ANGLICAN CHURCH, AGUDA TITUN- IKEJA, LAGOS.": "HOLY TRINITY ANGLICAN CHURCH, AGUDA TITUN- IKEJA, LAGOS." },
      { "BOLA MEMORIAL ANGLICAN CHURCH, IKEJA, LAGOS.": "BOLA MEMORIAL ANGLICAN CHURCH, IKEJA, LAGOS." },
      { "ARCHBISHOP VINNING MEM. CATH. CHURCH (AVMCC), IKEJA, LAGOS.": "ARCHBISHOP VINNING MEM. CATH. CHURCH (AVMCC), IKEJA, LAGOS." },
      { "HOLY TRINITY ANG. CHURCH, OGBA-ASADE, LAGOS.": "HOLY TRINITY ANG. CHURCH, OGBA-ASADE, LAGOS." },
      { "ST. PETER'S ANG. CHURCH, SHASHA, LAGOS.": "ST. PETER'S ANG. CHURCH, SHASHA, LAGOS." },
      { "METHODIST CHURCH NIGERIA, BARIGA, LAGOS.": "METHODIST CHURCH NIGERIA, BARIGA, LAGOS." },
      { "FIRST BAPTIST CHURCH, BARIGA, LAGOS.": "FIRST BAPTIST CHURCH, BARIGA, LAGOS." },
      { "ST. PAUL'S ANGLICAN CHURCH, SHOMOLU, LAGOS.": "ST. PAUL'S ANGLICAN CHURCH, SHOMOLU, LAGOS." },
      { "CHRIST ANG. CHURCH, OKUTA RD. BARIGA, LAGOS.": "CHRIST ANG. CHURCH, OKUTA RD. BARIGA, LAGOS." },
      { "CHRIST ANG. CHURCH, OKUTA RD. SHOMOLU, LAGOS.": "CHRIST ANG. CHURCH, OKUTA RD. SHOMOLU, LAGOS." },
      { "ST. ANDREW ANGLICAN CHURCH, OKE-POPO, LAGOS.": "ST. ANDREW ANGLICAN CHURCH, OKE-POPO, LAGOS." },
      { "EBENEZER BAPTIST CHURCH, CAMPBELL, LAGOS.": "EBENEZER BAPTIST CHURCH, CAMPBELL, LAGOS." },
      { "HOLY TRINITY ANG. CHURCH, EBUTE - ERO, LAGOS.": "HOLY TRINITY ANG. CHURCH, EBUTE - ERO, LAGOS." },
      { "ST. JOHN ANG. CHURCH, AROLOYA, LAGOS.": "ST. JOHN ANG. CHURCH, AROLOYA, LAGOS." },
      { "ST. PAUL ANG. CHURCH, BREADFRUT, LAGOS.": "ST. PAUL ANG. CHURCH, BREADFRUT, LAGOS." },
      { "ST. PHILLIPS ANG. CHURCH, OMIDIDUN, LAGOS.": "ST. PHILLIPS ANG. CHURCH, OMIDIDUN, LAGOS." },
      { "UNION BAPTIST CHURCH, IGA-IDUGARAN, LAGOS.": "UNION BAPTIST CHURCH, IGA-IDUGARAN, LAGOS." },
      { "AFRICAN BETHEL CHURCH, IKORODU, LAGOS.": "AFRICAN BETHEL CHURCH, IKORODU, LAGOS." },
      { "PATRIACH BOLAJI MEMORIAL METHODIST CATHEDRAL, IKORODU, LAGOS.": "PATRIACH BOLAJI MEMORIAL METHODIST CATHEDRAL, IKORODU, LAGOS." },
      { "CHRIST ANGLICAN CHURCH, ALAPERE-KETU, LAGOS.": "CHRIST ANGLICAN CHURCH, ALAPERE-KETU, LAGOS." },
      { "HOLY TRINITY ANGLICAN CHURCH, AJEGUNLE - IKORODU, LAGOS.": "HOLY TRINITY ANGLICAN CHURCH, AJEGUNLE - IKORODU, LAGOS." },
      { "PRESBYTERIAN CHRURCH OF NIGERIA, IKORODU, LAGOS.": "PRESBYTERIAN CHRURCH OF NIGERIA, IKORODU, LAGOS." },
      { "HOLY TRINITY ANLICAN CHURCH, IJEDE, LAGOS.": "HOLY TRINITY ANLICAN CHURCH, IJEDE, LAGOS." },
      { "HOLY TRINITY ANGLICAN CHURCH, IGBOGBO RD., LAGOS.": "HOLY TRINITY ANGLICAN CHURCH, IGBOGBO RD., LAGOS." },
      { "ANGLICAN CHURCH, IKOSI - KETU, LAGOS.": "ANGLICAN CHURCH, IKOSI - KETU, LAGOS." },
      { "EMMANUEL ANGLICAN CHAPEL, KETU, LAGOS.": "EMMANUEL ANGLICAN CHAPEL, KETU, LAGOS." },
      { "ST. STEPHEN ANGLICAN CHURCH, IKORODU, LAGOS.": "ST. STEPHEN ANGLICAN CHURCH, IKORODU, LAGOS." },
      { "ST. PAUL'S AFRICAN CHURCH, ILUPEJU, LAGOS": "ST. PAUL'S AFRICAN CHURCH, ILUPEJU, LAGOS" },
      { "ST. PAUL'S ANG. CHURCH, IDI-ORO": "ST. PAUL'S ANG. CHURCH, IDI-ORO" },
      { "ST. PETERS ANG. CHURCH, OSODI": "ST. PETERS ANG. CHURCH, OSODI" },
      { "ALL SAINTS ANGLICAN CHURCH, OSODI": "ALL SAINTS ANGLICAN CHURCH, OSODI" },
      { "ST. PAUL'S ANG. CHURCH, MAFOLUKU- OSHODI": "ST. PAUL'S ANG. CHURCH, MAFOLUKU- OSHODI" },
      { "FIRST BAPTIST CHURCH, OSHODI": "FIRST BAPTIST CHURCH, OSHODI" },
      { "ALL SAINT ANG. CHURCH EJIGBO": "ALL SAINT ANG. CHURCH EJIGBO" },
      { "HOLY TRINITY ANGLICAN CHURCH, ILASA- MUSHIN": "HOLY TRINITY ANGLICAN CHURCH, ILASA- MUSHIN" },
      { "ECWA, CHALLENGE": "ECWA, CHALLENGE" },
      { "JEHOVAH MANSION CATHEDRAL MUSHIN": "JEHOVAH MANSION CATHEDRAL MUSHIN" },
      { "METHODIST CHURCH NIGERIA IKORODU ROAD RAILWAY LINE": "METHODIST CHURCH NIGERIA IKORODU ROAD RAILWAY LINE" },
      { "ARAROMI BAPTIST CHURCH, MUSHIN": "ARAROMI BAPTIST CHURCH, MUSHIN" },
      { "ST. JOHN'S CHURCH OF NIGERIA, OFFADA": "ST. JOHN'S CHURCH OF NIGERIA, OFFADA" },
      { "ST. JAMES CHURCH, MOSHALASHI, IDI-ORO": "ST. JAMES CHURCH, MOSHALASHI, IDI-ORO" },
      { "EMMANUEL AFRICAN CHURCH,ODI-OLOWO": "EMMANUEL AFRICAN CHURCH,ODI-OLOWO" },
      { "ST. MICHAEL AFRICAN CHURCH, AKOWONJO": "ST. MICHAEL AFRICAN CHURCH, AKOWONJO" },
      { "SALEM AFRICAN CHURCH, ABEKOKO": "SALEM AFRICAN CHURCH, ABEKOKO" },
      { "ZION AFRICAN CHURCH ALAGBA, IYANA-IPAJA": "ZION AFRICAN CHURCH ALAGBA, IYANA-IPAJA" },
      { "ST. BARNABAS ANGLICAN CHURCH, OKOOBA, AGEGE": "ST. BARNABAS ANGLICAN CHURCH, OKOOBA, AGEGE" },
      { "METHODIST CHURCH NIGERIA AKOWONJO": "METHODIST CHURCH NIGERIA AKOWONJO" },
      { "ST. JOHN ANG. CHURCH, SATELITE TOWN": "ST. JOHN ANG. CHURCH, SATELITE TOWN" },
      { "ST. PAUL'S ANG. CHURCH ISHAGATEDO, ISOLO": "ST. PAUL'S ANG. CHURCH ISHAGATEDO, ISOLO" },
      { "ST. JOHN'S ANG. CHURCH ARAROMI APAPA": "ST. JOHN'S ANG. CHURCH ARAROMI APAPA" },
      { "CHURCH OF THE PENTECOST FESTAC TOWN": "CHURCH OF THE PENTECOST FESTAC TOWN" },
      { "METHODIST CHURCH,ODIOLOWO, MUSHIN": "METHODIST CHURCH,ODIOLOWO, MUSHIN" },
      { "THE SAVIOUR ANGLICAN CHURCH, OKEAFA, ISOLO": "THE SAVIOUR ANGLICAN CHURCH, OKEAFA, ISOLO" }
    ]
  },
  {
    value: 'Youth Council',
    label: 'Youth Council',
    dropDown: [
      { 'Hi-Y Club': 'Hi-Y Club' },
      { 'Y-Elite Club': 'Y-Elite Club' }
    ]
  },
  {
    value: "Y's Men",
    label: "Y's Men",
    // dropDown: [{ "Y's Men Club": "Y's Men Club" }]
  },
  {
    value: 'Central Club',
    label: 'Central Club',
    // dropDown: [{ 'Central Club': 'Central Club' }]
  }
];

const validIdOptions = [
  { value: 'national_id', label: 'National ID' },
  { value: 'international_passport', label: 'International Passport' },
  { value: 'voters_card', label: 'Voters Card' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'others', label: 'Others' },
];

// Mobile-friendly Select component wrapper
const MobileFriendlySelect = (props: any) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <Select
      {...props}
      menuPortalTarget={isMobile ? document.body : undefined}
      menuPosition={isMobile ? "fixed" : "absolute"}
      classNamePrefix="react-select"
      styles={{
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        menu: base => ({ 
          ...base, 
          zIndex: 9999,
          position: isMobile ? 'fixed' : 'absolute',
        }),
        control: base => ({
          ...base,
          minHeight: '44px',
          fontSize: '16px'
        }),
        menuList: base => ({
          ...base,
          maxHeight: isMobile ? '60vh' : '300px'
        })
      }}
    />
  );
};

const RequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { fetchWithAuth, displayNotification } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
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
    churchName: '',
    profession: '',
    occupation: '',
    religion: '',
    validIdType: '',
    validIdFile: null,
    passport_photo: null,
    signature: null,
    nextOfKinName: '',
    nextOfKinNumber: '',
    referredBy: 'no',
    referralName: '',
  });
  
  // UI state
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
  const [availableClubs, setAvailableClubs] = useState<ClubOption[]>([]);
  const [availableChurches, setAvailableChurches] = useState<ClubOption[]>([]);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [ageValidationMessage, setAgeValidationMessage] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const passportPhotoRef = useRef<HTMLInputElement>(null);
  const validIdFileRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent iOS zoom on input focus
  useEffect(() => {
    if (isMobile) {
      const metaViewport = document.querySelector('meta[name="viewport"]');
      const originalContent = metaViewport?.getAttribute('content') || '';
      
      const preventZoom = () => {
        if (metaViewport) {
          metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      };
      
      const restoreZoom = () => {
        if (metaViewport) {
          metaViewport.setAttribute('content', originalContent);
        }
      };
      
      preventZoom();
      
      return () => {
        restoreZoom();
      };
    }
  }, [isMobile]);

  // Calculate age from date of birth
  const calculateAge = useCallback((dateString: string): number => {
    if (!dateString) return 0;
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      return differenceInYears(today, birthDate);
    } catch (error) {
      return 0;
    }
  }, []);

  // Get available clubs based on age and unit - STRICT RULES
  const getAvailableClubs = useCallback((age: number, unitValue: string): ClubOption[] => {
    const unit = units.find(u => u.value === unitValue);
    if (!unit?.dropDown) return [];
    
    const allClubs: ClubOption[] = unit.dropDown.map((club: any) => {
      const key = Object.keys(club)[0];
      return { value: club[key], label: club[key] };
    });
    
    const unitName = unit.label.toLowerCase();
    
    // YOUTH COUNCIL - STRICT AGE RULES
    if (unitName.includes('youth')) {
      // Age 1-23: Only Hi-Y clubs
      if (age >= 1 && age <= 23) {
        return allClubs.filter(club => 
          club.label.toLowerCase().includes('hi-y') || 
          club.label.toLowerCase().includes('hi y')
        );
      }
      // Age 24-30: Only Y-Elite clubs
      else if (age >= 24 && age <= 30) {
        return allClubs.filter(club => 
          club.label.toLowerCase().includes('y-elite') || 
          club.label.toLowerCase().includes('yelite')
        );
      }
      // Age 31+: Cannot join Youth Council at all
      else {
        return [];
      }
    }
    
    // ADULT UNITS (31+ ONLY) - STRICT RULE
    // Y's Men, Central Club, Council of Church require age 31+
    if (unitName.includes("y's men") || unitName.includes('central') || 
        (unitName.includes('council') && unitName.includes('church'))) {
      return age >= 31 ? allClubs : [];
    }
    
    return allClubs;
  }, []);

  // Get available churches (for Council of Church only)
  const getAvailableChurches = useCallback((unitValue: string): ClubOption[] => {
    const unit = units.find(u => u.value === unitValue);
    if (!unit?.churchDropDown) return [];
    
    return unit.churchDropDown.map((church: any) => {
      const key = Object.keys(church)[0];
      return { value: church[key], label: church[key] };
    });
  }, []);

  // Update age when date of birth changes
  useEffect(() => {
    if (formData.date_of_birth) {
      const age = calculateAge(formData.date_of_birth);
      setFormData(prev => ({ ...prev, age: age.toString() }));
    } else {
      setFormData(prev => ({ ...prev, age: '' }));
    }
  }, [formData.date_of_birth, calculateAge]);

  // Update clubs when age or unit changes
  useEffect(() => {
    if (formData.age && formData.unit) {
      const ageNum = parseInt(formData.age);
      const clubs = getAvailableClubs(ageNum, formData.unit);
      setAvailableClubs(clubs);
      
      // Reset club if no longer valid
      if (formData.club && !clubs.some(c => c.value === formData.club)) {
        setFormData(prev => ({ ...prev, club: '', churchName: '' }));
      }
    } else {
      setAvailableClubs([]);
    }
  }, [formData.age, formData.unit, formData.club, getAvailableClubs]);

  // Update churches when Council of Church is selected
  useEffect(() => {
    if (formData.unit && formData.unit.toLowerCase().includes('council of church')) {
      const churches = getAvailableChurches(formData.unit);
      setAvailableChurches(churches);
    } else {
      setAvailableChurches([]);
      if (formData.churchName) {
        setFormData(prev => ({ ...prev, churchName: '' }));
      }
    }
  }, [formData.unit, getAvailableChurches]);

  // Update age validation message
  useEffect(() => {
    if (formData.age && formData.unit) {
      const ageNum = parseInt(formData.age);
      const unit = units.find(u => u.value === formData.unit);
      
      if (!unit) {
        setAgeValidationMessage('');
        return;
      }
      
      const unitName = unit.label;
      
      // Youth Council validation
      if (unitName.includes('Youth Council')) {
        if (ageNum >= 31) {
          setAgeValidationMessage('❌ Age 31+ cannot join Youth Council. Please select Y\'s Men, Central Club, or Council of Church.');
        } else if (ageNum >= 1 && ageNum <= 23) {
          setAgeValidationMessage('✅ Age 1-23 can join Youth Council (Hi-Y clubs only)');
        } else if (ageNum >= 24 && ageNum <= 30) {
          setAgeValidationMessage('✅ Age 24-30 can join Youth Council (Y-Elite clubs only)');
        } else {
          setAgeValidationMessage('❌ Invalid age for Youth Council');
        }
      }
      // Adult units validation (31+ only)
      else if (unitName.includes("Y's Men") || unitName.includes('Central Club') || unitName.includes('Council of Church')) {
        if (ageNum >= 31) {
          setAgeValidationMessage(`✅ Age ${ageNum} can join ${unitName}`);
        } else {
          setAgeValidationMessage(`❌ Age ${ageNum} cannot join ${unitName}. Minimum age is 31.`);
        }
      }
      else {
        setAgeValidationMessage(`✅ Age ${ageNum} can join ${unitName}`);
      }
    } else {
      setAgeValidationMessage('');
    }
  }, [formData.age, formData.unit]);

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setDateOfBirth(date);
    setTouchedFields(prev => ({ ...prev, date_of_birth: true }));
    
    if (date) {
      const isoDate = format(date, 'yyyy-MM-dd');
      const age = calculateAge(isoDate);
      
      setFormData(prev => ({
        ...prev,
        date_of_birth: isoDate,
        age: age.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        date_of_birth: '',
        age: ''
      }));
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    // Clear error for this field
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Select change (for react-select components)
  const handleSelectChange = (name: string, value: string | null) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({ ...prev, [name]: value || '' }));
    
    // Cascade resets
    if (name === 'unit') {
      setFormData(prev => ({ ...prev, club: '', churchName: '' }));
      setAvailableClubs([]);
      setAvailableChurches([]);
    } else if (name === 'club') {
      setFormData(prev => ({ ...prev, churchName: '' }));
    }
  };

  // Handle file upload
  const handleFileChange = (field: 'validIdFile' | 'passport_photo' | 'signature', file: File) => {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setFieldErrors(prev => ({ ...prev, [field]: 'File must be JPEG, JPG, PNG, or PDF' }));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, [field]: 'File size must be less than 10MB' }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: file }));
    
    // Create preview for images only
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'passport_photo') setPhotoPreview(result);
        else if (field === 'validIdFile') setIdPreview(result);
        else if (field === 'signature') setSignaturePreview(result);
      };
      reader.readAsDataURL(file);
    }
    
    // Clear error
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const ageNum = parseInt(formData.age);
    
    // Basic required fields
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.phone_number.trim()) errors.phone_number = 'Phone number is required';
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.validIdType) errors.validIdType = 'ID type is required';
    if (!formData.validIdFile) errors.validIdFile = 'ID document is required';
    if (!formData.passport_photo) errors.passport_photo = 'Passport photo is required';
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // Phone validation
    if (formData.phone_number && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone_number)) {
      errors.phone_number = 'Invalid phone number';
    }
    
    // Age-based unit validation - STRICT RULES
    if (formData.unit && formData.age) {
      const unitName = formData.unit.toLowerCase();
      
      // Youth Council rules
      if (unitName.includes('youth')) {
        if (ageNum >= 31) {
          errors.unit = '❌ Age 31+ cannot join Youth Council. Please select Y\'s Men, Central Club, or Council of Church.';
        } else if (ageNum >= 1 && ageNum <= 23 && formData.club && 
                   !formData.club.toLowerCase().includes('hi-y') && 
                   !formData.club.toLowerCase().includes('hi y')) {
          errors.club = '❌ Ages 1-23 can only select Hi-Y clubs in Youth Council';
        } else if (ageNum >= 24 && ageNum <= 30 && formData.club && 
                   !formData.club.toLowerCase().includes('y-elite') && 
                   !formData.club.toLowerCase().includes('yelite')) {
          errors.club = '❌ Ages 24-30 can only select Y-Elite clubs in Youth Council';
        }
      }
      // Adult units rules (31+ only)
      else if ((unitName.includes("y's men") || unitName.includes('central') || 
                (unitName.includes('council') && unitName.includes('church'))) && 
                ageNum < 31) {
        const unitDisplay = formData.unit;
        errors.unit = `❌ Age ${ageNum} cannot join ${unitDisplay}. Minimum age is 31.`;
      }
    }
    
    // Club validation
    if (availableClubs.length > 0 && !formData.club) {
      errors.club = 'Club selection is required';
    }
    
    // Church validation for Council of Church
    if (formData.unit.toLowerCase().includes('council of church') && !formData.churchName) {
      errors.churchName = 'Church selection is required for Council of Church';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(fieldErrors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });
      
      await fetchWithAuth({
        method: 'POST',
        path: '/requests/',
        body: formDataToSend,
        isFormData: true,
      });
      
      // Show success
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setFormData({
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
          churchName: '',
          profession: '',
          occupation: '',
          religion: '',
          validIdType: '',
          validIdFile: null,
          passport_photo: null,
          signature: null,
          nextOfKinName: '',
          nextOfKinNumber: '',
          referredBy: 'no',
          referralName: '',
        });
        setDateOfBirth(null);
        setPhotoPreview(null);
        setIdPreview(null);
        setSignaturePreview(null);
        setTouchedFields({});
        setAvailableClubs([]);
        setAvailableChurches([]);
        setAgeValidationMessage('');
        
        // Clear file inputs
        if (passportPhotoRef.current) passportPhotoRef.current.value = '';
        if (validIdFileRef.current) validIdFileRef.current.value = '';
        if (signatureRef.current) signatureRef.current.value = '';
      }, 3000);
      
    } catch (error: any) {
      console.error('Submission error:', error);
      displayNotification(
        error.response?.data?.message || 'Submission failed. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // File upload component
  const FileUploadField = ({
    field,
    label,
    required = false,
    preview,
    accept = "image/jpeg,image/jpg,image/png,application/pdf",
    dragActiveKey,
    fileRef,
  }: {
    field: 'validIdFile' | 'passport_photo' | 'signature';
    label: string;
    required?: boolean;
    preview: string | null;
    accept?: string;
    dragActiveKey: keyof typeof dragActive;
    fileRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && '*'}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragActive[dragActiveKey] 
            ? 'border-blue-500 bg-blue-50' 
            : fieldErrors[field] 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(prev => ({ ...prev, [dragActiveKey]: true }));
        }}
        onDragLeave={() => setDragActive(prev => ({ ...prev, [dragActiveKey]: false }))}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(prev => ({ ...prev, [dragActiveKey]: false }));
          const file = e.dataTransfer.files[0];
          if (file) handleFileChange(field, file);
        }}
      >
        <input
          type="file"
          ref={fileRef}
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(field, file);
          }}
        />
        <div className="flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011.9 9.903M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-2 transition-colors"
          >
            Choose File
          </button>
          <p className="text-sm text-gray-600">
            {formData[field] 
              ? `Selected: ${(formData[field] as File).name}` 
              : 'Drag & drop or click to browse'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Accepted: JPEG, JPG, PNG, PDF (Max 10MB)
          </p>
        </div>
      </div>
      {fieldErrors[field] && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors[field]}</p>
      )}
      {preview && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-1">Preview:</p>
          <img src={preview} alt={`${label} preview`} className="max-h-40 mx-auto rounded border" />
        </div>
      )}
    </div>
  );

  // Get input border color based on validation
  const getInputBorderColor = (fieldName: string, value: any) => {
    if (touchedFields[fieldName]) {
      if (fieldErrors[fieldName]) {
        return 'border-red-500 focus:border-red-500 focus:ring-red-500';
      } else if (value && value.toString().trim() !== '') {
        return 'border-green-500 focus:border-green-500 focus:ring-green-500';
      }
    }
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-10 px-2 flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Add mobile-specific styles */}
      <style jsx global>{`
        /* Prevent iOS zoom on input focus */
        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
          
          .react-select__control {
            min-height: 44px !important;
          }
          
          .react-select__menu {
            z-index: 9999 !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 90vw !important;
            max-width: 400px !important;
            max-height: 60vh !important;
            overflow-y: auto !important;
          }
          
          .react-datepicker-popper {
            z-index: 9999 !important;
          }
          
          .react-datepicker {
            font-size: 14px !important;
          }
          
          .react-datepicker__input-container input {
            font-size: 16px !important;
          }
        }
        
        /* Ensure form doesn't overflow on mobile */
        @media screen and (max-width: 640px) {
          .form-container {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .grid-cols-1 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

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
            className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center border-t-8 border-green-400"
          >
            <svg className="w-16 h-16 text-green-500 mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Application Submitted Successfully!</h2>
            <p className="text-gray-700">Thank you for joining YMCA Lagos. We will contact you soon.</p>
          </motion.div>
        </div>
      )}

      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl px-4 md:px-8 pt-8 pb-10 mb-8 border border-gray-100 form-container"
        style={{ 
          position: 'relative',
          zIndex: 1,
          overflow: 'visible'
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Submit Application</h2>

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
              <h3 className="font-semibold text-red-800">Please correct the following:</h3>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(fieldErrors).map(([field, error]) => (
                <li key={field} className="text-red-600">
                  {error}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Section Divider: Personal Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b-2 border-gray-200 pb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="First Name *"
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
              label="Last Name *"
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
              label="Phone Number *"
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

            {/* Date of Birth with British Format DatePicker */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date of Birth *
              </label>
              <DatePicker
                selected={dateOfBirth}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                locale="en-GB"
                placeholderText="DD/MM/YYYY"
                className={`shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${getInputBorderColor('date_of_birth', formData.date_of_birth)}`}
                required
                showYearDropdown
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                maxDate={new Date()}
                isClearable
                onBlur={() => setTouchedFields(prev => ({ ...prev, date_of_birth: true }))}
              />
              
              {fieldErrors.date_of_birth && (
                <p className="text-red-500 text-xs italic mt-1">{fieldErrors.date_of_birth}</p>
              )}
            </div>

            {/* Age field - read only, automatically calculated */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Age *</label>
              <input
                type="text"
                name="age"
                value={formData.age || ''}
                readOnly
                className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 bg-gray-100 cursor-not-allowed"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {formData.citizen === 'Foreigner' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <MobileFriendlySelect
                  options={countries}
                  value={formData.country ? countries.find(option => option.value === formData.country) || { value: formData.country, label: formData.country } : null}
                  onChange={(selectedOption: any) => {
                    setTouchedFields(prev => ({ ...prev, country: true }));
                    setFormData({ ...formData, country: selectedOption ? selectedOption.value : '' });
                  }}
                  onCreateOption={(inputValue: string) => {
                    setTouchedFields(prev => ({ ...prev, country: true }));
                    setFormData({ ...formData, country: inputValue });
                  }}
                  placeholder="Select or type a country"
                  isSearchable
                  noOptionsMessage={() => "No country found"}
                  formatCreateLabel={(inputValue: string) => `Create "${inputValue}"`}
                  className={getInputBorderColor('country', formData.country)}
                />
                {fieldErrors.country && <p className="mt-1 text-sm text-red-600">{fieldErrors.country}</p>}
              </div>
            )}
            
            {formData.citizen === 'Nigerian' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <MobileFriendlySelect
                  options={nigerianStates}
                  value={nigerianStates.find(option => option.value === formData.state) || null}
                  onChange={(selectedOption: any) => {
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
          </div>

          {/* Address */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              onBlur={() => setTouchedFields(prev => ({ ...prev, address: true }))}
              placeholder="Enter your full residential address"
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${getInputBorderColor('address', formData.address)}`}
              required
            />
            {fieldErrors.address && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
            )}
          </div>
        </div>

        {/* Section Divider: YMCA Unit Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b-2 border-gray-200 pb-2">YMCA Unit Selection</h3>
          
          {/* Unit Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit *
            </label>
            <MobileFriendlySelect
              options={units}
              value={units.find(u => u.value === formData.unit)}
              onChange={(option: any) => handleSelectChange('unit', option?.value)}
              placeholder="Select a unit"
              className={getInputBorderColor('unit', formData.unit)}
            />
            {fieldErrors.unit && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.unit}</p>
            )}
          </div>

          {/* Age Validation Message */}
          {ageValidationMessage && (
            <div className={`mb-4 p-3 rounded-md ${ageValidationMessage.includes('❌') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm ${ageValidationMessage.includes('❌') ? 'text-red-700' : 'text-green-700'}`}>
                {ageValidationMessage}
              </p>
            </div>
          )}

          {/* Club Selection - only show when clubs are available */}
          {availableClubs.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Club *
              </label>
              <MobileFriendlySelect
                options={availableClubs}
                value={availableClubs.find(c => c.value === formData.club)}
                onChange={(option: any) => handleSelectChange('club', option?.value)}
                placeholder="Select a club"
                className={getInputBorderColor('club', formData.club)}
              />
              {fieldErrors.club && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.club}</p>
              )}
              
              {/* Club Info Message */}
              {formData.age && formData.unit && formData.unit.includes('Youth Council') && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  {(() => {
                    const ageNum = parseInt(formData.age);
                    if (ageNum >= 1 && ageNum <= 23) {
                      return 'For ages 1-23: Please select a Hi-Y club';
                    } else if (ageNum >= 24 && ageNum <= 30) {
                      return 'For ages 24-30: Please select a Y-Elite club';
                    }
                    return '';
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Church Selection - only for Council of Church */}
          {formData.unit.toLowerCase().includes('council of church') && availableChurches.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Church *
              </label>
              <MobileFriendlySelect
                options={availableChurches}
                value={availableChurches.find(c => c.value === formData.churchName)}
                onChange={(option: any) => handleSelectChange('churchName', option?.value)}
                placeholder="Select your church"
                className={getInputBorderColor('churchName', formData.churchName)}
              />
              {fieldErrors.churchName && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.churchName}</p>
              )}
            </div>
          )}

          {/* No Clubs Available Message */}
          {formData.age && formData.unit && availableClubs.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                {(() => {
                  const ageNum = parseInt(formData.age);
                  const unit = units.find(u => u.value === formData.unit);
                  
                  if (unit?.label.includes('Youth Council')) {
                    if (ageNum >= 31) {
                      return 'Youth Council is only for ages 1-30. Please select a different unit.';
                    } else {
                      return 'No clubs available for your age group. Please contact administration.';
                    }
                  } else if (unit && (unit.label.includes("Y's Men") || unit.label.includes('Central Club') || unit.label.includes('Council of Church'))) {
                    if (ageNum < 31) {
                      return 'This unit requires age 31 or older. Please select Youth Council or contact administration.';
                    }
                  }
                  ;
                })()}
              </p>
            </div>
          )}

          {/* Age Guidance Info */}
          {formData.age && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="font-semibold text-gray-800 mb-2">Age Guidance:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Youth Council (1-30 years):</strong></li>
                <li className="ml-4">- Ages 1-23: Hi-Y clubs only</li>
                <li className="ml-4">- Ages 24-30: Y-Elite clubs only</li>
                <li>• <strong>Y's Men:</strong> Age 31+ only</li>
                <li>• <strong>Central Club:</strong> Age 31+ only</li>
                <li>• <strong>Council of Church:</strong> Age 31+ only</li>
              </ul>
            </div>
          )}
        </div>

        {/* Section Divider: Next of Kin & Referral */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b-2 border-gray-200 pb-2">Next of Kin & Referral</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Next of Kin Name"
              name="nextOfKinName"
              type="text"
              placeholder="Next of Kin's Name"
              value={formData.nextOfKinName}
              onChange={handleInputChange}
              error={fieldErrors.nextOfKinName}
              className={getInputBorderColor('nextOfKinName', formData.nextOfKinName)}
            />

            <FormInput
              label="Next of Kin Phone No"
              name="nextOfKinNumber"
              type="text"
              placeholder="Next of Kin's Phone Number"
              value={formData.nextOfKinNumber}
              onChange={handleInputChange}
              error={fieldErrors.nextOfKinNumber}
              className={getInputBorderColor('nextOfKinNumber', formData.nextOfKinNumber)}
            />

            <div className="md:col-span-2">
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
                <div className="mt-4">
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Divider: Identification */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b-2 border-gray-200 pb-2">Identification</h3>
          
          <FormSelect
            label="Valid ID Type *"
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
            label="ID Document *"
            required={true}
            preview={idPreview}
            dragActiveKey="validIdFile"
            fileRef={validIdFileRef}
          />
        </div>

        {/* Section Divider: Photo Upload */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b-2 border-gray-200 pb-2">Photo Upload</h3>
          
          <FileUploadField
            field="passport_photo"
            label="Passport Photo *"
            required={true}
            preview={photoPreview}
            dragActiveKey="passport_photo"
            fileRef={passportPhotoRef}
          />
        </div>

        {/* Section Divider: Signature Upload */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b-2 border-gray-200 pb-2">Signature Upload</h3>
          
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
            className={`w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold py-4 px-4 rounded-lg focus:outline-none focus:shadow-outline transform transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting Application...
              </span>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Important Notes:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure all information provided is accurate and up-to-date</li>
            <li>• Your passport photo should be recent and clearly show your face</li>
            <li>• Valid ID document will be verified as part of the process</li>
            <li>• You will receive a confirmation once your application is processed</li>
            <li>• <strong>STRICT AGE RULES:</strong></li>
            <li className="ml-4">- Youth Council: Ages 1-30 only (1-23: Hi-Y, 24-30: Y-Elite)</li>
            <li className="ml-4">- Y's Men, Central Club, Council of Church: Age 31+ only</li>
            <li>• Date format: British format (DD/MM/YYYY)</li>
          </ul>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            className="inline-block align-baseline font-bold text-sm text-red-600 hover:text-red-800 transition-colors"
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Already have an account? Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
