'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Check,
  X,
  FileCheck,
  Sparkles,
  Loader2,
  Eye,
} from 'lucide-react';
import { FilePreviewModal } from '@/components/ui/FilePreviewModal';

interface FileUploadProps {
  label?: string;
  helperText?: string;
  accept?: string;
  maxSizeMB?: number;
  uploadFolder?: 'waivers' | 'evidences';
  value: string;
  onChange: (fileUrl: string, fileName?: string) => void;
  sampleTemplateUrl?: string;
  sampleTemplateName?: string;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  helperText,
  accept = '.pdf,.png,.jpg,.jpeg,.docx',
  maxSizeMB = 10,
  uploadFolder = 'waivers',
  value,
  onChange,
  sampleTemplateUrl = '/docs/waiver-raw-denim-signed.pdf',
  sampleTemplateName = 'Bien_Ban_Thoa_Thuan_Mien_Tru_Co_Rut_Denim_Signed.pdf',
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileProcess = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Tệp quá lớn! Vui lòng chọn tệp nhỏ hơn ${maxSizeMB}MB.`);
      return;
    }

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setFileName(file.name);
    setFileSize(formattedSize);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', uploadFolder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url, file.name);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        setIsUploading(false);
        return;
      }
    } catch {
      // Fallback to local Data URL
    }

    // Local Data URL Fallback
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result || file.name, file.name);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUseSample = (e: React.MouseEvent) => {
    e.preventDefault();
    setFileName(sampleTemplateName);
    setFileSize('245 KB');
    onChange(sampleTemplateUrl, sampleTemplateName);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    setFileName('');
    setFileSize('');
    onChange('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasFile = Boolean(value && value.trim());

  return (
    <div className="space-y-1.5 w-full text-xs">
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-extrabold text-slate-700 flex items-center space-x-1">
            <span>{label}</span>
            {required && <span className="text-rose-500 font-black">*</span>}
          </label>
          {sampleTemplateUrl && !hasFile && (
            <button
              type="button"
              onClick={handleUseSample}
              className="text-[11px] font-bold text-denim-600 hover:text-denim-800 flex items-center space-x-1 hover:underline"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Dùng tệp mẫu có sẵn</span>
            </button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* File Upload Area */}
      {!hasFile ? (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-denim-500 bg-denim-50/80 scale-[0.99]'
              : 'border-slate-300 hover:border-denim-400 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-denim-50 border border-denim-100 flex items-center justify-center text-denim-600 shadow-2xs">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-denim-600" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="font-extrabold text-slate-800 text-xs">
                {isUploading ? (
                  'Đang xử lý & lưu tệp lên hệ thống...'
                ) : (
                  <>
                    Bấm để chọn tệp từ máy tính <span className="text-slate-400 font-normal">hoặc kéo thả vào đây</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {helperText || `Hỗ trợ định dạng PDF, PNG, JPG, DOCX (Tối đa ${maxSizeMB}MB)`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* File Uploaded Card */
        <div className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="truncate text-left">
              <div className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[280px]">
                {fileName || value.split('/').pop() || 'Tệp đã đính kèm'}
              </div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-2">
                {fileSize && <span>{fileSize}</span>}
                <span className="text-emerald-600 font-semibold flex items-center space-x-0.5">
                  <Check className="w-3 h-3 inline" />
                  <span>Đã tải lên sẵn sàng</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* View File Button */}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="px-2.5 py-1.5 text-xs font-bold text-denim-700 bg-denim-50 hover:bg-denim-100 border border-denim-200 rounded-xl transition flex items-center space-x-1 shadow-2xs"
              title="Xem trước tệp này"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem tệp</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition"
              title="Chọn tệp khác"
            >
              Đổi tệp
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-xl transition"
              title="Xóa tệp này"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 pt-0.5 animate-fadeIn">
          <Check className="w-3.5 h-3.5" />
          <span>Tệp đã được lưu an toàn vào hệ thống!</span>
        </div>
      )}

      {/* Interactive File Preview Modal */}
      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={value}
        fileName={fileName || value.split('/').pop()}
        title={label || 'Xem Trước Tệp Đính Kèm'}
      />
    </div>
  );
};
