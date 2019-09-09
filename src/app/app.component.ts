import {Component} from '@angular/core';
import {SailsClient} from '../../projects/ngx-sails/src/lib/SailsClient';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-sails';

  public constructor(public readonly sails: SailsClient) {
  }
}
