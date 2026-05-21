import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: false
})

export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  pageIndex = 1;
  pageSize = 10;
  pageSizeOptions = [1, 3, 5, 10, 30, 50, 100]; 
  total = 0;
  searchText = '';
  isModalVisible = false;
  selectedUser: User | null = null;

  constructor(
    private userService: UserService,
    private modal: NzModalService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.userService.getUsersUpdated().subscribe(() => {
      this.users = this.userService.getLocalUsers();
      this.total = this.users.length;
      this.updateDisplay();
      this.cdr.detectChanges();
    });
  }

  loadUsers(): void {
    this.loading = true;

    if (this.userService.getLocalUsers().length === 0) {
      this.userService.getUsers().subscribe({
        next: (data) => {
          this.userService.setLocalUsers(data);
          this.users = this.userService.getLocalUsers();
          this.total = this.users.length;
          this.updateDisplay();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Ошибка:', err);
          this.loading = false;
        }
      });
    } else {
      this.users = this.userService.getLocalUsers();
      this.total = this.users.length;
      this.updateDisplay();
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  updateDisplay(): void {
    let filtered = [...this.users];
    
    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }
    
    this.total = filtered.length;
    const maxPage = Math.ceil(this.total / this.pageSize);

    if (this.pageIndex > maxPage && maxPage > 0) {
      this.pageIndex = maxPage;
    }
    if (this.total === 0) {
      this.pageIndex = 1;
    }
    
    const start = (this.pageIndex - 1) * this.pageSize;
    this.filteredUsers = filtered.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.pageIndex = 1;
    this.updateDisplay();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.updateDisplay();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.updateDisplay();
  }

  goToUserDetail(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/user', id]);
    }
  }

  showUserDetails(user: User): void {
    this.selectedUser = user;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedUser = null;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  trackById(index: number, user: User): number {
    return user.id!;
  }

  getAvatarColor(id?: number): string {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    return colors[(id || 1) % colors.length];
  }

  deleteUser(user: User): void {
    this.modal.confirm({
      nzTitle: '',
      nzContent: `
        <div class="custom-delete-modal">
          <div class="delete-icon">🗑️</div>
          <div class="delete-title">Подтверждение удаления</div>
          <div class="delete-question">Вы действительно хотите удалить пользователя?</div>
          <div class="delete-user-name">${user.name}</div>
          <div class="delete-warning">⚠️ Данное действие невозможно отменить</div>
        </div>
      `,
      nzOkText: 'Да, удалить',
      nzCancelText: 'Отмена',
      nzOkDanger: true,
      nzCentered: true,
      nzWidth: 520,
      nzOnOk: () => {
        this.userService.removeLocalUser(user.id!);
        this.message.success(`✅ ${user.name} успешно удалён`);
        this.userService.deleteUser(user.id!).subscribe();
      }
    });
  }
}