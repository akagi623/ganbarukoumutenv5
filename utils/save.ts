
import { GameState, SaveSlot } from '../types';
import { BASE_SAVE_KEY, MAX_SAVE_SLOTS } from '../constants';

export const getSaveSlotKey = (index: number): string => {
    return `${BASE_SAVE_KEY}-${index}`;
};

export const loadSaveSlots = (): SaveSlot[] => {
    const slots: SaveSlot[] = [];
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
        const key = getSaveSlotKey(i);
        try {
            const savedData = localStorage.getItem(key);
            if (savedData) {
                const gameState = JSON.parse(savedData) as GameState;
                if(gameState.company_name && gameState.game_balance) {
                    slots.push({ slotIndex: i, gameState, exists: true });
                } else {
                    // Data is corrupted or invalid, treat as non-existent
                    slots.push({ slotIndex: i, gameState: null, exists: false });
                }
            } else {
                slots.push({ slotIndex: i, gameState: null, exists: false });
            }
        } catch (error) {
            console.error(`Error loading save slot ${i}:`, error);
            slots.push({ slotIndex: i, gameState: null, exists: false });
        }
    }
    return slots;
};

export const saveGameToSlot = (slotIndex: number, gameState: GameState): void => {
    if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) {
        console.error("Invalid save slot index");
        return;
    }
    const key = getSaveSlotKey(slotIndex);
    localStorage.setItem(key, JSON.stringify(gameState));
};

export const deleteSaveSlot = (slotIndex: number): void => {
    if (slotIndex < 0 || slotIndex >= MAX_SAVE_SLOTS) {
        console.error("Invalid save slot index");
        return;
    }
    const key = getSaveSlotKey(slotIndex);
    localStorage.removeItem(key);
};
