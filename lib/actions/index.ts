"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { generateEmailBody, sendEmail, generateSMSBody, sendSMS } from "../notifier";
import { Types } from "mongoose";
import { ProductType } from "@/types";


export async function addTrackInfoToProduct(productId: string, userEmail: string, userPhone: string, dropPriceFrom: string, dropPriceMode: string, dropPriceValue: string) {
  try {
    await connectToDB();

    const product = await Product.findById(productId);

    if (!product) return;

    // Check if the user already exists (by email)
    const existingUserIndex = product.users.findIndex((user: any) => user.email === userEmail);
    
    if (existingUserIndex !== -1) {
      // Update the existing user's information
      product.users[existingUserIndex] = {
        email: product.users[existingUserIndex].email, // Preserve existing data
        phone: userPhone || product.users[existingUserIndex].phone,
        dropPriceFrom,
        dropPriceMode,
        dropPriceValue,
      };
    } else {
      // Add the user if they don't exist
      product.users.push({
        email: userEmail,
        phone: userPhone,
        dropPriceFrom,
        dropPriceMode,
        dropPriceValue,
      });
    }

    // Save the updated product data
    await product.save();

    // Generate email content and send email notification for new users
    const emailContent = await generateEmailBody(product, "WELCOME");
    await sendEmail(emailContent, [userEmail]);

    // If a phone number was provided, generate SMS content and send an SMS
    if (userPhone) {
      const smsMessage = await generateSMSBody(product, "WELCOME");
      sendSMS(smsMessage, userPhone);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function scrapeAndStoreProduct(productUrl: string): Promise<any> {
  if (!productUrl) return;

  try {
    await connectToDB();

    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) return;
    let product = scrapedProduct;
    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice }
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    await connectToDB();

    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts(): Promise<ProductType[] | undefined> {
  try {
    await connectToDB();

    const products = await Product.find().lean();

    return products.map((product) => ({
      ...product,
      _id: (product._id as Types.ObjectId).toString(), // Convert ObjectId to string
      createdAt: product.createdAt?.toISOString(), // Convert Date to string
      updatedAt: product.updatedAt?.toISOString(),
      priceHistory: product.priceHistory.map((price: any) => ({
        ...price,
        _id: (price._id as Types.ObjectId).toString(),
        date: price.date.toISOString(),
      })),
      url: product.url,
      currency: product.currency,
      image: product.image,
      title: product.title,
      currentPrice: product.currentPrice,
      originalPrice: product.originalPrice,
      highestPrice: product.highestPrice,
      lowestPrice: product.lowestPrice,
      averagePrice: product.averagePrice,
      discountRate: product.discountRate,
      description: product.description,
      category: product.category,
      reviewsCount: product.reviewsCount,
      stars: product.stars,
      isOutOfStock: product.isOutOfStock,
      users: product.users.map((user: any) => {
        const {_id, ...userData} = user;
        return {...userData};
      }),
    }));
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    await connectToDB();

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}





