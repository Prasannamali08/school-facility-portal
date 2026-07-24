import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import api from '../services/api';

const CATEGORIES = [
  'Broken Furniture', 'Electrical', 'Water Supply', 'Toilet', 'Classroom',
  'Playground', 'Laboratory', 'Library', 'Boundary Wall', 'Sanitation',
  'Safety Hazard', 'Others',
];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

const ReportIssue = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleImageChange = (e) => {
  const files = Array.from(e.target.files);

  if (images.length + files.length > MAX_IMAGES) {
    toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);
    return;
  }

  const validFiles = [];

  files.forEach((file) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error(`${file.name}: Unsupported file type`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`${file.name}: Maximum size is ${MAX_SIZE_MB}MB`);
      return;
    }

    validFiles.push({
      file,
      preview: URL.createObjectURL(file),
    });
  });

  console.log(validFiles);

  setImages((prev) => [...prev, ...validFiles]);

e.target.value = "";
};
    

const removeImage = (index) => {
  URL.revokeObjectURL(images[index].preview);
  setImages((prev) => prev.filter((_, i) => i !== index));
};

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
      images.forEach((img) => fd.append('images', img.file));

      await api.post('/issues', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
     toast.success("Issue reported successfully!");

images.forEach((img) => URL.revokeObjectURL(img.preview));

reset();
setImages([]);
navigate("/track-issues");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Report a Facility Issue</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Provide as much detail as possible to help us resolve it quickly.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium mb-1 block">Title</label>
          <input
            className="input-field"
            placeholder="e.g. Broken chair in Room 101"
            {...register('title', { required: 'Title is required', maxLength: { value: 120, message: 'Title too long' } })}
          />
          {errors.title && <p className="text-danger text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select className="input-field" {...register('category', { required: true })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Priority</label>
            <select className="input-field" {...register('priority', { required: true })} defaultValue="Medium">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Location</label>
          <input
            className="input-field"
            placeholder="e.g. Block A - Room 101"
            {...register('location', { required: 'Location is required' })}
          />
          {errors.location && <p className="text-danger text-xs mt-1">{errors.location.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea
            rows={4}
            className="input-field"
            placeholder="Describe the issue in detail..."
            {...register('description', { required: 'Description is required', maxLength: { value: 2000, message: 'Description too long' } })}
          />
          {errors.description && <p className="text-danger text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Photos (optional, up to {MAX_IMAGES})</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-8 cursor-pointer hover:border-primary-400">
            <FiUploadCloud size={28} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload JPG, PNG, or WEBP (max {MAX_SIZE_MB}MB each)</span>
            <input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img
  src={img.preview}
  alt="preview"
  className="w-full h-20 object-cover rounded-lg border"
  onError={(e) => {
    console.error("Preview failed:", img.preview);
    e.target.src =
      "https://placehold.co/150x100?text=Preview+Error";
  }}
/>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;
