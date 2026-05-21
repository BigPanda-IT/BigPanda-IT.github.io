import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router'; 


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})

export class HomeComponent implements OnInit {
  totalUsers = 0;

  constructor(
    private userService: UserService,
    private router: Router  
  ) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      this.totalUsers = users.length;
    });
  }

  goToUsers(): void {
    this.router.navigate(['/users']);
  }

  goToCreate(): void {
    this.router.navigate(['/user/new']);
  }
}