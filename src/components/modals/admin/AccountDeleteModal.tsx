//@ts-nocheck
import React from 'react'

const AccountDeleteModal: React.FC = ({deleteConfirmText,setDeleteConfirmText,setModalOpen,handleDeleteAccount}) => {
    

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                    <h3 className="text-lg font-semibold mb-2 text-red-600">Delete Account</h3>
                    <p className="text-gray-600 mb-4">
                    This action is <span className="font-bold">permanent and irreversible</span>. All your data, posts, and personal information will be permanently deleted.
                    </p>
                    <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type "DELETE" to confirm
                    </label>
                    <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    </div>
                    <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => {
                        setModalOpen(false);
                        setDeleteConfirmText('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE'}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
                    >
                        Delete Permanently
                    </button>
                    </div>
                </div>
            </div>
        </>
    )
}


export default AccountDeleteModal;