import { useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
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
  validIdType: string;
  validIdFile: File | null;
  passportPhoto: File | null;
  nextOfKin: string;
  referralSource: string;
  referralName: string;
  referredBy: string;
}

const MetronicMembershipRequestPage = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    citizen: 'Nigerian',
    country: '',
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
    validIdFile: null,
    passportPhoto: null,
    nextOfKin: '',
    referralSource: '',
    referralName: '',
    referredBy: 'no',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full flex justify-center items-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold">Membership Application</h2>
            <p className="text-gray-600">Please fill out the form below</p>
          </div>
          
          <form className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">First Name *</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Last Name *</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Gender *</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                  required 
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Country *</label>
                <input 
                  type="text" 
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">State *</label>
                <input 
                  type="text" 
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">LGA *</label>
                <input 
                  type="text" 
                  name="lga"
                  value={formData.lga}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Unit *</label>
                <input 
                  type="text" 
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Club</label>
                <input 
                  type="text" 
                  name="club"
                  value={formData.club}
                  onChange={handleChange}
                  className="border rounded w-full py-2 px-3" 
                />
              </div>
            </div>

            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full">
              Submit Application
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Already a member? <Link to="/login-metronic" className="text-blue-500 hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetronicMembershipRequestPage;
