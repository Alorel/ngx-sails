import {InjectionToken} from '@angular/core';
import type {NgxSailsConfig} from '../interfaces/NgxSailsConfig';

/** Ngx sails configuration injection token */
export const NGX_SAILS_CONFIG = new InjectionToken<NgxSailsConfig>('NgxSails config');
