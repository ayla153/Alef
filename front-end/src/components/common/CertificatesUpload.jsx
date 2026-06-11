import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import '../../styles/CertificatesUpload.css';
import { FaFileAlt , FaCloudUploadAlt, FaFilePdf, FaFileImage, FaTrashAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CertificatesUpload = forwardRef((props, ref) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // الحد الأقصى لحجم الملف (5 ميجابايت)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  // الأنواع المسموحة
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  // التحقق من الملف
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`نوع الملف غير مدعوم: ${file.name}. الأنواع المسموحة: PDF, JPG, PNG`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`حجم الملف كبير جداً: ${file.name}. الحد الأقصى 5 ميجابايت`);
      return false;
    }
    setError('');
    return true;
  };

  // إضافة ملفات جديدة
  const addFiles = (selectedFiles) => {
    const newFiles = [];
    for (let file of selectedFiles) {
      if (validateFile(file)) {
        newFiles.push({
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1),
          uploaded: false,
        });
      }
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  // حذف ملف
  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // محاكاة رفع الملفات إلى الخادم
  const handleUpload = async () => {
    const updatedFiles = files.map(f => ({ ...f, uploaded: true }));
    setFiles(updatedFiles);
    alert('تم رفع الملفات بنجاح (محاكاة)');
  };

  // التعامل مع السحب والإفلات
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  // فتح نافذة اختيار الملفات
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = (e) => {
    const selected = Array.from(e.target.files);
    addFiles(selected);
    e.target.value = '';
  };

  // أيقونة الملف حسب النوع
  const getFileIcon = (type) => {
    if (type === 'application/pdf') return <FaFilePdf className="file-icon pdf" />;
    return <FaFileImage className="file-icon image" />;
  };

  // دوال مكشوفة للمكون الأب
  useImperativeHandle(ref, () => ({
    getFilesCount: () => files.length,
    getFiles: () => files,
  }));

  return (
    <div className="certificates-container">
      <div className="certificates-header">
        <div className="header-title">
          <FaFileAlt className="cv-icon" />
          <h3>الشهادات والمستندات</h3>
        </div>
        <p>انقر للتحميل أو اسحب وافلت الملفات</p>
        <span className="file-types">(التسجيل: PDF, JPG, PNG) - الحد الأقصى 5MB لكل ملف</span>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div
        className="drop-zone"
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <FaCloudUploadAlt className="upload-icon" />
        <p>اسحب وأفلت الملفات هنا أو انقر للتحميل</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="files-list">
          <div className="files-header">
            <span>الملف</span>
            <span>الحجم</span>
            <span>الحالة</span>
            <span></span>
          </div>
          {files.map(file => (
            <div key={file.id} className="file-item">
              <div className="file-info">
                {getFileIcon(file.file.type)}
                <span className="file-name">{file.name}</span>
              </div>
              <div className="file-size">{file.size} MB</div>
              <div className="file-status">
                {file.uploaded ? (
                  <><FaCheckCircle className="status-icon success" /> تم الرفع</>
                ) : (
                  <><FaTimesCircle className="status-icon pending" /> لم يسجل</>
                )}
              </div>
              <button className="delete-btn" onClick={() => removeFile(file.id)}>
                <FaTrashAlt />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <button className="upload-btn" onClick={handleUpload}>
          رفع جميع الملفات
        </button>
      )}
    </div>
  );
});

export default CertificatesUpload;