import { NextResponse } from "next/server";

import { getLowestPrice, getHighestPrice, getAveragePrice, getNotifyType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail, generateSMSBody, sendSMS } from "@/lib/notifier";

export const maxDuration = 60; // This function can run for a maximum of 60 seconds
export const dynamic = "force-dynamic";
// export const revalidate = 0;

export async function GET() {
  try {
    connectToDB();

    const products = await Product.find({});

    if (!products) throw new Error("No product fetched");

    // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        // Scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) return;

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          {
            price: scrapedProduct.currentPrice,
          },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update Products in DB
        const updatedProduct = await Product.findOneAndUpdate(
          {
            url: product.url,
          },
          product
        );

        // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY

        updatedProduct.users.map(async (item: any) => {

          const { _id, ...user } = item.toObject();
          const notifyType = getNotifyType(
            scrapedProduct,
            currentProduct,
            user,
          );

          if (notifyType !== null) {
            const productInfo = {
              title: updatedProduct.title,
              url: updatedProduct.url,
              currentPrice: updatedProduct.currentPrice,
            };
            // Construct emailContent
            const emailContent = await generateEmailBody(productInfo, notifyType);

            // Send email notification
            console.log(`Sending email to ${user.email} ${emailContent.body}`);
            await sendEmail(emailContent, user.email);

            // Construct SMS message
            const smsMessage = await generateSMSBody(productInfo, notifyType);

            // Send SMS notification
            console.log(`Sending SMS to ${user.phone} ${smsMessage}`);
            user?.phone && await sendSMS(smsMessage, user.phone);
          }

        });

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error: any) {
    throw new Error(`Failed to get all products: ${error.message}`);
  }
}
