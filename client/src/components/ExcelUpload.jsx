import React, { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ExcelUpload = ({ type, title, endpoint, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus(null);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');

        try {
            const res = await axios.post(`http://localhost:5000/api/principal/${endpoint}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatus('success');
            setMessage(res.data.message);
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/principal/download-template/${type}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_template.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Error downloading template');
        }
    };

    return (
        <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-8 transition-colors hover:border-indigo-500">
                <Upload className="w-12 h-12 text-slate-500 mb-4" />
                <p className="text-slate-400 mb-4">Upload .xlsx or .xls file</p>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id={`file-upload-${type}`}
                />
                <label
                    htmlFor={`file-upload-${type}`}
                    className="cursor-pointer bg-slate-800 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-700 transition-all border border-slate-700"
                >
                    {file ? file.name : 'Select File'}
                </label>
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Start Upload'}
            </button>

            <button
                onClick={handleDownloadTemplate}
                className="block w-full text-center mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors underline bg-transparent border-none cursor-pointer"
            >
                Download Empty Template
            </button>

            {status && (
                <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm">{message}</span>
                </div>
            )}
        </div>
    );
};

export default ExcelUpload;
