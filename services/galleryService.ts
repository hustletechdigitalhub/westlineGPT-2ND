
import { GalleryItem } from '../types';

const GALLERY_KEY_PREFIX = 'westline_gallery_';

export const galleryService = {
    getGallery: (userEmail: string): GalleryItem[] => {
        try {
            const data = localStorage.getItem(`${GALLERY_KEY_PREFIX}${userEmail}`);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error loading gallery:", e);
            return [];
        }
    },

    saveToGallery: (userEmail: string, item: GalleryItem) => {
        try {
            const currentGallery = galleryService.getGallery(userEmail);
            // Add new item to the beginning
            const updatedGallery = [item, ...currentGallery];
            
            // Limit to last 50 images to prevent LocalStorage quota issues
            if (updatedGallery.length > 50) {
                updatedGallery.length = 50;
            }

            localStorage.setItem(`${GALLERY_KEY_PREFIX}${userEmail}`, JSON.stringify(updatedGallery));
        } catch (e) {
            console.error("Error saving to gallery (likely quota exceeded):", e);
            // Optional: Implement a toast or alert here in a real app
        }
    },

    deleteFromGallery: (userEmail: string, itemId: string): GalleryItem[] => {
        try {
            const currentGallery = galleryService.getGallery(userEmail);
            const updatedGallery = currentGallery.filter(item => item.id !== itemId);
            localStorage.setItem(`${GALLERY_KEY_PREFIX}${userEmail}`, JSON.stringify(updatedGallery));
            return updatedGallery;
        } catch (e) {
            console.error("Error deleting from gallery:", e);
            return [];
        }
    }
};
