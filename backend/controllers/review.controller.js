import Review from "../models/review.model.js";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getReviewsByID = async (req, res) => {
  try {
    const { email } = req.params; 

    const reviews = await Review.find({ 'reviews.userEmail': email });

    if (reviews.length === 0) {
      return res.status(200).json({
        reviews: [],
      });
    }

    const allReviews = reviews
      .map((review) => 
        review.reviews
          .filter((reviewItem) => reviewItem.userEmail === email)
          .map((reviewItem) => ({
            ...reviewItem, 
            productName: review.productName, 
          }))
      )
      .flat(); 

    return res.status(200).json({
      reviews: allReviews, 
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};




export const getReviewsByProduct = async (req, res) => {
  try {
    const { productName } = req.params;
    const { ratingFilter } = req.query;

    const reviewData = await Review.findOne({ productName });

    if (!reviewData || reviewData.reviews.length === 0) {
      return res.status(200).json({
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        message: "No reviews yet",
      });
    }

    let filteredReviews = reviewData.reviews;
    if (ratingFilter) {
      filteredReviews = reviewData.reviews.filter(
        (review) => review.rating === parseInt(ratingFilter)
      );
    }

    const totalRating = reviewData.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Number((totalRating / reviewData.reviews.length).toFixed(1));

    res.status(200).json({
      reviews: filteredReviews,
      averageRating,
      totalReviews: reviewData.reviews.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


  export const addReview = async (req, res) => {
    try {
      const { productName, userEmail, rating, comment, images } = req.body;
  
      if (!productName || !userEmail || !rating || !comment) {
        return res.status(400).json({ error: "productName, userEmail, rating, and comment are required." });
      }
  
      let reviewData = await Review.findOne({ productName });
  
      if (reviewData && reviewData.reviews.some(review => review.userEmail === userEmail)) {
        return res.status(400).json({ error: "You have already reviewed this product." });
      }
  
      let imageUrls = [];
      if (images && images.length > 0) {
        const uploadPromises = images.map((base64Image) => {
          // Extract base64 data (remove data URL prefix)
          const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
          return cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Data}`);
        });
  
        const results = await Promise.all(uploadPromises);
        imageUrls = results.map((result) => result.secure_url);
  
        if (imageUrls.length > 3) {
          return res.status(400).json({ error: "Maximum 3 images allowed" });
        }
      }
  
      if (!reviewData) {
        reviewData = new Review({ productName, reviews: [] });
      }
  
      reviewData.reviews.push({
        userEmail,
        rating: parseInt(rating),
        comment,
        images: imageUrls, 
      });
  
      await reviewData.save();
      res.status(201).json({
        message: "Review added successfully",
        reviews: reviewData.reviews,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };
  
  
  export const updateReview = async (req, res) => {
    try {
      const { productName, userEmail, rating, comment, images, deletedIndexes } = req.body;

      if (!productName || !userEmail) {
        return res.status(400).json({ error: "Product name and user email are required." });
      }
  
      let reviewData = await Review.findOne({ productName });
      if (!reviewData) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      const reviewIndex = reviewData.reviews.findIndex((review) => review.userEmail === userEmail);
      if (reviewIndex === -1) {
        return res.status(404).json({ error: "Review not found" });
      }
  
      let review = reviewData.reviews[reviewIndex];
  
      if (deletedIndexes && deletedIndexes.length > 0) {
        for (const index of deletedIndexes) {
          if (review.images[index]) {
            const imageUrl = review.images[index];
            const publicId = imageUrl.split("/").pop().split(".")[0]; 
            await cloudinary.uploader.destroy(publicId); 
          }
        }
  
      
        review.images = review.images.filter((_, index) => !deletedIndexes.includes(index));
      }
  
      let newImageUrls = [];
      if (images && images.length > 0) {
        const uploadPromises = images.map((base64Image) => {
          const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
          return cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Data}`);
        });
  
        const results = await Promise.all(uploadPromises);
        newImageUrls = results.map((result) => result.secure_url);
      }
  
      const totalImages = review.images.length + newImageUrls.length;
      if (totalImages > 3) {
        return res.status(400).json({ error: "Maximum 3 images allowed" });
      }
  
      review.images = [...review.images, ...newImageUrls];
      if (rating) review.rating = parseInt(rating);
      if (comment) review.comment = comment;
  
      await reviewData.save();
  
      res.status(200).json({
        message: "Review updated successfully",
        reviews: reviewData.reviews,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };
  

export const deleteReview = async (req, res) => {
  try {
    const { productName, email } = req.params;

    const reviewData = await Review.findOne({ productName });
    if (!reviewData) {
      return res.status(404).json({ error: "Product reviews not found" });
    }

    const reviewIndex = reviewData.reviews.findIndex(
      (review) => review.userEmail === email
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ error: "Review not found for this user" });
    }

    const review = reviewData.reviews[reviewIndex];

    
    if (review.images && review.images.length > 0) {
      for (const imageUrl of review.images) {
        const publicId = imageUrl.split("/").pop().split(".")[0]; 
        await cloudinary.v2.uploader.destroy(publicId);
      }
    }


    reviewData.reviews.splice(reviewIndex, 1);
    await reviewData.save();

    res.status(200).json({
      message: "Review and associated images deleted successfully",
      reviews: reviewData.reviews,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Server error" });
  }
};