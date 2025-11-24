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
  const price = Number(item?.price ?? 0);
  const name = item?.name ?? "Untitled";
  const title = item?.title ?? "No description available";

  const author = item?.author;
  const publisher = item?.publisher;
  const genre = item?.genre || item?.category || "General";

  const isFree = price === 0;

  const handleOpenDetail = () => {
    if (!id) return;
    navigate(`/book/${id}`, {
      state: { book: item },
    });
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    handleOpenDetail();
  };

  return (
    <div className="mt-4 my-3 p-1">
      <div
        className="group h-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col"
        onClick={handleOpenDetail}
      >
        {/* IMAGE */}
        <div className="relative h-56 w-full overflow-hidden rounded-t-2xl">
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholder;
            }}
          />

          {/* Genre pill */}
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-[11px] font-medium bg-black/70 text-white backdrop-blur-sm">
            {genre}
          </span>

          {/* Price pill */}
          <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-white/90 text-slate-900 dark:bg-slate-900/90 dark:text-white shadow">
            {isFree ? "Free" : `₹${price}`}
          </span>
        </div>

        {/* BODY */}
        <div className="flex flex-col flex-1 px-4 py-3">
          {/* TEXT BLOCK (fixed-ish height using min-h + line clamps) */}
          <div className="flex-1 flex flex-col">
            <h2 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white line-clamp-2 min-h-[40px]">
              {name}
            </h2>

            {author && (
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                by <span className="font-medium">{author}</span>
                {publisher ? ` · ${publisher}` : ""}
              </p>
            )}

            <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[40px]">
              {title}
            </p>
          </div>

          {/* FOOTER (actions) */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {isFree ? "Free to read" : "Starts from"}
              </span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {isFree ? "Free" : `₹${price}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isAdmin && (
                <button
                  type="button"
                  onClick={handleBuyClick}
                  className="px-3 py-1.5 rounded-full text-xs md:text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  {isFree ? "Read Free" : "Buy"}
                </button>
              )}

              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(item);
                    }}
                    className="px-3 py-1.5 rounded-full border border-indigo-500 text-indigo-600 text-xs hover:bg-indigo-50 dark:hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete && onDelete(item);
                    }}
                    className="px-3 py-1.5 rounded-full border border-red-500 text-red-500 text-xs hover:bg-red-50 dark:hover:bg-slate-800"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;
