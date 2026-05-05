import React from 'react';
import IDCardGenerator from '../../IDCardGenerator';
import { Member } from '../../../types/types';

interface ViewIDCardModalProps {
    isOpen: boolean;
    closeModal: () => void;
    member: Member | null;
}

const ViewIDCardModal: React.FC<ViewIDCardModalProps> = ({ isOpen, closeModal, member }) => {
    if (!isOpen || !member) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative my-8 max-h-[90vh] overflow-hidden">
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20 bg-white rounded-full p-1 shadow-sm"
                    aria-label="Close modal"
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6 overflow-y-auto max-h-[90vh]">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                        Membership Card
                    </h3>
                    <IDCardGenerator member={member} isAdminView={true} />
                </div>
            </div>
        </div>
    );
};

export default ViewIDCardModal;
