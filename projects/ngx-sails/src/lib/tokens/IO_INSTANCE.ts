import {InjectionToken} from '@angular/core';

/** User-provided custom socket.io instance */
export const IO_INSTANCE = new InjectionToken<any>('socket.io instance');
