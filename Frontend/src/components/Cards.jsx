import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const placeholder =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=60&auto=format&fit=crop";

function Cards({ item, onEdit, onDelete }) {
  const [authUser] = useAuth();
  const isAdmin = authUser?.role === "admin";
  const navigate = useNavigate();

  const id = item?._id || item?.id || item?.name;
  const imgSrc = item?.image || placeholder;

  const priceNum = Number(item?.price) || 0;
  const priceLabel = priceNum === 0 ? "Free" : `₹${priceNum.toLocaleString()}`;

  const name = item?.name ?? "Untitled";
  const author = item?.author || "Unknown Author";
  const genre = item?.genre || item?.category || "General";
  const publisher = item?.publisher || "";
  const subtitle = item?.title || item?.description || "";

  const handleOpenDetail = () => {
    if (!id) return;
    navigate(`/book/${id}`, { state: { book: item } });
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    handleOpenDetail();
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit && onEdit(item);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete && onDelete(item);
  };

  return (
    <div className="p-2">
      <div
        onClick={handleOpenDetail}
        className="card w-full bg-white dark:bg-slate-900 dark:text-white border rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col h-full"
      >
        {/* IMAGE */}
        <div className="h-56 overflow-hidden rounded-t-xl">
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholder;
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          {/* Title + author + subtitle */}
          <div>
            <h2 className="text-[15px] md:text-base font-semibold leading-tight line-clamp-2 min-h-[2.8rem]">
              {name}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              by {author}
            </p>

            {subtitle && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[2.4rem]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom section */}
          <div className="mt-3">
            {/* Price + main action */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-300">
                {priceLabel}
              </span>

              {!isAdmin && (
                <button
                  onClick={handleButtonClick}
                  className="px-4 py-1.5 rounded-full bg-pink-600 text-white text-xs font-medium hover:bg-pink-700 transition"
                >
                  {priceNum === 0 ? "View / Read" : "Buy"}
                </button>
              )}
            </div>

            {/* Genre + publisher */}
            <div className="mt-3 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] truncate max-w-[40%]">
                {genre}
              </span>
              {publisher && (
                <span className="truncate max-w-[55%] text-right">
                  {publisher}
                </span>
              )}
            </div>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="mt-3 flex gap-2 justify-end">
                <button
                  className="px-3 py-1 text-xs border border-indigo-500 text-indigo-600 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800"
                  onClick={handleEditClick}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 text-xs border border-red-500 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-slate-800"
                  onClick={handleDeleteClick}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;
