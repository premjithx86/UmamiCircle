import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import api from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { X, Upload, Plus, Minus, AlertCircle, Clock, Users, Flame } from 'lucide-react';

const CreateRecipe = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Medium',
    tags: ''
  });
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please select a recipe image.');
    if (ingredients.some(i => !i.trim())) return setError('Please fill in all ingredients.');
    if (steps.some(s => !s.trim())) return setError('Please fill in all instructions.');

    try {
      setLoading(true);
      setError(null);

      const submissionData = new FormData();
      submissionData.append('image', image);
      submissionData.append('title', formData.title);
      submissionData.append('description', formData.description);
      submissionData.append('prepTime', formData.prepTime);
      submissionData.append('cookTime', formData.cookTime);
      submissionData.append('servings', formData.servings);
      submissionData.append('difficulty', formData.difficulty);
      
      const tagArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      submissionData.append('tags', JSON.stringify(tagArray));
      submissionData.append('ingredients', JSON.stringify(ingredients));
      submissionData.append('steps', JSON.stringify(steps));

      const response = await api.post('/recipes', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201 || response.status === 200) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create recipe. Content might have been flagged.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <SEO title="Create Recipe" description="Share your signature recipe with the world." />
      
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">New Recipe</h1>
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Image and Basic Info */}
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
              {imagePreview ? (
                <div className="relative aspect-video">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current.click()} className="aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                  <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Recipe Photo</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </Card>

            <Input label="Title" name="title" required value={formData.title} onChange={handleInputChange} placeholder="e.g. Grandma's Famous Lasagna" />
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                placeholder="What makes this dish special?..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Prep Time" name="prepTime" icon={<Clock size={16}/>} placeholder="e.g. 20 mins" value={formData.prepTime} onChange={handleInputChange} />
              <Input label="Cook Time" name="cookTime" icon={<Flame size={16}/>} placeholder="e.g. 45 mins" value={formData.cookTime} onChange={handleInputChange} />
              <Input label="Servings" name="servings" type="number" icon={<Users size={16}/>} placeholder="e.g. 4" value={formData.servings} onChange={handleInputChange} />
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                <select
                  name="difficulty"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Ingredients and Steps */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ingredients</h2>
                <Button type="button" variant="secondary" size="sm" onClick={addIngredient} className="rounded-full">
                  <Plus size={16} className="mr-1"/> Add
                </Button>
              </div>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                      placeholder={`Ingredient ${index + 1}`}
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                    />
                    {ingredients.length > 1 && (
                      <button onClick={() => removeIngredient(index)} className="p-2 text-gray-400 hover:text-red-500">
                        <Minus size={18}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Instructions</h2>
                <Button type="button" variant="secondary" size="sm" onClick={addStep} className="rounded-full">
                  <Plus size={16} className="mr-1"/> Add Step
                </Button>
              </div>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mt-2">
                      {index + 1}
                    </div>
                    <textarea
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none"
                      placeholder="Next step..."
                      rows="2"
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                    />
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(index)} className="p-2 text-gray-400 hover:text-red-500">
                        <Minus size={18}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3 text-red-600 dark:text-red-400">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
          <Button type="submit" variant="primary" className="w-full py-4 text-lg font-bold" disabled={loading}>
            {loading ? 'Sharing Recipe...' : 'Publish Recipe'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { CreateRecipe };
