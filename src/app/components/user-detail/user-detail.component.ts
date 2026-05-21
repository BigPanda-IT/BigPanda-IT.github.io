import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  standalone: false
})
export class UserDetailComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loading = true;
  error = false;
  private updateSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserFromRoute();
    
    this.updateSubscription = this.userService.getUsersUpdated().subscribe(() => {
      this.loadUserFromRoute();
    });
  }

  ngOnDestroy(): void {
    this.updateSubscription?.unsubscribe();
  }

  loadUserFromRoute(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(Number(id));
    } else {
      this.loading = false;
      this.error = true;
    }
  }

  loadUser(id: number): void {
    this.loading = true;

    const localUser = this.userService.getLocalUser(id);
    if (localUser) {
      this.user = localUser;
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.userService.getUser(id).subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки:', err);
        this.loading = false;
        this.error = true;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  goToEdit(): void {
    if (this.user && this.user.id) {
      this.router.navigate(['/user/edit', this.user.id]);
    }
  }

  getAvatarColor(id?: number): string {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    return colors[(id || 1) % colors.length];
  }
}