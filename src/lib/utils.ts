/**
 * Combines multiple CSS class names into a single clean string.
 */
export function cn(...inputs: (string | boolean | undefined | null | {[key: string]: boolean})[]) {
  const classes: string[] = [];
  inputs.forEach((input) => {
    if (!input) return;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      Object.keys(input).forEach((key) => {
        if (input[key]) {
          classes.push(key);
        }
      });
    }
  });
  return classes.join(' ');
}

/**
 * Formats a number to Indonesian Rupiah (IDR).
 * Example: 150000 -> "Rp 150.000"
 */
export function formatPrice(price: number | bigint): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Cleans a phone number for use in WhatsApp API links.
 * Converts: "+62 812-3456-789" -> "628123456789"
 * If it starts with 0, converts to 62.
 */
export function cleanWhatsAppNumber(number: string): string {
  let cleaned = number.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Converts a text string into an SEO-friendly URL slug.
 * Example: "Akun Mobile Legends Sultan 500 Skin" -> "akun-mobile-legends-sultan-500-skin"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Client beacon to log analytics visits and WhatsApp clicks to Supabase.
 */
export async function trackAnalytics(type: 'page_view' | 'whatsapp_click', productId?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, productId }),
    };

    try {
      // Try with keepalive for page unloading persistence
      await fetch('/api/track', { ...fetchOptions, keepalive: true });
    } catch (keepaliveError) {
      // Fallback to standard fetch if keepalive is rejected or unsupported
      await fetch('/api/track', fetchOptions);
    }
  } catch (error) {
    console.error('Failed to send analytics tracker:', error);
  }
}

/**
 * Adds a semi-transparent watermark text to an image file using HTML5 Canvas.
 */
export async function addWatermarkToImage(file: File, watermarkText: string): Promise<File> {
  if (typeof window === 'undefined') return file;
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Define watermark styling based on image size
        const fontSize = Math.max(14, Math.floor(img.width / 22));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // semi-transparent white
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        // Draw shadow/stroke for readability on light backgrounds
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;

        const padding = Math.max(10, Math.floor(img.width / 40));
        const x = img.width - padding;
        const y = img.height - padding;

        // Draw text stroke then fill
        ctx.strokeText(watermarkText, x, y);
        ctx.fillText(watermarkText, x, y);

        // Convert canvas back to Blob then File
        canvas.toBlob((blob) => {
          if (blob) {
            const watermarkedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(watermarkedFile);
          } else {
            resolve(file);
          }
        }, file.type);
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
