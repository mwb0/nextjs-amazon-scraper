import { PriceHistoryItem, ProductType, User } from "@/types";

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

// Extracts and returns the price from a list of possible elements.
export function extractPrice(...elements: any) {
  for (const element of elements) {
    const priceText = element.text().trim();
    if(priceText) {
      const cleanPrice = priceText.replace(/[^\d.]/g, '');

      let firstPrice; 

      if (cleanPrice) {
        firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
      } 

      return firstPrice || cleanPrice;
    }
  }

  return '';
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element: any) {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

// Extracts description from two possible elements from amazon
export function extractDescription($: any) {
  // these are possible elements holding description of the product
  const selectors = [
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
    // Add more selectors here if needed
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => $(element).text().trim())
        .get()
        .join("\n");
      return textContent;
    }
  }

  // If no matching elements were found, return an empty string
  return "";
}

export function getHighestPrice(priceList: PriceHistoryItem[]) {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]) {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getNotifyType = (
  scrapedProduct: ProductType,
  currentProduct: ProductType,
  user: User,
) => {

  let currentPrice = 0;

  switch (user.dropPriceFrom) {
    case "current":
      currentPrice = currentProduct.currentPrice || 0;
      break;
    case "average":
      currentPrice = currentProduct.averagePrice || 0;
      break;
    case "highest":
      currentPrice = currentProduct.highestPrice || 0;
      break;
    case "lowest":
      currentPrice = currentProduct.lowestPrice || 0;
      break;
  }
  

  if (user.dropPriceMode === "percentage" && user.dropPriceValue) {
    let dropPriceValue = Number(user.dropPriceValue);

    const originalPrice = scrapedProduct.currentPrice || 0;
    const priceDifference = currentPrice - originalPrice;
    const priceDifferencePercentage = (priceDifference / currentPrice) * 100;

     if (priceDifferencePercentage >= dropPriceValue) {
      return Notification.LOWEST_PRICE as keyof typeof Notification;
    }

  } else if (user.dropPriceMode === "value" && user.dropPriceValue) {
    let dropPriceValue = Number(user.dropPriceValue);

    if (currentPrice - scrapedProduct.currentPrice >= dropPriceValue) {
      return Notification.LOWEST_PRICE as keyof typeof Notification
    }
  }

  return null;
};

export const formatNumber = (num: number = 0) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
