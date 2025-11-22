import React, { useState } from 'react'
import { PasswordReset } from '../types/types';
import { useAuth } from '../context/NewAuthContext';

const PasswordChange: React.FC  = () =>{
    
    const { fetchWithAuth, displayNotification } = useAuth(); 
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isProfileUpdating, setIsProfileUpdating] = useState(false);
    const [modalOpen, setModalOpen] = useState<Boolean>(false);
    const [passwordForm, setPasswordForm] = useState<PasswordReset>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    // Validate password form
  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
    };

    // Handle password form changes
      const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
          ...prev,
          [name]: value
        }));
      };


    const handlePasswordFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validatePasswordForm()) {
          setModalOpen(true);
        }
    };

    // Handle password reset after confirmation
    const handlePasswordReset = async () => {
        try {
            setIsProfileUpdating(true)
        // Implement actual API call
        await fetchWithAuth({
            method: 'POST',
            path: '/account/change-password/',
            body: {
            current_password: passwordForm.currentPassword,
            new_password: passwordForm.newPassword,
            confirm_new_password: passwordForm.newPassword
            }
        });
        
        // setIsChangingPassword(false);
        setModalOpen(false);
        displayNotification?.('success','Password changed successfully');
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        } catch (error) {
        console.error('Error changing password:', error);
        // displayNotification?.('error','Failed to change password');
        }finally{
            setIsProfileUpdating(false)
            setModalOpen(false);

        }
    };


    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Change Password</h2>
                </div>
                
                <form onSubmit={handlePasswordFormSubmit}>
                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            formErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        />
                        {formErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.currentPassword}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        />
                        {formErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        />
                        {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                        )}
                    </div>
                    </div>
                    
                    <div className="mt-6">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Update Password
                    </button>
                    </div>
                </form>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
                    <h3 className="text-sm font-medium text-yellow-800">Password requirements:</h3>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                    <li>Minimum 8 characters long</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                    </ul>
                </div>
            </div>

            {/* Password Update Confirmation Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-4">Confirm Password Update</h3>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to update your password? You will be logged out of all devices except this one.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                        Cancel
                        </button>
                        <button
                        type="button"
                        disabled={isProfileUpdating}
                        onClick={handlePasswordReset}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                        {isProfileUpdating ? "Updating..." : "Confirm Update"}
                        </button>
                    </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default PasswordChange