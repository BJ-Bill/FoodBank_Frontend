import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CiBookmarkPlus } from "react-icons/ci";
import { useAuthContext } from '../Context/AuthContext';
import { IoMdBookmark } from "react-icons/io";
import { Clock, Utensils, Trash, Pencil } from 'lucide-react';
import defaultRecipeImage from '../assets/defaultRecipeImage.jpg';

const profileRecipeElement = ({
  RecipeId,
  recipe_image,
  recipe_name,
  recipe_description,
  recipeType,
  cookingTime,
  difficulty,
  recipe_user, // Recipe owner's user ID
  isUserPage // Whether it's the user's own page
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/recipe/${RecipeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // You might want to refresh the page or update the recipe list here
      } else {
        const data = await response.json();
        console.error("Error deleting recipe:", data.message);
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to={`/recipe/${RecipeId}`}
      className="block group transform transition-all hover:scale-[1.02]"
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-sand-100">
          {!imageLoaded && <div className="absolute inset-0 animate-pulse" />}
          <img
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            src={recipe_image}
            alt={recipe_name}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = defaultRecipeImage;
              e.target.alt = "Default Recipe Image";
            }}
          />

          {/* Recipe Type Badge */}
          {recipeType && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              {recipeType}
            </div>
          )}

          {/* Edit and Delete Buttons for Recipe Owner on User Page */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate(`/recipe/${RecipeId}`, { state: { isEditing: true } });
              }}
              className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-700 transition-colors"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDelete();
              }}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <Trash className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Content */}
        <div className="p-4 text-left">
          <h3 className="font-serif text-lg font-medium line-clamp-2 mb-2 flex">
            {recipe_name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {recipe_description}
          </p>
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{cookingTime} min</span>
            </div>
            <div className="flex items-center">
              <Utensils className="w-4 h-4 mr-1" />
              <span>{difficulty}</span>
            </div>
          </div>

        </div>

      </div>
    </Link>
  );
};

export default profileRecipeElement;