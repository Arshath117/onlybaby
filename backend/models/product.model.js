import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    color: [
      {
        color: {
          type: String,
          required: true,
        },
        images: {
          type: [String], 
          required: true,
        },
        video: {
          type : String,
          default : null
        }
      },
    ],
    defaultColorIndex: {
      type: Number,
      default: 0, 
    },
    ageGroup: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    itemsIncluded: {
      type: String,
    },
    features: {
      type: String,
    },
    benefits: {
      type: String,
    },
    bestSellers: {
      type: Boolean,
      default: false,
    },
    quantity: {
      type: Number,
      default: 10,
    },
    newArrivals: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;






//keerthi working code

// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema({
//     name : {
//         type : String,
//         required: true,
//         unique : true,
//     },
//     price : {
//         type : Number,
//         required : true,
//     },
//     image:{
//         type : [String],
//         required : true,
//     },
//     color : {
//         type : String,
//         required : true,
//     },
//     AgeGroup:{
//         type : String,
//         required : true,
//     },
//     description : {
//         type : String,
//         required : true,
//     },
//     itemsIncluded : {
//         type : String,
//         // required : true,
//     },
//     features : {
//         type : String,
//         required : true,
//     },
//     benefits : {
//         type : String,
//         required : true,
//     }
// },{
//     timestamps:true,
// })

// const Product = new mongoose.model("Product",productSchema);

// export default Product;