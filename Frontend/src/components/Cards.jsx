// Frontend/src/components/Cards.jsx
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
  const isFree = priceNum === 0;
  const priceLabel = isFree ? "Free" : `₹${priceNum.toLocaleString()}`;

  const name = item?.name ?? "Untitled";
  const author = item?.author || "Unknown author";
  const genre = item?.genre || item?.category || "General";
  const publisher = item?.publisher || "";
  const subtitle = item?.title || item?.description || "";

  // --- NEW: "New" badge logic (last 30 days) ---
  const isNew = (() => {
    if (!item?.createdAt) return false;
    try {
      const created = new Date(item.createdAt).getTime();
      const now = Date.now();
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    } catch {
      return false;
    }
  })();

  const handleOpenDetail = () => {
    if (!id) return;
    navigate(`/book/${id}`, { state: { book: item } });
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit && onEdit(item);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete && onDelete(item);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    handleOpenDetail();
  };

  return (
    <div className="p-2">
      <div
        onClick={handleOpenDetail}
        className="relative bg-white dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 
        rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
        cursor-pointer flex flex-col h-full"
      >
        {/* BADGES (top-left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isNew && (
            <span className="px-2 py-[2px] rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200 shadow-sm">
              New
            </span>
          )}
          {isFree && (
            <span className="px-2 py-[2px] rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200 shadow-sm">
              Free
            </span>
          )}
        </div>

        {/* IMAGE – fixed ratio, full book visible */}
        <div className="w-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-t-xl p-2">
          <div className="w-full aspect-[3/4] flex items-center justify-center overflow-hidden">
            <img
              src={imgSrc}
              alt={name}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholder;
              }}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-3 pb-3 pt-2 flex flex-col flex-1 justify-between text-xs">
          {/* Title / author / subtitle */}
          <div>
            <h2 className="text-[13px] font-semibold leading-snug line-clamp-2 min-h-[2.2rem] text-slate-900 dark:text-slate-50">
              {name}
            </h2>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              by {author}
            </p>

            {subtitle && (
              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[2rem]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom: price + button + meta */}
          <div className="mt-2 space-y-1.5">
            {/* Price + action */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-indigo-600 dark:text-indigo-300">
                {priceLabel}
              </span>

              {!isAdmin && (
                <button
                  onClick={handleButtonClick}
                  className="px-3 py-1 rounded-full bg-pink-600 text-white text-[11px] font-medium hover:bg-pink-700"
                >
                  {isFree ? "View / Read" : "Buy"}
                </button>
              )}
            </div>

            {/* Genre + publisher */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-200 truncate max-w-[55%]">
                {genre}
              </span>
              {publisher && (
                <span className="text-[10px] text-right text-slate-500 dark:text-slate-400 truncate max-w-[45%]">
                  {publisher}
                </span>
              )}
            </div>

            {/* Admin controls */}
            {isAdmin && (
              <div className="pt-1 flex gap-2 justify-end">
                <button
                  className="px-2 py-1 text-[11px] border border-indigo-500 text-indigo-600 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-800"
                  onClick={handleEditClick}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 text-[11px] border border-red-500 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-slate-800"
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
