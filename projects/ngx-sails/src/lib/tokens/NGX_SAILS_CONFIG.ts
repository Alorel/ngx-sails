import {InjectionToken} from '@angular/core';
import {NgxSailsConfig} from '../interfaces/NgxSailsConfig';

/** Ngx sails configuration injection token */
export const NGX_SAILS_CONFIG = new InjectionToken<NgxSailsConfig>('NgxSails config');
