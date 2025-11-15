// Frontend/src/components/Cards.jsx
import React from "react";

const placeholder =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=60&auto=format&fit=crop";

function Cards({ item }) {
  const imgSrc = item?.image || placeholder;
  const price = item?.price ?? "0";
  const name = item?.name ?? "Untitled";
  const title = item?.title ?? "No description available";
  const category = item?.category ?? "General";

  return (
    <div className="mt-4 my-3 p-3">
      <div className="card bg-base-100 shadow-xl hover:scale-105 duration-200 dark:bg-slate-900 dark:text-white dark:border rounded-xl">

        {/* -------- Fixed Height Image -------- */}
        <figure className="h-48 w-full overflow-hidden rounded-t-xl">
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

        {/* -------- Equal Height Body -------- */}
        <div className="card-body flex flex-col justify-between min-h-[210px]">

          {/* Title + Badge */}
          <div>
            <h2 className="card-title text-lg font-semibold">
              {name}
              <div className="badge badge-secondary ml-2">{category}</div>
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
              {title}
            </p>
          </div>

          {/* Price + CTA */}
          <div className="card-actions justify-between items-center mt-3">
            <div className="badge badge-outline px-3 py-1">${price}</div>

            <button className="cursor-pointer px-3 py-1 rounded-full border-[2px] hover:bg-pink-500 hover:text-white duration-200">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;
