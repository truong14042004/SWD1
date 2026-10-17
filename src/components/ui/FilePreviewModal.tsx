'use client';

import React from 'react';
import {
  X,
  ExternalLink,
  Download,
  FileText,
  Image as ImageIcon,
  FileCheck,
} from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
  title?: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName = 'Tài liệu đính kèm',
  title = 'Xem Trước Tệp Đính Kèm',
}) => {
  if (!isOpen || !fileUrl) return null;

  const isDataUrl = fileUrl.startsWith('data:');
  const isPdf =
    fileUrl.toLowerCase().includes('.pdf') ||
    fileUrl.startsWith('data:application/pdf');
  const isImage =
    fileUrl.toLowerCase().includes('.png') ||
    fileUrl.toLowerCase().includes('.jpg') ||
    fileUrl.toLowerCase().includes('.jpeg') ||
    fileUrl.toLowerCase().includes('.webp') ||
    fileUrl.startsWith('data:image/');

  const handleOpenNewTab = () => {
    if (isDataUrl) {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      }
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-9 h-9 rounded-xl bg-denim-50 border border-denim-200 text-denim-700 flex items-center justify-center flex-shrink-0">
              {isPdf ? (
                <FileText className="w-5 h-5 text-denim-600" />
              ) : isImage ? (
                <ImageIcon className="w-5 h-5 text-denim-600" />
              ) : (
                <FileCheck className="w-5 h-5 text-denim-600" />
              )}
            </div>
            <div className="truncate text-left">
              <h3 className="font-extrabold text-slate-900 text-sm truncate">{title}</h3>
              <p className="text-[11px] text-slate-500 font-mono truncate">{fileName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleOpenNewTab}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-denim-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center space-x-1.5 shadow-2xs"
              title="Mở trong tab trình duyệt mới"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mở Tab Mới</span>
            </button>

            <a
              href={fileUrl}
              download={fileName}
              className="px-3 py-1.5 text-xs font-bold text-white bg-denim-600 hover:bg-denim-700 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
              title="Tải tệp về máy tính"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải Về Máy</span>
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition"
              title="Đóng xem trước"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: File Preview */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100/60 flex items-center justify-center min-h-[380px]">
          {isPdf ? (
            <div className="w-full h-[65vh] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <iframe
                src={`${fileUrl}#toolbar=1`}
                className="w-full h-full border-0"
                title={fileName}
              />
            </div>
          ) : isImage ? (
            <div className="text-center p-2">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-h-[68vh] max-w-full rounded-2xl shadow-md border border-slate-200 object-contain mx-auto bg-white"
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-denim-50 text-denim-600 flex items-center justify-center mx-auto border border-denim-100">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{fileName}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Định dạng tệp văn bản này được hỗ trợ mở qua trình duyệt hoặc tải về máy để xem chi tiết.
                </p>
              </div>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={handleOpenNewTab}
                  className="px-4 py-2 bg-denim-600 hover:bg-denim-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Mở Trực Tiếp</span>
                </button>
                <a
                  href={fileUrl}
                  download={fileName}
                  className="px-4 py-2 border border-slate-300 font-bold text-slate-700 text-xs rounded-xl hover:bg-slate-50 transition flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Xuống</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
