import React, { useEffect, useRef, useState } from "react";


const ReviewItem = ({ review, index, handleImageClick, getUsernameFromEmail }) => {
  const commentRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const StarRating = ({ rating, interactive = false, onRatingChange }) => {
    const stars = Array(5)
      .fill(0)
      .map((_, index) => (
        <svg
          key={index}
          className={`w-6 h-6 cursor-${interactive ? "pointer" : "default"} ${
            index < rating ? "fill-yellow-400" : "fill-gray-300"
          }`}
          onClick={interactive ? () => onRatingChange(index + 1) : null}
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ));
    return <div className="flex">{stars}</div>;
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (commentRef.current) {
        const { scrollHeight, clientHeight } = commentRef.current;
        setIsOverflowing(scrollHeight > clientHeight);
      }
    };

    setTimeout(checkOverflow, 100);

    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [review.comment]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      {/* User & Rating */}
      <div className="flex items-center gap-2">
        <span className="text-gray-700 font-semibold">
          {getUsernameFromEmail(review.userEmail)}
        </span>
        <StarRating rating={review.rating} />
      </div>

      {/* Comment Section */}
      <div className="relative">
        <p
          ref={commentRef}
          className={`text-gray-600 mt-2 overflow-hidden transition-all duration-300 ${
            expanded ? "line-clamp-none" : "line-clamp-2"
          }`}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: expanded ? "unset" : 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {review.comment}
        </p>

        {isOverflowing && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 text-sm font-medium mt-1 block"
          >
            {expanded ? "Show Less" : "More"}
          </button>
        )}
      </div>

      {/* Images Section */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-2">
          {review.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Review"
              className="w-20 h-20 object-cover rounded cursor-pointer"
              onClick={() => handleImageClick(review, idx)}
            />
          ))}
        </div>
      )}

      {/* Date */}
      <p className="text-gray-500 text-sm mt-1">
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

// Main component rendering the list of reviews
const ReviewsList = ({ reviews, ratingFilter, handleImageClick, getUsernameFromEmail }) => {
  return (
    <>
      {reviews.length > 0 ? (
        reviews
          .filter((review) =>
            ratingFilter ? review.rating === ratingFilter : true
          )
          .map((review, index) => (
            <ReviewItem
              key={index}
              review={review}
              index={index}
              handleImageClick={handleImageClick}
              getUsernameFromEmail={getUsernameFromEmail}
            />
          ))
      ) : (
        <p className="text-gray-500">No reviews match the current filter</p>
      )}
    </>
  );
};

export default ReviewsList;