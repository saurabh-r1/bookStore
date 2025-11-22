// Frontend/src/components/Cards.jsx
import React from "react";
import { useAuth } from "../context/AuthProvider";

const placeholder =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=60&auto=format&fit=crop";

function Cards({ item, onEdit, onDelete }) {
  const [authUser] = useAuth();
  const isAdmin = authUser?.role === "admin";

  const imgSrc = item?.image || placeholder;
  const price = item?.price ?? "0";
  const name = item?.name ?? "Untitled";
  const title = item?.title ?? "No description available";
  const category = item?.category ?? "General";

  const handleEditClick = (e) => {
    e.stopPropagation(); // prevent parent card click (details modal)
    onEdit && onEdit(item);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete && onDelete(item);
  };

  return (
    <div className="mt-4 my-3 p-3">
      <div className="card w-full bg-base-100 shadow-xl hover:scale-105 duration-200 dark:bg-slate-900 dark:text-white dark:border flex flex-col">
        <figure className="h-48 overflow-hidden">
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholder;
            }}
          />
        </figure>

        <div className="card-body flex flex-col justify-between">
          <div>
            <h2 className="card-title text-base md:text-lg">
              {name}
              <div className="badge badge-secondary ml-2">{category}</div>
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {title}
            </p>
          </div>

          <div className="card-actions justify-between items-center mt-3">
            <div className="badge badge-outline">${price}</div>

            <div className="flex gap-2">
              {/* BUY button only for normal user (NOT admin) */}
              {!isAdmin && (
                <button
                  className="cursor-pointer px-3 py-1 rounded-full border-[2px] hover:bg-pink-500 hover:text-white duration-200 text-xs md:text-sm"
                >
                  Buy Now
                </button>
              )}

              {/* Admin controls */}
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="px-3 py-1 rounded-full border border-indigo-500 text-indigo-600 text-xs hover:bg-indigo-50 dark:hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="px-3 py-1 rounded-full border border-red-500 text-red-500 text-xs hover:bg-red-50 dark:hover:bg-slate-800"
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
