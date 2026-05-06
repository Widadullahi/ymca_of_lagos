import { useState } from "react";
import { useAuth } from "../../../context/NewAuthContext";

// Bulk Upload Modal Component
const BulkUploadModal: React.FC<{
    isOpen: boolean;
    closeModal: () => void;
    onUploadMembers: () => void;
}> = ({ isOpen, closeModal, onUploadMembers }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    
    const { fetchWithAuth, displayNotification } = useAuth();
    
    if (!isOpen) return null;
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            const isCsvFile = selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv');
            const isExcelFile =
                selectedFile.name.endsWith('.xlsx') ||
                selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            if (!isCsvFile && !isExcelFile) {
                displayNotification('error','Please upload a CSV or Excel (.xlsx) file');
                setFile(null);
                setPreviewData([]);
                return;
            }
            
            setFile(selectedFile);

            if (!isCsvFile) {
                setPreviewData([]);
                return;
            }
            
            // Read file and generate preview
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const csvData = event.target?.result as string;
                    const rows = csvData.split('\n');
                    const headers = rows[0].split(',').map(header => header.trim());
                    
                    const previewMembers = rows.slice(1, 6).map(row => {
                        const values = row.split(',').map(value => value.trim());
                        const member: any = {};
                        
                        headers.forEach((header, index) => {
                            if (values[index]) {
                                member[header] = values[index];
                            }
                        });
                        
                        return member;
                    });
                    
                    setPreviewData(previewMembers.filter(member => 
                        member.name || member.firstName || member.lastName || member.first_name || member.last_name
                    ));
                } catch (err) {
                    displayNotification('error','Error parsing CSV file');
                    setPreviewData([]);
                }
            };
            
            reader.onerror = () => {
                displayNotification('error','Error reading file');
                setPreviewData([]);
            };
            
            reader.readAsText(selectedFile);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!file) {
            displayNotification('error','Please select a CSV or Excel file');
            return;
        }
        
        try {
            setIsUploading(true);
            
            // Create FormData to send file to backend
            const formData = new FormData();
            formData.append('file', file);
            
            // Send file to backend using fetchWithAuth
            const response = await fetchWithAuth({
                method: 'POST',
                path: '/admin/members/upload',
                body: formData,
                isFormData: true, // Important flag to ensure correct handling of FormData
            });
            displayNotification("success", response.message || "Members uploaded successfully");
            closeModal();
            onUploadMembers()
        } catch (error) {
            console.error('Error uploading members:', error);
            displayNotification('error',error instanceof Error ? error.message : 'An error occurred while uploading members');
            setIsUploading(false);
        } finally {
            setIsUploading(false);
        }
    };
    
    
    // Function to handle drag and drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            
            const isCsvFile = droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv');
            const isExcelFile =
                droppedFile.name.endsWith('.xlsx') ||
                droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            if (!isCsvFile && !isExcelFile) {
                displayNotification('error','Please upload a CSV or Excel (.xlsx) file');
                return;
            }
            
            // Set file and trigger the same logic as file input
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) {
                // Create a DataTransfer object to set files property
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(droppedFile);
                fileInput.files = dataTransfer.files;
                
                // Trigger change event manually
                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        }
    };
    
    const handleDownloadTemplate = async (e: React.MouseEvent) => {
        e.preventDefault();

        try {
            const blob = await fetchWithAuth({
                method: 'GET',
                path: '/admin/members/upload/template/',
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'member_bulk_upload_template.xlsx';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            displayNotification('error', error instanceof Error ? error.message : 'Unable to download template');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold">Bulk Upload Members</h2>
                        <button
                            onClick={closeModal}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">
                                Upload a CSV or Excel file containing member information. Only name, email, and phone number are compulsory. The Excel template keeps the unit column to the 4 main YMCA units, and bulk-uploaded members will complete the rest of their registration on first login.
                            </p>
                            
                            <div 
                                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center"
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={handleDrop}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-center">
                                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="fileInput" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                            <span>Upload a CSV or Excel file</span>
                                            <input 
                                                id="fileInput" 
                                                name="fileInput" 
                                                type="file" 
                                                accept=".csv,.xlsx" 
                                                className="sr-only"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">CSV or XLSX up to 10MB</p>
                                </div>
                            </div>
                            
                            {file && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700">
                                        Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {previewData.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-2">Preview (first 5 CSV records)</h3>
                                <div className="overflow-x-auto border rounded-md">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {Object.keys(previewData[0]).map((header) => (
                                                    <th 
                                                        key={header}
                                                        scope="col" 
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {previewData.map((member, index) => (
                                                <tr key={index}>
                                                    {Object.values(member).map((value: any, valueIndex) => (
                                                        <td 
                                                            key={valueIndex}
                                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                                        >
                                                            {value}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-6">
                            <a 
                                href="#" 
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                onClick={handleDownloadTemplate}
                            >
                                Download Excel template
                            </a>
                        </div>
                        
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                disabled={isUploading || !file}
                            >
                                {isUploading ? (
                                      <span className="flex items-center">
                                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Uploading...
                                      </span>
                                  ) : (
                                      'Upload Members'
                                  )}
                            </button>
                          </div>
                        </form>

                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="text-sm text-gray-500">
                                <h4 className="font-medium text-gray-700 mb-2">Upload Format Information:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Required columns: name, email, phoneNumber</li>
                                <li>All other columns can be left empty</li>
                                <li>Membership type options: Full Member, Ordinary Member, Honorary Member, Life Member</li>
                                <li>Unit options: Council of Church, Youth Council, Y's Men, Central Club</li>
                                <li>ID numbers are assigned automatically by the system during upload</li>
                                <li>expiryDate is optional and should use the format YYYY-MM-DD</li>
                                <li>Card status is derived automatically from expiryDate, so the template no longer includes a separate status column</li>
                                <li>Bulk-uploaded members will complete date of birth, final unit placement, valid ID, passport photo, and signature on first login</li>
                                <li>The Excel template is recommended because it includes dropdown lists from the system</li>
                            </ul>
                        </div>
                    </div>
                  </div>
                </div>
        </div>
  );
  };


export default BulkUploadModal;
