import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/NewAuthContext';
import { Member } from '../../../types/types';

interface EditMemberModalProps {
  isOpen: boolean;
  closeModal: () => void;
  member: Member;
  onUpdateMember: () => void;
  churches: { value: string; label: string }[];
  youthGroups: { value: string; label: string }[];
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  closeModal,
  member,
  onUpdateMember,
  churches,
  youthGroups
}) => {
  const { fetchWithAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    other_names: '',
    email: '',
    phone_number: '',
    gender: '',
    marital_status: '',
    nationality: '',
    profession: '',
    religion: '',
    denomination: '',
    unit: '',
    church: '',
    youth_council_group: '',
    membership_category: '',
    is_active: true
  });

  // Populate form with member data when modal opens
  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        other_names: member.other_names || '',
        email: member.email || '',
        phone_number: member.phone_number || '',
        gender: member.gender || '',
        marital_status: member.marital_status || '',
        nationality: member.nationality || '',
        profession: member.profession || '',
        religion: member.religion || '',
        denomination: member.denomination || '',
        unit: member.unit || '',
        church: member.church?.id || '',
        youth_council_group: member.youth_council_group?.id || '',
        membership_category: member.membership_category || 'Full Membership',
        is_active: member.is_active
      });
    }
  }, [member, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare data for submission
      const submitData = { ...formData };
      
      // Handle church and youth group IDs
      if (submitData.unit !== 'Council of Church') {
        submitData.church = '';
      }
      if (submitData.unit !== 'Youth Council') {
        submitData.youth_council_group = '';
      }

      const response = await fetchWithAuth({
        method: 'PUT',
        path: `/admin/members/${member.id}/update`,
        body: submitData
      });

      if (response) {
        onUpdateMember();
        closeModal();
        // You might want to show a success message here
      }
    } catch (error) {
      console.error('Error updating member:', error);
      // You might want to show an error message here
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Edit Member: {member.first_name} {member.last_name}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>


                </div>

                {/* YMCA Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">YMCA Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Membership Category</label>
                    <select
                      name="membership_category"
                      value={formData.membership_category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="Full Membership">Full Membership</option>
                      <option value="Honorary Membership">Honorary Membership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit *</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select Unit</option>
                      <option value="Council of Church">Council of Church</option>
                      <option value="Youth Council">Youth Council</option>
                      <option value="Y's Men">Y's Men</option>
                      <option value="Central Club">Central Club</option>
                    </select>
                  </div>

                  {formData.unit === 'Council of Church' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Church *</label>
                      <select
                        name="church"
                        value={formData.church}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Church</option>
                        {churches.map(church => (
                          <option key={church.value} value={church.value}>
                            {church.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.unit === 'Youth Council' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Youth Group *</label>
                      <select
                        name="youth_council_group"
                        value={formData.youth_council_group}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Youth Group</option>
                        {youthGroups.map(group => (
                          <option key={group.value} value={group.value}>
                            {group.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="is_active"
                      value={formData.is_active.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                </div>
              </div>


            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Member'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMemberModal;
