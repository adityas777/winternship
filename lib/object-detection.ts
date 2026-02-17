// Object detection utilities and mappings

export interface DetectionResult {
  name: string
  confidence: number
  bbox?: [number, number, number, number] // x, y, width, height
}

// Map common COCO dataset classes to our product inventory
export const COCO_TO_PRODUCT_MAP: Record<string, string> = {
  // Fruits & Vegetables
  apple: "Organic Apples",
  banana: "Organic Bananas",
  orange: "Fresh Oranges",
  broccoli: "Organic Spinach",
  carrot: "Fresh Carrots",

  // Dairy & Beverages
  bottle: "Organic Milk",
  cup: "Greek Yogurt",
  "wine glass": "Premium Juice",

  // Bakery & Grains
  "hot dog": "Whole Wheat Bread", // Sometimes bread is detected as hot dog
  sandwich: "Sourdough Bread",
  donut: "Fresh Pastries",

  // Packaged Goods (using proxy objects)
  book: "Premium Ground Coffee", // Books represent packaged goods
  laptop: "Artisan Pasta", // Electronics represent packaged items
  "cell phone": "Blueberries", // Phone -> small packaged items
  remote: "Cheese Blocks",

  // Meat & Seafood (limited COCO support)
  "dining table": "Fresh Salmon Fillet", // Placeholder

  // Default fallbacks
  person: "Strawberries", // When person detected, suggest popular item
  chair: "Avocados",
  car: "Premium Items", // Large objects -> premium category
}

// Product categories for better mapping
export const PRODUCT_CATEGORIES = {
  FRUITS: ["apple", "banana", "orange"],
  VEGETABLES: ["broccoli", "carrot"],
  DAIRY: ["bottle", "cup"],
  BAKERY: ["hot dog", "sandwich", "donut"],
  PACKAGED: ["book", "laptop", "cell phone", "remote"],
  PREMIUM: ["wine glass", "car"],
}

// Confidence thresholds for different object types
export const CONFIDENCE_THRESHOLDS = {
  FOOD_ITEMS: 0.6,
  PROXY_OBJECTS: 0.7, // Higher threshold for non-food objects
  DEFAULT: 0.65,
}

// Map detected object to product with confidence scoring
export function mapObjectToProduct(detection: DetectionResult): {
  productName: string | null
  mappingConfidence: number
  category: string
} {
  const objectName = detection.name.toLowerCase()
  const productName = COCO_TO_PRODUCT_MAP[objectName]

  if (!productName) {
    return {
      productName: null,
      mappingConfidence: 0,
      category: "unknown",
    }
  }

  // Determine category
  let category = "other"
  for (const [cat, objects] of Object.entries(PRODUCT_CATEGORIES)) {
    if (objects.includes(objectName)) {
      category = cat.toLowerCase()
      break
    }
  }

  // Calculate mapping confidence based on object type and detection confidence
  let mappingConfidence = detection.confidence

  // Reduce confidence for proxy objects (non-food items representing food)
  if (category === "packaged" || !PRODUCT_CATEGORIES.FRUITS.includes(objectName)) {
    mappingConfidence *= 0.8 // Reduce by 20% for proxy mappings
  }

  // Apply category-specific thresholds
  const threshold =
    CONFIDENCE_THRESHOLDS[category.toUpperCase() as keyof typeof CONFIDENCE_THRESHOLDS] || CONFIDENCE_THRESHOLDS.DEFAULT

  if (detection.confidence < threshold) {
    mappingConfidence *= 0.5 // Significantly reduce confidence for low-confidence detections
  }

  return {
    productName,
    mappingConfidence,
    category,
  }
}

// Filter and rank detections for best product match
export function getBestProductMatch(detections: DetectionResult[]): {
  productName: string
  confidence: number
  originalObject: string
} | null {
  const mappedDetections = detections
    .map((detection) => ({
      ...mapObjectToProduct(detection),
      originalObject: detection.name,
      originalConfidence: detection.confidence,
    }))
    .filter((mapped) => mapped.productName !== null)
    .sort((a, b) => b.mappingConfidence - a.mappingConfidence)

  if (mappedDetections.length === 0) {
    return null
  }

  const best = mappedDetections[0]
  return {
    productName: best.productName!,
    confidence: best.mappingConfidence,
    originalObject: best.originalObject,
  }
}

// Simulate object detection (for demo purposes)
export async function simulateObjectDetection(): Promise<DetectionResult[]> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const possibleObjects = Object.keys(COCO_TO_PRODUCT_MAP)
  const numDetections = Math.floor(Math.random() * 3) + 1 // 1-3 objects

  const detections: DetectionResult[] = []

  for (let i = 0; i < numDetections; i++) {
    const randomObject = possibleObjects[Math.floor(Math.random() * possibleObjects.length)]
    const confidence = 0.6 + Math.random() * 0.4 // 60-100% confidence

    detections.push({
      name: randomObject,
      confidence: confidence,
      bbox: [
        Math.floor(Math.random() * 400), // x
        Math.floor(Math.random() * 300), // y
        Math.floor(Math.random() * 200) + 100, // width
        Math.floor(Math.random() * 200) + 100, // height
      ],
    })
  }

  return detections.sort((a, b) => b.confidence - a.confidence)
}
