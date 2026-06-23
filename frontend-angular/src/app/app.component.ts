import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'OnBoardly';
  auth = inject(AuthService);
  router = inject(Router);
  private titleService = inject(Title);

  ngOnInit() {
    this.titleService.setTitle('OnBoardly');
    if (this.auth.isAuthenticated() && this.router.url === '/') {
      this.router.navigate(['/dashboard']);
    }
  }
}
