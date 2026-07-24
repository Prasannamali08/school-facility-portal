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
    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
    ) {
      toast.error(`${file.name}: Unsupported file type`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`${file.name}: Maximum size is ${MAX_SIZE_MB}MB`);
      return;
    }

    const preview = URL.createObjectURL(file);

   

    validFiles.push({
      file,
      preview,
    });
  });

 

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
    <div className="max-w-3xl mx-auto">

  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
      Report a Facility Issue
    </h1>

    <p className="mt-2 text-gray-500 dark:text-gray-400">
      Describe the issue clearly and upload photos to help the maintenance team resolve it quickly.
    </p>
  </div>

     <form
  onSubmit={handleSubmit(onSubmit)}
  className="card p-8 shadow-lg space-y-6"
>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Title</label>
          <input
            className="input-field"
            placeholder="e.g. Broken chair in Room 101"
            {...register('title', { required: 'Title is required', maxLength: { value: 120, message: 'Title too long' } })}
          />
          {errors.title && <p className="text-danger text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Category</label>
            <select className="input-field" {...register('category', { required: true })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Priority</label>
            <select className="input-field" {...register('priority', { required: true })} defaultValue="Medium">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Location</label>
          <input
            className="input-field"
            placeholder="e.g. Block A - Room 101"
            {...register('location', { required: 'Location is required' })}
          />
          {errors.location && <p className="text-danger text-xs mt-1">{errors.location.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</label>
          <textarea
            rows={4}
            className="input-field"
            placeholder="Describe the issue in detail..."
            {...register('description', { required: 'Description is required', maxLength: { value: 2000, message: 'Description too long' } })}
          />
          {errors.description && <p className="text-danger text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Photos (optional, up to {MAX_IMAGES})</label>
       <label className="group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl py-10 cursor-pointer hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
           <FiUploadCloud
  size={42}
  className="text-primary-500 mb-3 transition-transform duration-300 group-hover:scale-110"
/>
            <span className="text-center text-sm text-gray-500 dark:text-gray-400 px-4">Click to upload JPG, PNG, or WEBP (max {MAX_SIZE_MB}MB each)</span>
            <input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-5">
              {images.map((img, i) => (
                <div key={i} className="relative">
  <img
  src={img.preview}
  alt="preview"
  className="w-full h-24 object-cover rounded-xl border shadow-sm"
  onError={(e) => {
    console.error("Preview failed:", img.preview);
    e.target.style.display = "none";
  }}
/>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-all"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
  type="submit"
  disabled={loading}
  className="btn-primary w-full py-3 text-base font-semibold"
>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;
