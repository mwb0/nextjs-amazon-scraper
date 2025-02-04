"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazonProduct(url: string): Promise<any> {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  }

  let attempts = 0;
  const maxAttempts = 5;
  let data = null;

  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(url, options);
      const $ = cheerio.load(response.data);

      const title = $('#productTitle').text().trim();
      const currentPrice = extractPrice(
        $('.a-price.aok-align-center span.a-offscreen')
      );
      const originalPrice = extractPrice(
        $('.basisPrice .a-price.a-text-price span.a-offscreen')
      );
      
      // for debugging
      console.log("title", title);
      console.log("originalPrice", originalPrice, "currentPrice", currentPrice);

      if (currentPrice !== "" && originalPrice !== "") {
        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';
        const images = $('#imgBlkFront').attr('data-a-dynamic-image') || 
                        $('#landingImage').attr('data-a-dynamic-image') || '{}';
        const imageUrls = Object.keys(JSON.parse(images));
        const currency = extractCurrency($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
        const description = extractDescription($);

        data = {
          url,
          currency: currency || '$',
          image: imageUrls[0],
          title,
          currentPrice: Number(currentPrice) || Number(originalPrice),
          originalPrice: Number(originalPrice) || Number(currentPrice),
          priceHistory: [],
          discountRate: Number(discountRate),
          category: 'category',
          reviewsCount: 100,
          stars: 4.5,
          isOutOfStock: outOfStock,
          description,
          lowestPrice: Number(currentPrice) || Number(originalPrice),
          highestPrice: Number(originalPrice) || Number(currentPrice),
          averagePrice: Number(currentPrice) || Number(originalPrice),
        };
        break;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Attempt ${attempts + 1} failed:`, error.message);
      } else {
        console.error(`Attempt ${attempts + 1} failed:`, error);
      }
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait before retrying
  }
  
  return data;
}