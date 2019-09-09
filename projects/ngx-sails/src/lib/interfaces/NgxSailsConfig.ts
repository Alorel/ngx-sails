import 'socket.io-client';
import {AnyObject} from '../util/AnyObject';

/** Sails socket configuration */
export interface NgxSailsConfig {
  headers?: AnyObject;

  options?: SocketIOClient.ConnectOpts;

  uri?: string;
}
