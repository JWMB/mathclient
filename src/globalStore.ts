import { writable } from 'svelte/store';
import { ApiWrapper } from './ApiFacade';

export const apiStore = (() => {
    return new ApiWrapper();
})();
