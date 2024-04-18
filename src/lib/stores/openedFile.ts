import { writable } from 'svelte/store';

export const openedFile = writable<string | null>(null);
