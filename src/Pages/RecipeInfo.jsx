import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../Components/NavBar";
import { IoMdBookmark } from "react-icons/io";
import defaultRecipeImage from '../assets/defaultRecipeImage.jpg';
import { Clock } from 'lucide-react';
import { HiMiniPencilSquare } from "react-icons/hi2";
import BookmarkButton from "../Components/BookMarkButton";
import Footer from "../Components/Footer";
import { useAuthContext } from "../Context/AuthContext";
import { RiCloseLargeLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const RecipeInfo = () => {
  const { RecipeId } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [recipeUser, setRecipeUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State for delete button

  // State for edited values
  const [newRecipeTitle, setNewRecipeTitle] = useState('');
  const [newIngredients, setNewIngredients] = useState([]);
  const [newInstruction, setNewInstruction] = useState('');
  const [newRecipeDescription, setNewRecipeDescription] = useState('');

  // Initialize edited values when recipe data is available
  useEffect(() => {
    if (recipe) {
      setNewRecipeTitle(recipe.recipe_title);
      setNewIngredients(recipe.ingredients);
      setNewInstruction(recipe.instructions);
      setNewRecipeDescription(recipe.recipe_description);
    }
  }, [recipe]);

  // Check if recipe is bookmarked
  useEffect(() => {
    const checkBookmark = async () => {
      const response = await fetch('http://localhost:3000/user/checkSave', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: RecipeId,
          userId: user._id
        })
      });

      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setIsBookmarked(data === 'saved');
    };
    checkBookmark();
  }, [recipe]);

  // Fetch recipe and user data
  useEffect(() => {
    const fetchRecipeAndUser = async () => {
      setLoading(true);

      try {
        const recipeResponse = await fetch(`http://localhost:3000/recipe/${RecipeId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!recipeResponse.ok) throw new Error("Failed to fetch the recipe");
        const recipeData = await recipeResponse.json();
        setRecipe(recipeData);

        const userResponse = await fetch(`http://localhost:3000/user/getUserById`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: recipeData.recipe_user }),
        });

        if (!userResponse.ok) throw new Error("Failed to fetch the recipe owner");
        const userData = await userResponse.json();
        setRecipeUser(userData);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndUser();
  }, [RecipeId]);

  // Check if user is the recipe owner
  const [recipeOwner] = recipe?.recipe_user || [];
  const isRecipeOwner = user && recipe && user._id === recipeOwner;

  // Save edited recipe
  const saveEditedRecipe = async () => {
    try {
      const response = await fetch(`http://localhost:3000/recipe/${RecipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe_title: newRecipeTitle,
          ingredients: newIngredients,
          instructions: newInstruction,
          recipe_description: newRecipeDescription
        })
      });

      if (!response.ok) throw new Error('Failed to update recipe');
      const updatedRecipe = await response.json();
      setRecipe(updatedRecipe);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    // Reset to original values
    if (recipe) {
      setNewRecipeTitle(recipe.recipe_title);
      setNewIngredients(recipe.ingredients);
      setNewInstruction(recipe.instructions);
      setNewRecipeDescription(recipe.recipe_description);
    }
  };

  // Delete recipe
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:3000/recipe/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: RecipeId,
        })
      });

      if (response.ok) {
        // Redirect to home page or another appropriate page
        window.location.href = '/';
      } else {
        const data = await response.json();
        console.error("Error deleting recipe:", data.message);
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="text-center text-gray-700 py-8">Loading...</div>;
  if (!recipe) return <div className="text-center text-gray-700 py-8">No recipe found.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      <NavBar className="sticky top-0 bg-white/90 backdrop-blur-md shadow-sm z-50" />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16"> {/* Added mt-16 */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden ring-2 ring-purple-200 ring-offset-2">
            {/* Recipe Header */}
            <div className="relative">
              {/* Recipe Image with Overlay */}
              <img
                src={recipe.recipe_image}
                alt={recipe.recipe_title || "Default Recipe Image"}
                className="w-full h-64 md:h-96 object-cover"
                onError={(e) => {
                  e.target.src = defaultRecipeImage;
                  e.target.alt = "Default Recipe Image";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Recipe Title and Actions */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-md">
                  {isEditing ? (
                    <input
                      type="text"
                      value={newRecipeTitle}
                      onChange={(e) => setNewRecipeTitle(e.target.value)}
                      className="w-full bg-transparent text-4xl font-bold text-white outline-none"
                    />
                  ) : (
                    recipe.recipe_title
                  )}
                </h1>

                <div className="flex items-center flex-wrap gap-2 md:gap-4">
                  {isRecipeOwner && !isEditing ? (
                    <div className="flex items-center">
                      <button
                        className="flex items-center px-2 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-l-full shadow-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300 ease-in-out min-w-[80px]"
                        onClick={() => setIsEditing(true)}
                      >
                        <HiMiniPencilSquare className="mr-1" />
                        &nbsp;Edit
                      </button>
                      <button
                        className="flex items-center px-2 py-2 bg-red-500 text-white rounded-r-full shadow-lg hover:bg-red-600 transition-all duration-300 ease-in-out min-w-[80px]"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <span className="animate-pulse">Deleting...</span>
                        ) : (
                          <>
                            <RiCloseLargeLine className="mr-1" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  ) : isRecipeOwner && isEditing ? (
                    <div className="flex items-center">
                      <button
                        className="flex items-center px-2 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-l-full shadow-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300 ease-in-out min-w-[80px]"
                        onClick={saveEditedRecipe}
                      >
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Save
                      </button>
                      <button
                        className="flex items-center px-2 py-2 bg-gray-500 text-white rounded-r-full shadow-lg hover:bg-gray-600 transition-all duration-300 ease-in-out min-w-[80px]"
                        onClick={cancelEditing}
                      >
                        &nbsp;&nbsp;Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <BookmarkButton
                        recipeId={RecipeId}
                        userId={user._id}
                        isBookmarked={isBookmarked}
                      />
                    </div>
                  )}

                  {!isEditing && isRecipeOwner && (
                    <span className="text-white bg-gray-800/90 px-3 py-1.5 rounded-full text-sm font-medium ml-4">
                      {recipe.Bookmarks?.length || 0} bookmarks
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Details */}
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column */}
            <div>
              {/* Recipe Description */}
              <div className="mb-10">
                {isEditing ? (
                  <textarea
                    value={newRecipeDescription}
                    onChange={(e) => setNewRecipeDescription(e.target.value)}
                    className="w-full p-4 bg-white rounded-xl shadow-sm resize-none h-32"
                    placeholder="Recipe description..."
                  />
                ) : (
                  <p className="text-gray-600 italic leading-relaxed text-lg">
                    {recipe.recipe_description || "No description provided"}
                  </p>
                )}
              </div>

              {/* Cooking Time */}
              <div className="mt-6 flex items-center bg-gradient-to-r from-purple-200 to-pink-200 p-4 rounded-xl shadow-sm">
                <Clock className="text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Cooking Time</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {recipe.cookingTime ? `${recipe.cookingTime} mins` : "20 mins"}
                  </p>
                </div>
              </div>

              {/* Created By */}
              <div className="flex items-center space-x-4 mb-10">
                <Link
                  to={`/userPage/${recipe.recipe_user}`}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={recipeUser?.avatar || defaultRecipeImage}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-purple-600 hover:text-purple-800 transition-colors">
                        Created by {recipeUser?.username || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(recipe.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Column */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8 rounded-2xl">
              <p className="text-sm font-medium text-gray-600 mb-2">Recipe Type:</p>
              <p className="text-2xl font-bold text-gray-800 mb-8">
                {recipe.type || "Not specified"}
              </p>

              {/* Ingredients Preview */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingredients</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    {newIngredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 bg-white rounded-lg shadow-sm">
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => {
                            const updatedIngredients = [...newIngredients];
                            updatedIngredients[index].name = e.target.value;
                            setNewIngredients(updatedIngredients);
                          }}
                          className="flex-1 bg-transparent border-none outline-none"
                        />
                        <input
                          type="text"
                          value={ingredient.quantity}
                          onChange={(e) => {
                            const updatedIngredients = [...newIngredients];
                            updatedIngredients[index].quantity = e.target.value;
                            setNewIngredients(updatedIngredients);
                          }}
                          className="flex-1 bg-transparent border-none outline-none"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="max-h-[300px] overflow-auto scrollbar-hide space-y-3 flex flex-col">
                    {recipe.ingredients?.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex justify-between p-3 bg-white rounded-lg shadow-sm"
                      >
                        <div>
                          <span className="font-medium text-gray-800">{ingredient.name}</span> -{" "}
                          {ingredient.quantity}
                        </div>
                        <span className="text-sm text-gray-400">{index + 1}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="p-10 bg-white rounded-3xl shadow-2xl ring-2 ring-purple-200 ring-offset-2 mt-10">
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-purple-300 pb-2">
              Step-by-Step Instructions
            </h2>
            {isEditing ? (
              <textarea
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                className="w-full p-4 bg-white rounded-xl shadow-sm resize-none h-64"
                placeholder="Instructions..."
              />
            ) : (
              <ol className="space-y-4">
                {recipe.instructions?.split(". ").map((step, index) =>
                  step ? (
                    <li key={index} className="relative pl-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg group">
                      <span className="absolute left-0 top-3 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      <p className="text-gray-700">{step.trim()}</p>
                    </li>
                  ) : null
                )}
              </ol>
            )}
          </div>
        </div>
      </main>

      <Footer className="bg-white/90 backdrop-blur-md shadow-inner" />
    </div>
  );
};

export default RecipeInfo;